const { body } = require("express-validator");
const validateUrl = require("./urlValidator");

exports.createMembership = [
  // optional website field validated with safe helper instead of express-validator's isURL
  body("website")
    .optional()
    .custom((v) => {
      if (!validateUrl(v)) throw new Error("Invalid website URL");
      return true;
    }),

  body("email").isEmail().withMessage("Valid user email required").normalizeEmail(),
  body("membershipType")
    .isIn(["monthly", "quarterly", "annual"])
    .withMessage("membershipType must be one of monthly, quarterly, annual"),
  body("price").isFloat({ gt: 0 }).withMessage("price must be a positive number"),
  body("paymentStatus")
    .optional()
    .isIn(["paid", "pending", "failed"])
    .withMessage("paymentStatus must be paid, pending or failed"),
];