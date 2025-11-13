require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

async function seedUsers() {
  try {
    await connectDB();
    console.log("Connected to DB");

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: "admin@admin.com" });
    if (!existingAdmin) {
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
    } else {
      console.log("Admin user already exists");
    }

    // Check if receptionist exists
    const existingReceptionist = await User.findOne({ email: "rece@rece.com" });
    if (!existingReceptionist) {
      // Create receptionist user
      const receptionist = new User({
        email: "rece@rece.com",
        firstName: "Receptionist",
        lastName: "User",
        role: "receptionist",
        verified: true
      });

      await receptionist.setPassword("rece");
      await receptionist.save();

      console.log("Receptionist user created: rece@rece.com / rece");
    } else {
      console.log("Receptionist user already exists");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();
