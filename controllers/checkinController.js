const Checkin = require("../models/Checkin");
const Membership = require("../models/Membership");
const User = require("../models/User");

exports.checkinUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    let user = await User.findOne({ email });
    let isMember = false;

    if (user) {
      const membership = await Membership.findOne({
        user: user._id,
        status: "active",
      });

      if (membership) isMember = true;
    }

    const checkin = new Checkin({ user: user?._id, name, email, isMember });
    await checkin.save();

    res.json({
      message: isMember ? "Member checked in!" : "Walk-in check-in recorded!",
      checkin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
