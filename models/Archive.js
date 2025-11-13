const mongoose = require("mongoose");

const ArchiveSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  type: { type: String, required: true }, // e.g., "membership", "checkin"
  data: { type: Array, default: [] },
  archivedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date },
}, { timestamps: true });

// Indexes for performance
ArchiveSchema.index({ year: 1, type: 1 });

// Soft delete method
ArchiveSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Check if archive is deleted
ArchiveSchema.methods.isDeleted = function() {
  return !!this.deletedAt;
};

module.exports = mongoose.model("Archive", ArchiveSchema);
