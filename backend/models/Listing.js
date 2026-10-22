const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  item_name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unit: {
    type: String,
    default: "pieces",
  },
  weight_kg: Number,
  expiry_time: {
    type: Date,
    required: true,
  },
  pickup_window_start: {
    type: Date,
    required: true,
  },
  pickup_window_end: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "claimed", "expired", "completed"],
    default: "available",
  },
  // GeoJSON Point to enable geospatial routing
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

// Index for geo routing
ListingSchema.index({ location: "2dsphere" });
// Index for fast status/expiry filtering
ListingSchema.index({ status: 1, pickup_window_end: 1 });

module.exports = mongoose.model("Listing", ListingSchema);
