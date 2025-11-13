// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
connectDB();

// Cron jobs / background tasks
require("./cron/notificationScheduler");
require("./jobs/archiver");

// Routes
const viewRoutes = require("./routes/viewRoutes");
const userRoutes = require("./routes/userRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/", viewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/analytics", analyticsRoutes);

// Basic root render
app.get("/", (req, res) => res.render("login"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
