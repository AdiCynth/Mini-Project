const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");
const Category = require("../models/Category");
const Listing = require("../models/Listing");
const AuditLog = require("../models/AuditLog");

// Load env vars
dotenv.config({ path: "../.env" });

// Connect DB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/foodbridge");

const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Listing.deleteMany();
    await AuditLog.deleteMany();

    console.log("Existing data cleared.");

    // Categories
    const categories = await Category.insertMany([
      { name: "Bakery", icon: "🥐" },
      { name: "Produce", icon: "🥬" },
      { name: "Dairy", icon: "🧀" },
      { name: "Cooked Meals", icon: "🍛" },
      { name: "Beverages", icon: "🥤" },
      { name: "Packaged Foods", icon: "📦" },
    ]);

    // Users
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash("password123", salt);

    const users = await User.insertMany([
      { email: "freshbakes@example.com", password_hash, name: "Rahul Sharma", role: "donor", phone: "9876543210", organization_name: "Fresh Bakes Bakery", address: "123 MG Road, Mumbai", location: { type: "Point", coordinates: [72.8777, 19.0760] }, is_verified: true },
      { email: "greengrocer@example.com", password_hash, name: "Priya Patel", role: "donor", phone: "9876543211", organization_name: "Green Grocer Market", address: "45 Brigade Road, Bangalore", location: { type: "Point", coordinates: [77.5946, 12.9716] }, is_verified: true },
      { email: "citybistro@example.com", password_hash, name: "Amit Kumar", role: "donor", phone: "9876543212", organization_name: "City Bistro Restaurant", address: "78 Park Street, Mumbai", location: { type: "Point", coordinates: [72.8900, 19.0850] }, is_verified: true },
      { email: "feedingindia@example.com", password_hash, name: "Sneha Reddy", role: "receiver", phone: "9876543213", organization_name: "Feeding India Foundation", address: "22 Anna Salai, Mumbai", location: { type: "Point", coordinates: [72.8850, 19.0800] }, is_verified: true },
      { email: "robinhood@example.com", password_hash, name: "Karan Singh", role: "receiver", phone: "9876543214", organization_name: "Robin Hood Army", address: "56 Koramangala, Bangalore", location: { type: "Point", coordinates: [77.6245, 12.9352] }, is_verified: true },
      { email: "admin@foodbridge.com", password_hash, name: "Admin User", role: "admin", phone: "9876543216", organization_name: "FoodBridge Platform", address: "HQ Mumbai", location: { type: "Point", coordinates: [72.8777, 19.0760] }, is_verified: true }
    ]);

    console.log("Users & Categories seeded.");

    // Listings
    const listings = await Listing.insertMany([
      { donor: users[0]._id, category: categories[0]._id, item_name: "Samosas", quantity: 50, unit: "pieces", weight_kg: 5.0, expiry_time: new Date(Date.now() + 6 * 3600000), pickup_window_start: new Date(), pickup_window_end: new Date(Date.now() + 3 * 3600000), location: { type: "Point", coordinates: [72.8777, 19.0760] } },
      { donor: users[0]._id, category: categories[3]._id, item_name: "Vegetable Biryani", quantity: 15, unit: "kg", weight_kg: 15.0, expiry_time: new Date(Date.now() + 12 * 3600000), pickup_window_start: new Date(), pickup_window_end: new Date(Date.now() + 4 * 3600000), location: { type: "Point", coordinates: [72.8777, 19.0760] } },
      { donor: users[1]._id, category: categories[1]._id, item_name: "Fresh Tomatoes & Onions", quantity: 10, unit: "crates", weight_kg: 25.0, expiry_time: new Date(Date.now() + 24 * 3600000), pickup_window_start: new Date(), pickup_window_end: new Date(Date.now() + 6 * 3600000), location: { type: "Point", coordinates: [77.5946, 12.9716] } }
    ]);

    // Audit logs
    await AuditLog.insertMany([
      { listing: listings[0]._id, donor: users[0]._id, weight_kg: 5.0, action: "created" },
      { listing: listings[1]._id, donor: users[0]._id, weight_kg: 7.5, action: "created" },
      { listing: listings[2]._id, donor: users[1]._id, weight_kg: 25.0, action: "created" }
    ]);

    console.log("Listings and Audit Logs seeded.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
