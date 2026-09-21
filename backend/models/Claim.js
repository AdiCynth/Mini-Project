const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "picked_up", "cancelled"],
    default: "pending",
  },
  picked_up_at: Date,
}, { timestamps: { createdAt: "claimed_at", updatedAt: false } });

module.exports = mongoose.model("Claim", ClaimSchema);
