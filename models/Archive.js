const mongoose = require("mongoose");

const ArchiveSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  type: { type: String, required: true }, // e.g., "membership", "checkin"
  data: { type: Array, default: [] },
  archivedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Archive", ArchiveSchema);
