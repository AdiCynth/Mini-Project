const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["donor", "receiver", "admin"],
  },
  phone: String,
  organization_name: String,
  address: String,
  // GeoJSON Point for geospatial queries
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

// Create a 2dsphere index on the location field
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
