const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  membershipType: {
    type: String,
    enum: ["monthly", "quarterly", "annual", "walk-in"],
    required: true,
  },
  price: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid", "staggered"],
    default: "unpaid",
  },
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active",
  },
});

membershipSchema.pre("save", function (next) {
  if (!this.endDate) {
    if (this.membershipType === "monthly") {
      this.endDate = new Date(this.startDate);
      this.endDate.setMonth(this.endDate.getMonth() + 1);
    } else if (this.membershipType === "quarterly") {
      this.endDate = new Date(this.startDate);
      this.endDate.setMonth(this.endDate.getMonth() + 3);
    } else if (this.membershipType === "annual") {
      this.endDate = new Date(this.startDate);
      this.endDate.setFullYear(this.endDate.getFullYear() + 1);
    } else {
      this.endDate = this.startDate; // walk-in
    }
  }
  next();
});

module.exports = mongoose.model("Membership", membershipSchema);
