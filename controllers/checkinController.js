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
    if (email) {
      user = await User.findOne({ email });
      // User lookup is optional - unregistered users can check in
    }

    // Check if already checked in - comprehensive check across all identifiers
    let existingCheckin = null;

    // Build query conditions
    const checkinQueries = [];

    // If user is provided, check by user ID
    if (user) {
      checkinQueries.push({ user: user._id });
    }

    // If email is provided, check by email (both registered and unregistered)
    if (email) {
      checkinQueries.push({ email });
    }

    // If name is provided, check by name (but only for unregistered checkins)
    if (name && !user) {
      checkinQueries.push({ name });
    }

    // If user is registered, also check by their email and name to catch unregistered checkins
    if (user && (!email || !name)) {
      if (user.email && email !== user.email) checkinQueries.push({ email: user.email });
      if (user.firstName && user.lastName && name !== `${user.firstName} ${user.lastName}`) {
        checkinQueries.push({ name: `${user.firstName} ${user.lastName}` });
      }
    }

    // Execute the comprehensive check
    if (checkinQueries.length > 0) {
      const checkinFilter = {
        checkoutTime: null,
        $or: checkinQueries
      };
      existingCheckin = await Checkin.findOne(checkinFilter);
    }

    if (existingCheckin) {
      const checkinTime = new Date(existingCheckin.checkinTime).toLocaleString();
      return res.status(400).json({
        error: `Already checked in at ${checkinTime}. Please check out first if this is a different session.`,
        existingCheckinTime: existingCheckin.checkinTime
      });
    }

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
      createdBy: req.user ? req.user._id : null,
    });
    await checkin.save();

    const populatedCheckin = await Checkin.findById(checkin._id).populate("user", "firstName lastName email");

    res.json({
      message: isMember ? "Member checked in!" : "User checked in!",
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

// CHECKOUT user
exports.checkoutUser = async (req, res) => {
  try {
    const { id } = req.params;
    const checkin = await Checkin.findById(id);
    if (!checkin) return res.status(404).json({ error: "Checkin not found" });

    if (checkin.checkoutTime) {
      return res.status(400).json({
        error: "Already checked out",
        checkoutTime: checkin.checkoutTime
      });
    }

    checkin.checkoutTime = new Date();
    checkin.updatedBy = req.user ? req.user._id : null;
    await checkin.save();

    const populatedCheckin = await Checkin.findById(checkin._id).populate("user", "firstName lastName email");

    res.json({
      message: "Checked out successfully",
      checkin: populatedCheckin,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
