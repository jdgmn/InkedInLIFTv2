// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

require("./cron/notificationScheduler");

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 InkedInLIFTv2 Server Running and Connected to MongoDB!");
});

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const membershipRoutes = require("./routes/membershipRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);


app.use("/api/memberships", membershipRoutes);
app.use("/api/checkins", checkinRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
