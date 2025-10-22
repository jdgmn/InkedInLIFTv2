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
router.get("/expiring", protect, restrictTo("admin"), getExpiringMemberships);

router.get(
  "/dashboard/view",
  protect,
  restrictTo("admin"),
  async (req, res) => {
    const fetch = (await import("node-fetch")).default;
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    const [statsRes, expiringRes] = await Promise.all([
      fetch(`${baseUrl}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${req.token}` },
      }),
      fetch(`${baseUrl}/api/analytics/expiring`, {
        headers: { Authorization: `Bearer ${req.token}` },
      }),
    ]);

    const stats = await statsRes.json();
    const expiringMemberships = await expiringRes.json();

    res.render("dashboard", { stats, expiringMemberships });
  }
);

module.exports = router;
