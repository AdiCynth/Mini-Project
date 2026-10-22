const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const Claim = require("../models/Claim");
const Listing = require("../models/Listing");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.post("/", authenticate, requireRole("receiver"), async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: "Listing ID is required." });
    }

    const existingClaim = await Claim.findOne({ listing: listing_id, receiver: req.user.id, status: { $ne: "cancelled" } });
    if (existingClaim) {
      return res.status(400).json({ error: "You already claimed this listing." });
    }

    // Reserve the listing atomically so two receivers cannot claim it at once.
    const listing = await Listing.findOneAndUpdate(
      { _id: listing_id, status: "available", pickup_window_end: { $gt: new Date() } },
      { $set: { status: "claimed" } },
      { new: true },
    );
    if (!listing) {
      return res.status(400).json({ error: "Listing not found, expired, or already claimed." });
    }

    const claim = await Claim.create({
      listing: listing_id,
      receiver: req.user.id,
    });

    await AuditLog.create({
      listing: listing_id,
      donor: listing.donor,
      receiver: req.user.id,
      weight_kg: listing.weight_kg || 0,
      action: "claimed",
    });

    res.status(201).json({
      message: "Listing claimed successfully!",
      claim,
    });
  } catch (err) {
    console.error("Create claim error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/my", authenticate, requireRole("receiver"), async (req, res) => {
  try {
    const claims = await Claim.find({ receiver: req.user.id })
      .populate({
        path: "listing",
        populate: [
          { path: "donor", select: "organization_name phone address location" },
          { path: "category", select: "name icon" }
        ]
      })
      .sort({ claimed_at: -1 });

    // Format for frontend mapping
    const formattedClaims = claims.map(c => ({
      _id: c._id,
      status: c.status,
      claimed_at: c.claimed_at,
      picked_up_at: c.picked_up_at,
      item_name: c.listing.item_name,
      quantity: c.listing.quantity,
      unit: c.listing.unit,
      weight_kg: c.listing.weight_kg,
      pickup_window_start: c.listing.pickup_window_start,
      pickup_window_end: c.listing.pickup_window_end,
      donor_name: c.listing.donor?.organization_name,
      donor_phone: c.listing.donor?.phone,
      donor_address: c.listing.donor?.address,
      donor_location: c.listing.donor?.location?.coordinates,
      category_name: c.listing.category?.name,
      category_icon: c.listing.category?.icon,
    }));

    res.json({ claims: formattedClaims });
  } catch (err) {
    console.error("Get claims error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !["accepted", "picked_up", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'accepted', 'picked_up', or 'cancelled'." });
    }

    const claim = await Claim.findById(req.params.id).populate("listing", "donor status");
    if (!claim || !claim.listing) {
      return res.status(404).json({ error: "Claim not found." });
    }

    const isClaimReceiver = req.user.role === "receiver" && String(claim.receiver) === String(req.user.id);
    const isListingDonor = req.user.role === "donor" && String(claim.listing.donor) === String(req.user.id);
    const isAdmin = req.user.role === "admin";

    if (status === "accepted" && !isListingDonor) {
      return res.status(403).json({ error: "Only the donor who posted this listing can accept the claim." });
    }
    if (status === "picked_up" && !isClaimReceiver) {
      return res.status(403).json({ error: "Only the receiver who claimed this listing can confirm pickup." });
    }
    if (status === "cancelled" && !isClaimReceiver && !isListingDonor && !isAdmin) {
      return res.status(403).json({ error: "You do not have permission to cancel this claim." });
    }

    const allowedCurrentStatuses = status === "accepted" ? ["pending"] : ["pending", "accepted"];
    if (!allowedCurrentStatuses.includes(claim.status)) {
      return res.status(409).json({ error: `A ${claim.status} claim cannot be marked ${status}.` });
    }

    claim.status = status;
    if (status === "picked_up") claim.picked_up_at = new Date();
    await claim.save();

    if (status === "picked_up") {
      const listing = await Listing.findByIdAndUpdate(claim.listing._id, { status: "completed" });
      if (listing) {
        await AuditLog.create({
          listing: listing._id,
          donor: listing.donor,
          receiver: claim.receiver,
          weight_kg: listing.weight_kg || 0,
          action: "completed",
        });
      }
    }

    if (status === "cancelled") {
      await Listing.findByIdAndUpdate(claim.listing._id, { status: "available" });
    }

    res.json({ message: `Claim ${status}!`, claim });
  } catch (err) {
    console.error("Update claim error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
