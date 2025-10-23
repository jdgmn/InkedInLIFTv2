const { body } = require("express-validator");

exports.register = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName").trim().notEmpty().withMessage("firstName is required").escape(),
  body("lastName").trim().notEmpty().withMessage("lastName is required").escape(),
];

exports.login = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.forgot = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
];

exports.reset = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];