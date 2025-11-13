const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for membership"]
    },
    membershipType: {
      type: String,
      enum: {
        values: ["monthly", "quarterly", "annual"],
        message: "{VALUE} is not a valid membership type"
      },
      required: [true, "Membership type is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function(v) {
          return v >= 0;
        },
        message: props => `Price must be a positive number`
      }
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
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

// Pre-save hook to calculate endDate based on membershipType
MembershipSchema.pre("save", function(next) {
  if (this.isNew || this.isModified("membershipType") || this.isModified("startDate")) {
    const start = this.startDate || new Date();
    const endDate = new Date(start);
    
    switch (this.membershipType) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "annual":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    this.endDate = endDate;
  }
  next();
});

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
