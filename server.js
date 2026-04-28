// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const xss = require('xss');
const mongoSanitize = require('mongo-sanitize');
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again later." }
});

// Login/Auth rate limiter (stricter limits)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// ✅ NoSQL Injection Protection - sanitize all incoming requests
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.params = mongoSanitize(req.params);
  req.query = mongoSanitize(req.query);
  next();
});

// ✅ XSS Protection - sanitize all string input automatically
app.use((req, res, next) => {
  function sanitizeObject(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);
  next();
});

// ✅ Secure HTTP Headers
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Apply rate limit to all API routes
app.use("/api/", apiLimiter);

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
const membershipPlanRoutes = require("./routes/membershipPlanRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/", viewRoutes);
// Apply stricter auth rate limits for login endpoints
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users", userRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/membership-plans", membershipPlanRoutes);
app.use("/api/analytics", analyticsRoutes);

// Basic root render
app.get("/", (req, res) => res.render("login"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
