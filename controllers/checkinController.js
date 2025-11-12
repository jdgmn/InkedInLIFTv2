const Checkin = require("../models/Checkin");
const Membership = require("../models/Membership");
const User = require("../models/User");

// Helper: validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.checkinUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email && !name)
      return res.status(400).json({ error: "email or name is required" });

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    let user = null;
    if (email) user = await User.findOne({ email });

    // Determine membership status
    let isMember = false;
    if (user) {
      const activeMembership = await Membership.findOne({
        user: user._id,
        status: "active",
        endDate: { $gte: new Date() },
      });
      if (activeMembership) isMember = true;
    }

    const checkin = new Checkin({
      user: user ? user._id : undefined,
      name: name || (user ? `${user.firstName} ${user.lastName}` : undefined),
      email: email || (user ? user.email : undefined),
      isMember,
    });
    await checkin.save();

    const populatedCheckin = await Checkin.findById(checkin._id).populate("user", "firstName lastName email");

    res.json({
      message: isMember ? "Member checked in!" : "Walk-in check-in recorded!",
      checkin: populatedCheckin,
    });
  } catch (error) {
    console.error("Checkin error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE checkin (admin)
exports.deleteCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Checkin.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Checkin not found" });
    res.json({ message: "Checkin deleted" });
  } catch (error) {
    console.error("Delete checkin error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
