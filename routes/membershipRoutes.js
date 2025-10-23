const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createMembership,
  getMemberships,
  deleteMembership,
} = require("../controllers/membershipController");
const validateRequest = require("../validators/validateRequest");
const { createMembership: createMembershipValidator } = require("../validators/membershipValidators");

// Protected endpoints
router.post(
  "/",
  protect,
  restrictTo("admin", "receptionist"),
  createMembershipValidator,
  validateRequest,
  createMembership
);
router.get("/", protect, restrictTo("admin", "receptionist"), getMemberships);
router.delete("/:id", protect, restrictTo("admin"), deleteMembership);

module.exports = router;
