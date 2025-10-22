const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { createMembership, getMemberships } = require("../controllers/membershipController");

router.post("/", protect, restrictTo("admin", "receptionist"), createMembership);
router.get("/", protect, restrictTo("admin", "receptionist"), getMemberships);

module.exports = router;
