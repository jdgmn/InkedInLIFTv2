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
  isMember: { type: Boolean, default: false },
}, { timestamps: true });

// Custom validation: At least one of user, email, or name must be provided
checkinSchema.pre("validate", function(next) {
  if (!this.user && !this.email && !this.name) {
    this.invalidate("user", "At least one of user, email, or name must be provided");
    this.invalidate("email", "At least one of user, email, or name must be provided");
    this.invalidate("name", "At least one of user, email, or name must be provided");
  }
  next();
});

module.exports = mongoose.model("Checkin", checkinSchema);
