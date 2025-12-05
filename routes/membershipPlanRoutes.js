const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  getMembershipPlans,
  getMembershipPlan,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
} = require("../controllers/membershipPlanController");

// Public routes for viewing plans (for membership forms)
router.get("/plans", async (req, res) => {
  const MembershipPlan = require("../models/MembershipPlan");
  try {
    const plans = await MembershipPlan.find(
      { isActive: true },
      "name description price duration allowedUsers"
    ).sort({ sortOrder: 1, name: 1 });
    res.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin only routes
router.use(protect, restrictTo("admin"));

router.get("/", getMembershipPlans);
router.get("/:id", getMembershipPlan);
router.post("/", createMembershipPlan);
router.put("/:id", updateMembershipPlan);
router.delete("/:id", deleteMembershipPlan);

module.exports = router;
