const express = require("express");
const router = express.Router();
const Checkin = require("../models/Checkin");
const { checkinUser, checkoutUser, deleteCheckin } = require("../controllers/checkinController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Protected endpoint - create checkin
router.post("/", protect, restrictTo("admin", "receptionist", "client"), checkinUser);

// Protected endpoint - list checkins
router.get("/", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  try {
    const checkins = await Checkin.find().sort({ checkinTime: -1 }).populate("user", "firstName lastName email");
    res.json(checkins);
  } catch (err) {
    console.error("Get checkins error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected checkout
router.put("/:id/checkout", protect, restrictTo("admin", "receptionist", "client"), checkoutUser);

// Protected delete
router.delete("/:id", protect, restrictTo("admin", "receptionist"), deleteCheckin);

module.exports = router;
