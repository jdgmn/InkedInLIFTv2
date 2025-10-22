const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../config/email");

// Helper: create JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER (with verification email)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const roleToAssign =
      req.user && req.user.role === "admin" && req.body.role
        ? req.body.role
        : "client";

    const user = new User({
      email,
      firstName,
      lastName,
      role: roleToAssign,
      verificationToken,
    });

    await user.setPassword(password);
    await user.save();

    const verifyLink = `${process.env.BASE_URL}/api/users/verify/${verificationToken}`;
    await sendEmail(
      email,
      "Verify Your Email - InkedInLIFTv2",
      `<p>Hi ${firstName || ""}, please verify your email:</p>
      <a href="${verifyLink}">${verifyLink}</a>`
    );

    res
      .status(201)
      .json({
        message:
          "User registered! Please check your email to verify your account.",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.verifyPassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    if (!user.verified)
      return res.status(403).json({ error: "Please verify your email first" });

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    await user.save();

    const resetLink = `${process.env.BASE_URL}/api/users/reset/${resetToken}`;
    await sendEmail(
      email,
      "Password Reset - InkedInLIFTv2",
      `<p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>`
    );

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetToken: token });
    if (!user) return res.status(400).json({ error: "Invalid token" });

    await user.setPassword(password);
    user.resetToken = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
