const Membership = require('../models/membership');

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const membership = new Membership(data);
    await membership.save();
    res.json(membership);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.findAll = async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 });
    res.json(memberships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
