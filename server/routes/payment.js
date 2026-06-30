const express = require('express');
const router = express.Router();
const { createSession, confirmPayment } = require('../controllers/paymentController');

router.post('/create-checkout-session', createSession);
router.post('/confirm', confirmPayment);

module.exports = router;
