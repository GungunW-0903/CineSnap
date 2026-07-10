const express = require('express');
const router = express.Router();
const {
  createSession,
  confirmPayment,
  devConfirmPayment,
  resendConfirmationEmail,
} = require('../controllers/paymentController');

router.post('/create-checkout-session', createSession);
router.post('/confirm', confirmPayment);

// Simulated payment — the checkout page always offers this as "Demo Payment"
// (no card required), so it must stay mounted in every environment, not just
// local dev, or that button 404s once deployed.
router.post('/dev-confirm', devConfirmPayment);

router.post('/resend-email', resendConfirmationEmail);

module.exports = router;
