const express = require("express");
const router = express.Router();
const { checkinUser } = require("../controllers/checkinController");

router.post("/", checkinUser);

module.exports = router;
