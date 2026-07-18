const express = require('express');
const router = express.Router();
const {
  createSession,
  confirmPayment,
  devConfirmPayment,
  resendConfirmationEmail,
  getPaymentConfig,
  createRazorpayOrderHandler,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');

// Which real payment methods are live (used by the checkout page to decide
// whether to show Razorpay). Public, no secrets beyond the publishable key id.
router.get('/config', getPaymentConfig);

// ---- Razorpay ----
router.post('/razorpay/order', createRazorpayOrderHandler);
router.post('/razorpay/verify', verifyRazorpayPayment);

// ---- Stripe (legacy card path, kept for compatibility) ----
router.post('/create-checkout-session', createSession);
router.post('/confirm', confirmPayment);

// Simulated payment — the checkout page always offers this as "Demo Payment"
// (no card required), so it must stay mounted in every environment, not just
// local dev, or that button 404s once deployed.
router.post('/dev-confirm', devConfirmPayment);

router.post('/resend-email', resendConfirmationEmail);

module.exports = router;
