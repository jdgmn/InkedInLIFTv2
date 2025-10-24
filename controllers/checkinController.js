const Checkin = require("../models/Checkin");
const Membership = require("../models/Membership");
const User = require("../models/User");

exports.checkinUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email && !name)
      return res.status(400).json({ error: "email or name is required" });

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

    res.json({
      message: isMember ? "Member checked in!" : "Walk-in check-in recorded!",
      checkin,
    });
  } catch (error) {
    console.error("Checkin error:", error);
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
