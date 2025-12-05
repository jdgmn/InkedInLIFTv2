const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const MembershipPlan = require("../models/MembershipPlan");

// Public pages
router.get("/", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Protected pages with role-based access
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Analytics (admin only)
router.get("/analytics", protect, restrictTo("admin"), async (req, res) => {
  res.render("dashboard");
});

// Users page (admin and receptionist) with pagination
router.get("/users", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find()
    .select("firstName lastName email role verified createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.render("users", { users, pagination });
});

// Memberships (admin and receptionist) with pagination
router.get("/memberships", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Membership.countDocuments();
  const memberships = await Membership.find()
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.render("memberships", { memberships, pagination });
});

// Membership Plans (admin only)
router.get("/membership-plans", protect, restrictTo("admin"), async (req, res) => {
  const plans = await MembershipPlan.find().sort({ sortOrder: 1, name: 1 });
  res.render("membership-plans", { plans });
});

// Check-ins (admin and receptionist)
router.get("/checkins", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const checkins = await Checkin.find().populate(
    "user",
    "firstName lastName email"
  );
  res.render("checkins", { checkins });
});

// Self check-in page (admin, receptionist, client)
router.get("/selfcheckin", protect, restrictTo("admin", "receptionist", "client"), (req, res) => {
  res.render("selfcheckin");
});

// Profile page (admin, receptionist, client)
router.get("/profile", protect, restrictTo("admin", "receptionist", "client"), (req, res) => {
  res.render("profile");
});

// Dashboard redirect based on role
router.get("/dashboard", protect, async (req, res) => {
  if (req.user.role === "receptionist") {
    res.redirect("/users");
  } else if (req.user.role === "client") {
    res.render("customer-dashboard");
  } else {
    res.redirect("/analytics");
  }
});

// Bypass verification page (public for dev)
router.get("/bypass-verification", (req, res) => {
  res.render("bypass");
});

// Email verification page
router.get("/verify/:token", (req, res) => {
  res.render("verify");
});

module.exports = router;
