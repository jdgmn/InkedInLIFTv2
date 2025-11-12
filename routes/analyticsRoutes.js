const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getWeeklyCheckins,
  getExpiringMemberships,
  getRevenueSummary,
  getRevenueByPlan,
  getMRR,
  getChurnRate,
  getRevenueLast30Days,
  getNewMembersLast30Days,
  getPeakHours,
  getMembershipTrends,
  getUserGrowth,
  getCheckinPatterns,
  getMembershipDistribution,
  getAverageSessions,
  getRevenueForecast,
} = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Admin-only routes
router.get("/dashboard", protect, restrictTo("admin"), getDashboardStats);
router.get("/weekly-checkins", protect, restrictTo("admin"), getWeeklyCheckins);
router.get("/expiring", protect, restrictTo("admin", "receptionist"), getExpiringMemberships);

// Financial analytics (admin)
router.get("/revenue", protect, restrictTo("admin"), getRevenueSummary);
router.get("/revenue-by-plan", protect, restrictTo("admin"), getRevenueByPlan);
router.get("/mrr", protect, restrictTo("admin"), getMRR);
router.get("/revenue-30d", protect, restrictTo("admin"), getRevenueLast30Days);
router.get("/revenue-forecast", protect, restrictTo("admin"), getRevenueForecast);

// User and membership analytics (admin)
router.get("/new-members-30d", protect, restrictTo("admin"), getNewMembersLast30Days);
router.get("/churn", protect, restrictTo("admin"), getChurnRate);
router.get("/membership-trends", protect, restrictTo("admin"), getMembershipTrends);
router.get("/membership-distribution", protect, restrictTo("admin"), getMembershipDistribution);
router.get("/user-growth", protect, restrictTo("admin"), getUserGrowth);

// Check-in analytics (admin)
router.get("/peak-hours", protect, restrictTo("admin"), getPeakHours);
router.get("/checkin-patterns", protect, restrictTo("admin"), getCheckinPatterns);
router.get("/average-sessions", protect, restrictTo("admin"), getAverageSessions);

module.exports = router;
