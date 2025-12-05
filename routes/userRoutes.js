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
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  getUnverifiedUsers,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Public: list users (dev-friendly) with optional pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("firstName lastName email role verified createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(users);
  } catch (err) {
    console.error("Get users (public) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin create (protected) - POST /api/users
router.post("/", protect, restrictTo("admin", "receptionist"), adminCreateUser);

// Public registration remains at /api/users/register
router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

// Admin/receptionist update and delete user routes
router.put("/:id", protect, restrictTo("admin", "receptionist"), updateUser);
router.delete("/:id", protect, restrictTo("admin", "receptionist"), deleteUser);

// Get current user info (for role-based UI)
router.get("/me", protect, getCurrentUser);

// Update current user info (clients can update themselves)
router.put("/me", protect, updateCurrentUser);

// Get unverified users (for bypass page)
router.get("/unverified", getUnverifiedUsers);

module.exports = router;
