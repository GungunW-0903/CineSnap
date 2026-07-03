const express = require('express');
const router = express.Router();
const {
  createSession,
  confirmPayment,
  devConfirmPayment,
} = require('../controllers/paymentController');

router.post('/create-checkout-session', createSession);
router.post('/confirm', confirmPayment);

// Simulated payment for local dev / demos — never exposed in production.
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-confirm', devConfirmPayment);
}

module.exports = router;
