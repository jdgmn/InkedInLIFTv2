const MembershipPlan = require("../models/MembershipPlan");

// Get all membership plans
exports.getMembershipPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find()
      .sort({ sortOrder: 1, name: 1 });

    res.json(plans);
  } catch (error) {
    console.error("Get membership plans error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get single membership plan
exports.getMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findById(id);

    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Get membership plan error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Create membership plan
exports.createMembershipPlan = async (req, res) => {
  try {
    const { name, description, price, duration, allowedUsers, sortOrder } = req.body;

    const plan = new MembershipPlan({
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      allowedUsers: parseInt(allowedUsers) || 1,
      sortOrder: parseInt(sortOrder) || 0,
      createdBy: req.user._id,
    });

    await plan.save();

    res.status(201).json({
      message: "Membership plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Create membership plan error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Plan name already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Update membership plan
exports.updateMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, allowedUsers, isActive, sortOrder } = req.body;

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    // Update fields
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (price !== undefined) plan.price = parseFloat(price);
    if (duration !== undefined) plan.duration = parseInt(duration);
    if (allowedUsers !== undefined) plan.allowedUsers = parseInt(allowedUsers);
    if (isActive !== undefined) plan.isActive = isActive;
    if (sortOrder !== undefined) plan.sortOrder = parseInt(sortOrder);

    plan.updatedBy = req.user._id;
    await plan.save();

    res.json({
      message: "Membership plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update membership plan error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Plan name already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Delete membership plan
exports.deleteMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    // Check if plan is being used by active memberships
    const Membership = require("../models/Membership");
    const activeMembership = await Membership.findOne({
      status: "active",
      createdAt: { $gte: new Date(Date.now() - plan.duration * 24 * 60 * 60 * 1000) } // Check recent memberships
    });

    if (activeMembership) {
      return res.status(400).json({
        error: "Cannot delete plan - it may be used by active memberships. Deactivate the plan instead."
      });
    }

    await MembershipPlan.findByIdAndDelete(id);

    res.json({ message: "Membership plan deleted successfully" });
  } catch (error) {
    console.error("Delete membership plan error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
};
