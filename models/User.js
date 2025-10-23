const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ["admin", "receptionist", "client"], default: "client" },
  passwordHash: { type: String },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

UserSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

UserSchema.methods.verifyPassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
