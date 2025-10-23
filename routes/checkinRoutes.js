const express = require("express");
const router = express.Router();
const { checkinUser } = require("../controllers/checkinController");
const validateRequest = require("../validators/validateRequest");
const { checkin } = require("../validators/checkinValidators");

// Public or protected depending on your policy; here it's open but can be protected
router.post("/", checkin, validateRequest, checkinUser);

module.exports = router;
