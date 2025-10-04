import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";

// Define your backend URL
const API_URL = "http://localhost:5000/api/auth";

const Register = ({ setUser }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    adhaarNumber: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    
    if (token && user) {
      // User is already logged in, redirect to profile
      console.log("User already logged in, redirecting to profile");
      navigate("/profile");
    }
  }, [navigate]);

  // Handle Google OAuth Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google OAuth success:", credentialResponse);
      setLoading(true);
      setError("");

      // Send the Google credential to backend for verification
      const response = await axios.post(`${API_URL}/google-register`, {
        credential: credentialResponse.credential
      });

      console.log("Backend response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store authentication data
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        
        // Update the user state
        setUser(user);
        
        console.log("Google registration successful, redirecting to profile");
        
        // Navigate to profile page
        navigate("/profile");
      } else {
        setError(response.data.message || "Google registration failed");
      }
    } catch (error) {
      console.error("Google registration error:", error);
      setError(error.response?.data?.message || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Error
  const handleGoogleError = () => {
    console.error("Google OAuth failed");
    setError("Google authentication failed. Please try again.");
  };

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Manual Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    // Basic client-side validation (backend also validates)
    if (!form.name || !form.username || !form.adhaarNumber || !form.email || !form.password) {
      setError("Please fill all fields.");
      setLoading(false); // Stop loading immediately
      return;
    }
    if (form.password.length < 6) { // Match backend validation
         setError("Password must be at least 6 characters long.");
         setLoading(false);
         return;
    }

    try {
      // Send registration data to your backend register endpoint
      // The backend schema will automatically apply the default role "user"
      const response = await axios.post(`${API_URL}/register`, form);

      const { token, user } = response.data; // Backend provides the user object with the role

      // Store token and user data in session storage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // Update parent component state
      if (setUser) setUser(user);

      // Navigate to profile page
      navigate("/profile");

    } catch (err) {
      console.error("Registration Error:", err.response ? err.response.data : err.message);
      // Display error message from backend or a generic one
      setError(err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : "Registration failed. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            disabled={loading} // Disable input while loading
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            disabled={loading} // Disable input while loading
          />
          <input
            type="text" // Use text for better input control validation (pattern)
            name="adhaarNumber"
            placeholder="Aadhaar Number (12 digits)" // Add hint
            value={form.adhaarNumber}
            onChange={handleChange}
            inputMode="numeric" // Hint for mobile keyboards
            pattern="[0-9]{12}" // Enforce 12 digits
            maxLength={12} // Prevent typing more than 12
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            disabled={loading} // Disable input while loading
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" // Basic email pattern
            maxLength={254} // Max length for emails
            required
            disabled={loading} // Disable input while loading
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)" // Add hint
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            minLength={6} // Client-side min length hint
            disabled={loading} // Disable input while loading
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white font-semibold py-2 rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Registering..." : "Register"} {/* Change button text */}
          </button>
        </form>
        <div className="my-6 text-center text-gray-500 dark:text-gray-400">or</div>
        
        {/* Google OAuth Register Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text="signup_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
            disabled={loading}
          />
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;