const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Not required for Google users
  adhaarNumber: { type: String, unique: true, required: true },
  picture: String,
  source: { type: String, required: true }, // 'email' or 'google'
  role: { type: String, default: "user" },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joined_date: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.correctPassword = async function (candidate, hash) {
  return bcrypt.compare(candidate, hash);
};

module.exports = mongoose.model("User", UserSchema);
