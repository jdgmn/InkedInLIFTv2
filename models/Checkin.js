const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Email is optional, but if provided, must be valid
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  checkinTime: { type: Date, default: Date.now },
  checkoutTime: { type: Date },
  isMember: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date },
}, { timestamps: true });

// Indexes for performance
checkinSchema.index({ checkinTime: -1 }); // For recent checkins
checkinSchema.index({ user: 1, checkinTime: -1 }); // For user checkin history
checkinSchema.index({ checkoutTime: 1 }); // For active sessions

// Virtual for session duration
checkinSchema.virtual('sessionDuration').get(function() {
  if (!this.checkoutTime) return null;
  return this.checkoutTime - this.checkinTime;
});

// Custom validation: At least one of user, email, or name must be provided
checkinSchema.pre("validate", function(next) {
  if (!this.user && !this.email && !this.name) {
    this.invalidate("user", "At least one of user, email, or name must be provided");
    this.invalidate("email", "At least one of user, email, or name must be provided");
    this.invalidate("name", "At least one of user, email, or name must be provided");
  }
  next();
});

// Validation: checkoutTime must be after checkinTime
checkinSchema.pre("validate", function(next) {
  if (this.checkoutTime && this.checkoutTime <= this.checkinTime) {
    this.invalidate("checkoutTime", "Checkout time must be after checkin time");
  }
  next();
});

// Soft delete method
checkinSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Check if checkin is deleted
checkinSchema.methods.isDeleted = function() {
  return !!this.deletedAt;
};

module.exports = mongoose.model("Checkin", checkinSchema);
