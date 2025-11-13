const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");

// Public pages
router.get("/", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Protected pages with role-based access
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Analytics (admin only)
router.get("/analytics", protect, restrictTo("admin"), async (req, res) => {
  res.render("dashboard");
});

// Users page (admin and receptionist)
router.get("/users", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const users = await User.find().select("firstName lastName email role");
  res.render("users", { users });
});

// Memberships (admin and receptionist)
router.get("/memberships", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  const memberships = await Membership.find().populate(
    "user",
    "firstName lastName email"
  );
  res.render("memberships", { memberships });
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

// Dashboard redirect for receptionist
router.get("/dashboard", protect, async (req, res) => {
  if (req.user.role === "receptionist") {
    res.redirect("/users");
  } else {
    res.redirect("/analytics");
  }
});

// Bypass verification page (public for dev)
router.get("/bypass-verification", (req, res) => {
  res.render("bypass");
});

module.exports = router;
