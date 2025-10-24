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

// Revenue summary (total revenue from paid memberships)
exports.getRevenueSummary = async (req, res) => {
  try {
    const pipeline = [
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          paidCount: { $sum: 1 },
          avgPrice: { $avg: "$price" },
        },
      },
    ];
    const out = (await Membership.aggregate(pipeline))[0] || {
      totalRevenue: 0,
      paidCount: 0,
      avgPrice: 0,
    };
    res.json(out);
  } catch (error) {
    console.error("Revenue summary error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Revenue by plan
exports.getRevenueByPlan = async (req, res) => {
  try {
    const pipeline = [
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: "$membershipType",
          revenue: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ];
    const rows = await Membership.aggregate(pipeline);
    res.json(rows);
  } catch (error) {
    console.error("Revenue by plan error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Monthly Recurring Revenue (MRR) estimate
// monthly: price
// quarterly: price / 3
// annual: price / 12
exports.getMRR = async (req, res) => {
  try {
    const pipeline = [
      { $match: { status: "active", paymentStatus: "paid" } },
      {
        $addFields: {
          periodMonths: {
            $switch: {
              branches: [
                { case: { $eq: ["$membershipType", "monthly"] }, then: 1 },
                { case: { $eq: ["$membershipType", "quarterly"] }, then: 3 },
                { case: { $eq: ["$membershipType", "annual"] }, then: 12 },
              ],
              default: 1,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          mrr: { $sum: { $divide: ["$price", "$periodMonths"] } },
          activeCount: { $sum: 1 },
        },
      },
    ];

    const out = (await Membership.aggregate(pipeline))[0] || { mrr: 0, activeCount: 0 };
    res.json(out);
  } catch (error) {
    console.error("MRR error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Revenue in last 30 days (by membership startDate)
exports.getRevenueLast30Days = async (req, res) => {
  try {
    const now = new Date();
    const past30 = new Date(now);
    past30.setDate(now.getDate() - 30);

    const pipeline = [
      { $match: { paymentStatus: "paid", startDate: { $gte: past30, $lte: now } } },
      {
        $group: {
          _id: null,
          revenue30d: { $sum: "$price" },
          newMembers30d: { $sum: 1 },
        },
      },
    ];

    const out = (await Membership.aggregate(pipeline))[0] || { revenue30d: 0, newMembers30d: 0 };
    res.json(out);
  } catch (error) {
    console.error("Revenue last 30 days error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// New members in last 30 days (separate endpoint if needed)
exports.getNewMembersLast30Days = async (req, res) => {
  try {
    const now = new Date();
    const past30 = new Date(now);
    past30.setDate(now.getDate() - 30);

    const count = await Membership.countDocuments({ createdAt: { $gte: past30, $lte: now } });
    res.json({ newMembers30d: count });
  } catch (error) {
    console.error("New members last 30 days error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Simple churn estimate: expired memberships updated in last 30 days vs (active + expired in that window)
exports.getChurnRate = async (req, res) => {
  try {
    const now = new Date();
    const past30 = new Date(now);
    past30.setDate(now.getDate() - 30);

    const expiredCount = await Membership.countDocuments({
      status: "expired",
      updatedAt: { $gte: past30, $lte: now },
    });

    const activeCount = await Membership.countDocuments({ status: "active" });

    const denom = activeCount + expiredCount;
    const churn = denom > 0 ? expiredCount / denom : 0;

    res.json({ expiredCount, activeCount, churnRate: churn });
  } catch (error) {
    console.error("Churn rate error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
