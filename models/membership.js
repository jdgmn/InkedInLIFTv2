const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'expired', 'archived'], default: 'active' },
  price: { type: Number, default: 0 },
  paidBy: { type: String },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Membership', MembershipSchema);
