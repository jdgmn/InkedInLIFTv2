const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Dashboard
router.get("/dashboard", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const stats = {
    totalUsers: await User.countDocuments(),
    totalMembers: await Membership.countDocuments(),
    totalCheckins: await Checkin.countDocuments(),
    activeMemberships: await Membership.countDocuments({ status: "active" }),
  };
  res.render("dashboard", { stats });
});

// Users page
router.get("/users", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const users = await User.find();
  res.render("users", { users });
});

// Memberships
router.get("/memberships", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const memberships = await Membership.find().populate("userId");
  res.render("memberships", { memberships });
});

// Check-ins
router.get("/checkins", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const checkins = await Checkin.find().populate("userId");
  res.render("checkins", { checkins });
});

module.exports = router;
