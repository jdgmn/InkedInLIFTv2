const Membership = require("../models/Membership");
const User = require("../models/User");

// Helper: validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Create or renew membership
exports.createMembership = async (req, res) => {
  try {
    const { email, membershipType, price, paymentStatus, startDate } = req.body;
    
    if (!email || !membershipType || price == null) {
      return res
        .status(400)
        .json({ error: "email, membershipType and price are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate membership type
    const validTypes = ["monthly", "quarterly", "annual"];
    if (!validTypes.includes(membershipType)) {
      return res.status(400).json({ error: "Invalid membership type. Must be monthly, quarterly, or annual" });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Expire existing active membership for this user
    await Membership.updateMany(
      { user: user._id, status: "active" },
      { $set: { status: "expired" } }
    );

    const membership = new Membership({
      user: user._id,
      membershipType,
      price,
      startDate: startDate || new Date(),
      paymentStatus: paymentStatus || "paid",
      status: "active",
    });

    await membership.save();
    
    const populatedMembership = await Membership.findById(membership._id).populate("user", "email firstName lastName");
    res.status(201).json({ message: "Membership created", membership: populatedMembership });
  } catch (error) {
    console.error("Create membership error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get all memberships
exports.getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().populate(
      "user",
      "email firstName lastName"
    );
    res.json(memberships);
  } catch (error) {
    console.error("Get memberships error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update membership
exports.updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipType, price, paymentStatus, status, startDate } = req.body;

    const membership = await Membership.findById(id);
    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }

    // Validate membership type if provided
    if (membershipType) {
      const validTypes = ["monthly", "quarterly", "annual"];
      if (!validTypes.includes(membershipType)) {
        return res.status(400).json({ error: "Invalid membership type. Must be monthly, quarterly, or annual" });
      }
      membership.membershipType = membershipType;
    }

    // Validate price if provided
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ error: "Price cannot be negative" });
      }
      membership.price = price;
    }

    // Validate payment status if provided
    if (paymentStatus) {
      const validPaymentStatuses = ["paid", "pending", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ error: "Invalid payment status. Must be paid, pending, or failed" });
      }
      membership.paymentStatus = paymentStatus;
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["active", "expired", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be active, expired, or cancelled" });
      }
      membership.status = status;
    }

    // Update start date if provided
    if (startDate) {
      membership.startDate = new Date(startDate);
    }

    await membership.save();
    
    const updatedMembership = await Membership.findById(id).populate("user", "email firstName lastName");
    res.json({ message: "Membership updated", membership: updatedMembership });
  } catch (error) {
    console.error("Update membership error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Delete membership
exports.deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findByIdAndDelete(id);
    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.json({ message: "Membership deleted" });
  } catch (error) {
    console.error("Delete membership error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
