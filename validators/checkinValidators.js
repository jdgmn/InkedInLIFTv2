const { body } = require("express-validator");

exports.checkin = [
  // ensure at least one of email or name supplied
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.name) {
      throw new Error("Provide email or name");
    }
    return true;
  }),
  body("email").optional().isEmail().withMessage("If provided, email must be valid").normalizeEmail(),
  body("name").optional().trim().escape(),
];