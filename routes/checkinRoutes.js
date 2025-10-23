const express = require("express");
const router = express.Router();
const { checkinUser } = require("../controllers/checkinController");

// Public endpoint
router.post("/", checkinUser);

module.exports = router;
