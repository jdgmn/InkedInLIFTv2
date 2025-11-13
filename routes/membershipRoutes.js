const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createMembership,
  getMemberships,
  updateMembership,
  deleteMembership,
} = require("../controllers/membershipController");

// Protected endpoints
router.post("/", protect, restrictTo("admin", "receptionist"), createMembership);
router.get("/", protect, restrictTo("admin", "receptionist"), getMemberships);
router.put("/:id", protect, restrictTo("admin", "receptionist"), updateMembership);
router.delete("/:id", protect, restrictTo("admin", "receptionist"), deleteMembership);

module.exports = router;
