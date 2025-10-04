require('dotenv').config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { OAuth2Client } = require("google-auth-library");
const crypto = require('crypto');
const { protect } = require('../controllers/authController');
const adminAuth = require('../middlewares/adminAuth');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  console.error("Please ensure you have a .env file with JWT_SECRET and are loading dotenv early in your main server file.");
  process.exit(1);
} else {
  console.log("JWT_SECRET loaded");
}

if (!GOOGLE_CLIENT_ID) {
  console.error("FATAL ERROR: GOOGLE_CLIENT_ID is not defined in environment variables.");
  console.error("Please ensure you have a .env file with GOOGLE_CLIENT_ID and are loading dotenv early in your main server file.");
  process.exit(1);
} else {
  console.log("GOOGLE_CLIENT_ID loaded:");
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const signToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, source: user.source }, JWT_SECRET, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
  try {
    const { name, username, adhaarNumber, email, password } = req.body;

    if (!name || !username || !adhaarNumber || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { adhaarNumber }],
    });

    if (existingUser) {
      let errorMessage = "User already exists with this ";
      if (existingUser.email === email) errorMessage += "email.";
      else if (existingUser.username === username) errorMessage += "username.";
      else if (existingUser.adhaarNumber === adhaarNumber) errorMessage += "Aadhaar number.";
      else errorMessage = "User with provided details already exists.";
      return res.status(409).json({ message: errorMessage });
    }

    const user = await User.create({
      name,
      username,
      adhaarNumber,
      email,
      password,
      source: "email",
    });

    const token = signToken(user);
    res.status(201).json({ token, user, message: "Registration successful." });

  } catch (err) {
    console.error("Registration Error:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation failed.", errors: err.errors });
    }
    res.status(500).json({ message: "Server error during registration." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials. User not found." });
    }

    if (user.source === "google" && !user.password) {
      return res.status(401).json({ message: "This account was created using Google. Please sign in with Google." });
    }

    if (!user.password) {
      console.error(`User ${email} found but has no password field.`);
      return res.status(401).json({ message: "Invalid credentials or account configuration issue." });
    }

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Password mismatch." });
    }

    const token = signToken(user);
    res.status(200).json({ token, user, message: "Login successful." });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No Google credential (ID token) provided." });
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verificationError) {
      console.error("Google ID Token verification failed:", verificationError.message, verificationError);
      return res.status(401).json({ message: "Invalid Google token. Verification failed." });
    }

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Could not extract payload from Google token." });
    }

    const { email, name, picture, given_name, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified." });
    }
    if (!email) {
      return res.status(400).json({ message: "Email not found in Google token payload." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      let baseUsername = given_name || email.split("@")[0];
      let potentialUsername = baseUsername;
      let usernameExists = await User.findOne({ username: potentialUsername });
      let counter = 1;

      while (usernameExists) {
        potentialUsername = `${baseUsername}${counter}`;
        usernameExists = await User.findOne({ username: potentialUsername });
        counter++;
        if (counter > 100) {
          console.error("Failed to generate a unique username after 100 attempts.");
          return res.status(500).json({ message: "Could not generate a unique username." });
        }
      }

      user = await User.create({
        name: name || "User",
        username: potentialUsername,
        adhaarNumber: `google_${email.split("@")[0]}_${crypto.randomBytes(4).toString('hex')}`,
        email,
        picture,
        source: "google",
      });
    } else {
      if (user.source !== "google" || !user.picture || user.name !== name) {
        user.source = "google";
        user.picture = picture || user.picture;
        user.name = name || user.name;
        if (user.isModified()) {
          await user.save();
        }
      }
    }

    const token = signToken(user);
    res.status(200).json({ token, user, message: "Google authentication successful." });

  } catch (err) {
    console.error("Google Auth Error:", err.message, err);
    res.status(500).json({ message: "Server error during Google authentication." });
  }
});

router.get("/getallusers", adminAuth(['super_admin', 'node_admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });

  } catch (err) {
    console.error("Error fetching all users:", err.message, err);
    res.status(500).json({
      status: 'error',
      message: "Server error fetching users."
    });
  }
});

// Update Profile Route
router.put("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authorization required" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { name } = req.body;  
    user.name = name || user.name;
    
    const updatedUser = await user.save();
    const userData = updatedUser.toObject();
    delete userData.password;

    res.status(200).json({ 
      message: "Profile updated successfully",
      user: userData
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error during profile update" });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authorization required" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching user." });
  }
});

// Test route to verify token authentication
router.get("/verify-token", protect, async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: "Token is valid", 
      user: req.user 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during token verification." });
  }
});

module.exports = router;
