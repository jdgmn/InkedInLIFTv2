const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const validateRequest = require("../validators/validateRequest");
const { register, login, forgot, reset } = require("../validators/userValidators");

// Public routes
router.post("/register", register, validateRequest, registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", login, validateRequest, loginUser);
router.post("/forgot", forgot, validateRequest, forgotPassword);
router.post("/reset/:token", reset, validateRequest, resetPassword);

module.exports = router;
