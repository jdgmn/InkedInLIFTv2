const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbookController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/checkin', verifyToken, logbookController.checkin);
router.post('/checkout', verifyToken, logbookController.checkout);

module.exports = router;
