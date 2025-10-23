const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const User = require("../models/User");

// GET overall stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMembers = await Membership.countDocuments({ status: "active" });
    const totalCheckins = await Checkin.countDocuments();
    res.json({ totalUsers, totalMembers, totalCheckins });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET check-ins by day (past 7 days)
exports.getWeeklyCheckins = async (req, res) => {
  try {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 6); // 7 days inclusive

    const pipeline = [
      { $match: { checkinTime: { $gte: past, $lte: today } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$checkinTime" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const rows = await Checkin.aggregate(pipeline);
    res.json(rows);
  } catch (error) {
    console.error("Weekly checkins error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET memberships expiring in next 7 days
exports.getExpiringMemberships = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const expiring = await Membership.find({
      endDate: { $gte: today, $lte: nextWeek },
    }).populate("user", "firstName lastName email");

    res.json(expiring);
  } catch (error) {
    console.error("Expiring memberships error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
