const Checkin = require('../models/checkin');
const Membership = require('../models/membership');

exports.checkin = async (req, res) => {
  try {
    const { membershipId } = req.body;
    const member = await Membership.findById(membershipId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const checkin = new Checkin({ membership: membershipId });
    await checkin.save();
    res.json(checkin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { checkinId } = req.body;
    const checkin = await Checkin.findById(checkinId);
    if (!checkin) return res.status(404).json({ error: 'Check-in not found' });

    checkin.checkoutAt = new Date();
    await checkin.save();
    res.json(checkin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
