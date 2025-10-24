const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  adminCreateUser,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Public: list users (dev-friendly)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName email role verified createdAt");
    res.json(users);
  } catch (err) {
    console.error("Get users (public) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin create (protected) - POST /api/users
router.post("/", protect, restrictTo("admin"), adminCreateUser);

// Public registration remains at /api/users/register
router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

module.exports = router;
