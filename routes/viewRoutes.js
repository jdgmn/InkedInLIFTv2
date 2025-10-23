const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Public pages
router.get("/", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Dashboard view (no server-side protect)
router.get("/dashboard", async (req, res) => {
  res.render("dashboard");
});

// Users page
router.get(
  "/users",
  protect,
  restrictTo("admin", "receptionist"),
  async (req, res) => {
    const users = await User.find().select("firstName lastName email role");
    res.render("users", { users });
  }
);

// Memberships
router.get(
  "/memberships",
  protect,
  restrictTo("admin", "receptionist"),
  async (req, res) => {
    const memberships = await Membership.find().populate(
      "user",
      "firstName lastName email"
    );
    res.render("memberships", { memberships });
  }
);

// Check-ins
router.get(
  "/checkins",
  protect,
  restrictTo("admin", "receptionist"),
  async (req, res) => {
    const checkins = await Checkin.find().populate(
      "user",
      "firstName lastName email"
    );
    res.render("checkins", { checkins });
  }
);

module.exports = router;
