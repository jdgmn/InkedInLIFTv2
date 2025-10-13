const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, membershipController.create);
router.get('/', verifyToken, membershipController.findAll);

module.exports = router;
