const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getWeeklyCheckins,
  getExpiringMemberships,
} = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Admin-only routes
router.get("/dashboard", protect, restrictTo("admin"), getDashboardStats);
router.get("/weekly-checkins", protect, restrictTo("admin"), getWeeklyCheckins);
router.get("/expiring", protect, restrictTo("admin", "receptionist"), getExpiringMemberships);

module.exports = router;
