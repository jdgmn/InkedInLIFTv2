const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name cannot exceed 50 characters"]
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name cannot exceed 50 characters"]
  },
  role: { type: String, enum: ["admin", "receptionist", "client"], default: "client" },
  passwordHash: { type: String },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date },
}, { timestamps: true });

UserSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

// Indexes for performance
UserSchema.index({ email: 1 }); // Already unique, but explicit
UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });

// TTL index for temporary tokens
UserSchema.index({ verificationToken: 1 }, { expireAfterSeconds: 86400 }); // 24 hours
UserSchema.index({ resetToken: 1 }, { expireAfterSeconds: 3600 }); // 1 hour

UserSchema.methods.verifyPassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

// Soft delete method
UserSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Check if user is deleted
UserSchema.methods.isDeleted = function() {
  return !!this.deletedAt;
};

module.exports = mongoose.model("User", UserSchema);
