const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

// Example of a protected admin-only route
router.get("/all", protect, restrictTo("admin"), async (req, res) => {
  const users = await require("../models/User").find().select("-passwordHash");
  res.json(users);
});

module.exports = router;
