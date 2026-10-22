const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  weight_kg: Number,
  action: {
    type: String,
    enum: ["created", "claimed", "completed", "expired"],
    required: true,
  },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
