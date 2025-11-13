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

// Helper: validate password strength
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

// Helper: validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// REGISTER (with verification email)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, verified } = req.body;

    if (!email || !firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "email, firstName and lastName are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Determine role
    const roleToAssign =
      req.user && (req.user.role === "admin" || req.user.role === "receptionist") && req.body.role
        ? req.body.role
        : "client";

    // Password is required unless role is client
    if (roleToAssign !== "client" && !password) {
      return res.status(400).json({ error: "Password is required for non-client roles" });
    }

    // Validate password strength if provided
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const verificationToken = crypto.randomBytes(20).toString("hex");

    const user = new User({
      email,
      firstName,
      lastName,
      role: roleToAssign,
      verificationToken,
      verified: req.user && (req.user.role === "admin" || req.user.role === "receptionist") ? (verified !== undefined ? verified : false) : false,
      createdBy: req.user ? req.user._id : null,
    });

    // Set password only if provided
    if (password) {
      await user.setPassword(password);
    }
    await user.save();

    // Skip email verification if created by admin/receptionist and verified is true
    if (req.user && (req.user.role === "admin" || req.user.role === "receptionist") && verified) {
      user.verificationToken = undefined;
      await user.save();
      return res.json({ message: "User created successfully" });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const verifyLink = `${baseUrl}/api/users/verify/${verificationToken}`;

    try {
      await sendEmail(
        email,
        "Verify Your Email - InkedInLIFTv2",
        `<p>Hi ${firstName || ""}, please verify your email by clicking the link below:</p>
         <p><a href="${verifyLink}">${verifyLink}</a></p>`
      );
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    res.status(201).json({
      message: "User registered! Please check your email to verify your account.",
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

    if (user.verified) {
      user.verificationToken = undefined;
      await user.save();
      return res.json({ message: "Email already verified." });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

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
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const resetLink = `${baseUrl}/api/users/reset/${resetToken}`;
    try {
      await sendEmail(
        email,
        "Password Reset - InkedInLIFTv2",
        `<p>Click below to reset your password (link valid for 1 hour):</p>
         <p><a href="${resetLink}">${resetLink}</a></p>`
      );
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ error: "Password is required" });

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    const user = await User.findOne({ resetToken: token });
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    if (user.resetTokenExpiry && user.resetTokenExpiry < Date.now()) {
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return res.status(400).json({ error: "Reset token expired" });
    }

    await user.setPassword(password);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin create user (allows setting role, auto-verified)
exports.adminCreateUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !firstName || !lastName)
      return res.status(400).json({ error: "email, firstName and lastName are required" });

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password is required unless role is client
    const roleToAssign = role || "client";
    if (roleToAssign !== "client" && !password) {
      return res.status(400).json({ error: "Password is required for non-client roles" });
    }

    // Validate password strength if provided
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const user = new User({
      email,
      firstName,
      lastName,
      role: roleToAssign,
      verified: true, // admin-created => verified
    });

    // Set password only if provided
    if (password) {
      await user.setPassword(password);
    }
    await user.save();

    res.status(201).json({ message: "User created by admin", user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE user (admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, verified, password } = req.body;
    
    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (verified !== undefined) updates.verified = verified;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update password if provided
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }
      await user.setPassword(password);
    }

    // Apply other updates
    Object.assign(user, updates);
    user.updatedBy = req.user ? req.user._id : null;
    await user.save();

    const updatedUser = await User.findById(id).select("-passwordHash -__v");
    res.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET current user info (for role-based UI)
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      verified: req.user.verified
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET unverified users (for bypass page)
exports.getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ verified: false }).select("firstName lastName email verificationToken");
    res.json(users);
  } catch (error) {
    console.error("Get unverified users error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
