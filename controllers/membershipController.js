// In-memory rates (Could be moved to DB later)
let membershipRates = {
  monthly: 30,
  quarterly: 80,
  annual: 300,
};

const Membership = require("../models/Membership");
const User = require("../models/User");

// Helper: validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper: get automatic price based on type
const getMembershipPrice = (type) => {
  return membershipRates[type] || 0;
};

// Create or renew membership
exports.createMembership = async (req, res) => {
  try {
    const { email, planId, paymentStatus, startDate } = req.body;

    if (!email || !planId) {
      return res
        .status(400)
        .json({ error: "email and planId are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Get the membership plan
    const MembershipPlan = require("../models/MembershipPlan");
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    if (!plan.isActive) {
      return res.status(400).json({ error: "Membership plan is not active" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check for existing active membership
    const existingMembership = await Membership.findOne({
      user: user._id,
      status: "active",
      endDate: { $gte: new Date() }
    });

    if (existingMembership) {
      return res.status(400).json({
        error: "User already has an active membership",
        currentMembership: {
          plan: existingMembership.membershipType,
          endDate: existingMembership.endDate
        }
      });
    }

    // Calculate end date based on plan duration
    const start = startDate ? new Date(startDate) : new Date();
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + plan.duration);

    const membership = new Membership({
      user: user._id,
      membershipType: plan.name, // Store plan name for display
      price: plan.price,
      startDate: start,
      endDate,
      paymentStatus: paymentStatus || "paid",
      status: "active",
      createdBy: req.user ? req.user._id : null,
      planId: plan._id // Reference to the plan
    });

    await membership.save();

    const populatedMembership = await Membership.findById(membership._id).populate("user", "email firstName lastName");
    res.status(201).json({
      message: `Membership created successfully for ${plan.name}`,
      membership: populatedMembership,
      plan: {
        name: plan.name,
        duration: plan.duration,
        price: plan.price
      }
    });
  } catch (error) {
    console.error("Create membership error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get all memberships with optional pagination
exports.getMemberships = async (req, res) => {
  try {
    // Auto-expire memberships that have passed their end date
    await Membership.updateMany(
      { status: "active", endDate: { $lt: new Date() } },
      { $set: { status: "expired" } }
    );

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const memberships = await Membership.find()
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
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

    membership.updatedBy = req.user ? req.user._id : null;
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

// Get membership rates (admin only)
exports.getMembershipRates = async (req, res) => {
  try {
    res.json({ rates: membershipRates });
  } catch (error) {
    console.error("Get rates error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update membership rates (admin only)
exports.updateMembershipRates = async (req, res) => {
  try {
    const { rates } = req.body;
    if (!rates || typeof rates !== 'object') {
      return res.status(400).json({ error: "Rates object is required" });
    }
    // Update rates
    Object.assign(membershipRates, rates);
    res.json({ message: "Rates updated", rates: membershipRates });
  } catch (error) {
    console.error("Update rates error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
