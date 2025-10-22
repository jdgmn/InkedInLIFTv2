const Membership = require("../models/Membership");
const User = require("../models/User");

// Create or renew membership
exports.createMembership = async (req, res) => {
  try {
    const { email, membershipType, price, paymentStatus } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const membership = new Membership({
      user: user._id,
      membershipType,
      price,
      paymentStatus,
    });

    await membership.save();
    res.json({ message: "Membership created successfully", membership });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all memberships
exports.getMemberships = async (req, res) => {
  const memberships = await Membership.find().populate("user", "email firstName lastName");
  res.json(memberships);
};
