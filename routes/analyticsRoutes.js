const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getWeeklyCheckins,
  getExpiringMemberships,
  // new exports
  getRevenueSummary,
  getRevenueByPlan,
  getMRR,
  getChurnRate,
  getRevenueLast30Days,
  getNewMembersLast30Days,
} = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Admin-only routes
router.get("/dashboard", protect, restrictTo("admin"), getDashboardStats);
router.get("/weekly-checkins", protect, restrictTo("admin"), getWeeklyCheckins);
router.get("/expiring", protect, restrictTo("admin", "receptionist"), getExpiringMemberships);

// New financial/engagement endpoints (admin)
router.get("/revenue", protect, restrictTo("admin"), getRevenueSummary);
router.get("/revenue-by-plan", protect, restrictTo("admin"), getRevenueByPlan);
router.get("/mrr", protect, restrictTo("admin"), getMRR);
router.get("/revenue-30d", protect, restrictTo("admin"), getRevenueLast30Days);
router.get("/new-members-30d", protect, restrictTo("admin"), getNewMembersLast30Days);
router.get("/churn", protect, restrictTo("admin"), getChurnRate);

module.exports = router;
