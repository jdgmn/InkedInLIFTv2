const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    membershipType: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      required: true,
    },
    price: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", MembershipSchema);
