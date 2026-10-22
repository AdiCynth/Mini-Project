const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const { findNearbyReceivers } = require("../utils/matching");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Category = require("../models/Category");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.post("/", authenticate, requireRole("donor"), async (req, res) => {
  try {
    const { category_id, item_name, quantity, unit, weight_kg, expiry_time, pickup_window_start, pickup_window_end } = req.body;

    if (!item_name || !quantity || !expiry_time || !pickup_window_start || !pickup_window_end) {
      return res.status(400).json({ error: "Item name, quantity, expiry time, and pickup window are required." });
    }

    const donor = await User.findById(req.user.id);
    if (!donor || !donor.location) {
      return res.status(400).json({ error: "Please update your profile with a location first." });
    }

    const listing = await Listing.create({
      donor: req.user.id,
      category: category_id || undefined,
      item_name,
      quantity,
      unit: unit || "pieces",
      weight_kg: weight_kg || 0,
      expiry_time,
      pickup_window_start,
      pickup_window_end,
      location: donor.location,
    });

    await AuditLog.create({
      listing: listing._id,
      donor: req.user.id,
      weight_kg: weight_kg || 0,
      action: "created",
    });

    const nearbyReceivers = await findNearbyReceivers(donor.location.coordinates[1], donor.location.coordinates[0], 5);
    console.log(`Found ${nearbyReceivers.length} nearby receivers for listing ${listing._id}`);

    res.status(201).json({
      message: "Listing created!",
      listing,
      nearby_receivers: nearbyReceivers.length,
    });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category_id, status } = req.query;
    
    let query = {
      pickup_window_end: { $gt: new Date() }
    };

    if (category_id) query.category = category_id;
    query.status = status || "available";

    const listings = await Listing.find(query)
      .populate("category", "name icon")
      .populate("donor", "organization_name")
      .sort({ created_at: -1 });

    res.json({ listings });
  } catch (err) {
    console.error("Get listings error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    const radiusKm = parseFloat(radius) || 5;

    // We can use $geoNear via aggregation for distance calculation, or $nearSphere.
    // We will use aggregation to get the calculated distance back.
    const listings = await Listing.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance_meters",
          maxDistance: radiusKm * 1000,
          query: { status: "available", pickup_window_end: { $gt: new Date() } },
          spherical: true
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category_info"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "donor",
          foreignField: "_id",
          as: "donor_info"
        }
      },
      {
        $project: {
          _id: 1, item_name: 1, quantity: 1, unit: 1, weight_kg: 1, 
          expiry_time: 1, pickup_window_start: 1, pickup_window_end: 1, 
          status: 1, created_at: 1, location: 1,
          category_name: { $arrayElemAt: ["$category_info.name", 0] },
          category_icon: { $arrayElemAt: ["$category_info.icon", 0] },
          donor_name: { $arrayElemAt: ["$donor_info.organization_name", 0] },
          distance_km: { $divide: ["$distance_meters", 1000] }
        }
      },
      { $sort: { distance_meters: 1 } }
    ]);

    // Clean up decimal output for distance
    const formattedListings = listings.map(l => ({
      ...l,
      distance_km: l.distance_km.toFixed(2)
    }));

    res.json({ listings: formattedListings, count: formattedListings.length });
  } catch (err) {
    console.error("Nearby listings error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/mine", authenticate, requireRole("donor"), async (req, res) => {
  try {
    const query = { donor: req.user.id };
    if (req.query.status) query.status = req.query.status;

    const listings = await Listing.find(query)
      .populate("category", "name icon")
      .populate("donor", "organization_name")
      .sort({ created_at: -1 });

    res.json({ listings });
  } catch (err) {
    console.error("Get donor listings error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("category", "name icon")
      .populate("donor", "organization_name phone address");

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    res.json({ listing });
  } catch (err) {
    console.error("Get listing error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.patch("/:id", authenticate, requireRole("donor"), async (req, res) => {
  try {
    const { quantity, pickup_window_end, status } = req.body;
    
    const listing = await Listing.findOne({ _id: req.params.id, donor: req.user.id });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found or you don't own it." });
    }

    if (quantity !== undefined) listing.quantity = quantity;
    if (pickup_window_end) listing.pickup_window_end = pickup_window_end;
    if (status) listing.status = status;

    await listing.save();

    res.json({ message: "Listing updated!", listing });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.delete("/:id", authenticate, requireRole("donor", "admin"), async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === "donor") {
      query.donor = req.user.id;
    }

    const listing = await Listing.findOneAndDelete(query);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    res.json({ message: "Listing deleted." });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
