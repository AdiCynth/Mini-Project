const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const claimRoutes = require("./routes/claims");
const adminRoutes = require("./routes/admin");
const reportsRoutes = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FoodBridge API is running" });
});

app.listen(PORT, () => {
  console.log(`FoodBridge server running on http://localhost:${PORT}`);
});
