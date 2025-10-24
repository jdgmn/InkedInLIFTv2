const express = require("express");
const router = express.Router();
const Checkin = require("../models/Checkin");
const { checkinUser, deleteCheckin } = require("../controllers/checkinController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Public endpoint - create checkin
router.post("/", checkinUser);

// Public endpoint - list checkins (dev-friendly)
router.get("/", async (req, res) => {
  try {
    const checkins = await Checkin.find().sort({ checkinTime: -1 }).populate("user", "firstName lastName email");
    res.json(checkins);
  } catch (err) {
    console.error("Get checkins (public) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected delete
router.delete("/:id", protect, restrictTo("admin"), deleteCheckin);

module.exports = router;
