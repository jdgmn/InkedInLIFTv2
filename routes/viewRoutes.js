const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");

// Public pages
router.get("/", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Dashboard view (public for dev)
router.get("/dashboard", async (req, res) => {
  res.render("dashboard");
});

// Users page (public for dev)
router.get("/users", async (req, res) => {
  const users = await User.find().select("firstName lastName email role");
  res.render("users", { users });
});

// Memberships (public for dev)
router.get("/memberships", async (req, res) => {
  const memberships = await Membership.find().populate(
    "user",
    "firstName lastName email"
  );
  res.render("memberships", { memberships });
});

// Check-ins (public for dev)
router.get("/checkins", async (req, res) => {
  const checkins = await Checkin.find().populate(
    "user",
    "firstName lastName email"
  );
  res.render("checkins", { checkins });
});

// Self check-in page (public)
router.get("/selfcheckin", (req, res) => {
  res.render("selfcheckin");
});

module.exports = router;
