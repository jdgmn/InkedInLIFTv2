const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify the token and attach the user to req.user
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["x-access-token"] || "";

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-passwordHash -__v");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Restrict routes to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden - insufficient role" });
    next();
  };
};
