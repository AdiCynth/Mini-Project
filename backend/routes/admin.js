const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select("-password_hash").sort({ created_at: -1 });
    res.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.patch("/users/:id/verify", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { is_verified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { is_verified: !!is_verified }, 
      { new: true }
    ).select("-password_hash");

    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({ message: `User verification updated`, user });
  } catch (err) {
    console.error("Verify user error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
