const mongoose = require('mongoose');

const CheckinSchema = new mongoose.Schema({
  membership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
  checkinAt: { type: Date, default: Date.now },
  checkoutAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Checkin', CheckinSchema);
