const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  name: String,
  email: String,
  checkinTime: { type: Date, default: Date.now },
  isMember: { type: Boolean, default: false },
}, { timestamps: true }); // <-- added timestamps

module.exports = mongoose.model("Checkin", checkinSchema);
