const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const User = require("../models/User");

// GET overall stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMembers = await Membership.countDocuments();
    const totalCheckins = await Checkin.countDocuments();

    const activeMemberships = await Membership.countDocuments({
      endDate: { $gte: new Date() },
    });

    res.json({
      totalUsers,
      totalMembers,
      totalCheckins,
      activeMemberships,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching dashboard stats" });
  }
};

// GET check-ins by day (past 7 days)
exports.getWeeklyCheckins = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await Checkin.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching check-in stats" });
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
    }).populate("userId", "firstName lastName email");

    res.json(expiring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching expiring memberships" });
  }
};
