const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ["admin", "receptionist", "client"], default: "client" },
  verified: { type: Boolean, default: false },
  verificationToken: String,
  resetToken: String,
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
