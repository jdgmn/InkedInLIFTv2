const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Package name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
    unique: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, "Description cannot exceed 200 characters"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  duration: {
    type: Number, // in days
    required: [true, "Duration is required"],
    min: [1, "Duration must be at least 1 day"],
  },
  allowedUsers: {
    type: Number,
    default: 1,
    min: [1, "Must allow at least 1 user"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

// Indexes
membershipPlanSchema.index({ name: 1 });
membershipPlanSchema.index({ isActive: 1 });
membershipPlanSchema.index({ sortOrder: 1 });

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
