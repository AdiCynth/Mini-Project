const User = require("../models/User");

/**
 * Finds receivers within a specified radius using MongoDB geo-spatial queries
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} Array of nearby receiver users
 */
const findNearbyReceivers = async (lat, lng, radiusKm = 5) => {
  try {
    const receivers = await User.find({
      role: "receiver",
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radiusKm * 1000, // MongoDB expects meters
        },
      },
    });
    
    return receivers;
  } catch (err) {
    console.error("Error finding nearby receivers:", err);
    return [];
  }
};

module.exports = { findNearbyReceivers };
