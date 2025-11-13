require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

async function seedAdmin() {
  try {
    await connectDB();
    console.log("Connected to DB");

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: "admin@admin.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const admin = new User({
      email: "admin@admin.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      verified: true
    });

    await admin.setPassword("admin");
    await admin.save();

    console.log("Admin user created: admin@admin.com / admin");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedAdmin();
