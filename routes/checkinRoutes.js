const express = require("express");
const router = express.Router();
const Checkin = require("../models/Checkin");
const { checkinUser, checkoutUser } = require("../controllers/checkinController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Protected endpoint - create checkin
router.post("/", protect, restrictTo("admin", "receptionist", "client"), checkinUser);

// Protected endpoint - list checkins with pagination and filters
router.get("/", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filter = {};
    if (req.query.startDate) {
      filter.checkinTime = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      if (filter.checkinTime) {
        filter.checkinTime.$lte = new Date(req.query.endDate);
      } else {
        filter.checkinTime = { $lte: new Date(req.query.endDate) };
      }
    }
    if (req.query.active === 'true') {
      filter.checkoutTime = null;
    } else if (req.query.active === 'false') {
      filter.checkoutTime = { $ne: null };
    }

    const total = await Checkin.countDocuments(filter);
    const checkins = await Checkin.find(filter)
      .sort({ checkinTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "firstName lastName email");

    res.json({
      checkins,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Get checkins error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected checkout
router.put("/:id/checkout", protect, restrictTo("admin", "receptionist"), checkoutUser);

// Protected delete checkin
router.delete("/:id", protect, restrictTo("admin", "receptionist"), async (req, res) => {
  try {
    const { id } = req.params;

    const checkin = await Checkin.findByIdAndDelete(id);
    if (!checkin) {
      return res.status(404).json({ error: "Checkin not found" });
    }

    res.json({ message: "Checkin deleted successfully" });
  } catch (error) {
    console.error("Delete checkin error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
