const Membership = require("../models/Membership");
const User = require("../models/User");

// helper to compute endDate based on type
const computeEndDate = (type, start = new Date()) => {
  const d = new Date(start);
  switch (type) {
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "annual":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      return undefined;
  }
  return d;
};

// Create or renew membership
exports.createMembership = async (req, res) => {
  try {
    const { email, membershipType, price, paymentStatus } = req.body;
    if (!email || !membershipType || price == null)
      return res
        .status(400)
        .json({ error: "email, membershipType and price are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const startDate = new Date();
    const endDate = computeEndDate(membershipType, startDate);

    // expire existing active membership for this user
    await Membership.updateMany(
      { user: user._id, status: "active" },
      { $set: { status: "expired" } }
    );

    const membership = new Membership({
      user: user._id,
      membershipType,
      price,
      startDate,
      endDate,
      paymentStatus: paymentStatus || "paid",
      status: "active",
    });

    await membership.save();
    res.status(201).json({ message: "Membership created", membership });
  } catch (error) {
    console.error("Create membership error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all memberships
exports.getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().populate(
      "user",
      "email firstName lastName"
    );
    res.json(memberships);
  } catch (error) {
    console.error("Get memberships error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;
    await Membership.findByIdAndDelete(id);
    res.json({ message: "Membership deleted" });
  } catch (error) {
    console.error("Delete membership error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
