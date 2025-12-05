const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for membership"]
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: [true, "Plan reference is required"]
    },
    membershipType: {
      type: String,
      required: [true, "Membership type/plan name is required"],
      maxlength: [100, "Plan name cannot exceed 100 characters"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"]
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["paid", "pending", "failed"],
        message: "{VALUE} is not a valid payment status"
      },
      default: "paid",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "expired", "cancelled"],
        message: "{VALUE} is not a valid membership status"
      },
      default: "active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Method to check if membership is expired
MembershipSchema.methods.isExpired = function() {
  return this.endDate && new Date() > this.endDate;
};

// Indexes for performance
MembershipSchema.index({ user: 1, status: 1, endDate: 1 }); // For active membership queries
MembershipSchema.index({ endDate: 1 }); // For expiration queries

// Method to check if membership is active and valid
MembershipSchema.methods.isActive = function() {
  return this.status === "active" && !this.isExpired();
};

// Soft delete method
MembershipSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Check if membership is deleted
MembershipSchema.methods.isDeleted = function() {
  return !!this.deletedAt;
};

module.exports = mongoose.model("Membership", MembershipSchema);
