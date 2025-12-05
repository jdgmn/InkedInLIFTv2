const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createMembership,
  getMemberships,
  updateMembership,
  deleteMembership,
  getMembershipRates,
  updateMembershipRates,
} = require("../controllers/membershipController");

// Membership rates (admin only)
router.get("/rates", protect, restrictTo("admin"), getMembershipRates);
router.put("/rates", protect, restrictTo("admin"), updateMembershipRates);

// Protected endpoints
router.post("/", protect, restrictTo("admin", "receptionist"), createMembership);
router.get("/", protect, restrictTo("admin", "receptionist"), getMemberships);
router.put("/:id", protect, restrictTo("admin", "receptionist"), updateMembership);
router.delete("/:id", protect, restrictTo("admin", "receptionist"), deleteMembership);

module.exports = router;
