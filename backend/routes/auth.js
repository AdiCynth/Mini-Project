const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role, phone, organization_name, address, lat, lng } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name, and role are required." });
    }

    if (!["donor", "receiver"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'donor' or 'receiver'." });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userData = { email, password_hash, name, role, phone, organization_name, address };
    
    // Add geospatial data if provided
    if (lat && lng) {
      userData.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB expects [longitude, latitude]
      };
    }

    user = await User.create(userData);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, organization_name: user.organization_name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, organization_name: user.organization_name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
