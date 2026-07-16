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
const { send } = require('../services/emailService');
const { EMAIL_FROM } = require('../config/email');

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

// Diagnostic: attempt a real send and return the provider's exact result/error
// (e.g. Brevo "sender not verified"). No shell/log access on Render, so this is
// how production email failures get surfaced. GET /api/payment/email-test?to=you@example.com
router.get('/email-test', async (req, res) => {
  const to = req.query.to;
  if (!to) {
    res.status(400);
    return res.json({ ok: false, error: 'Pass ?to=your@email.com' });
  }
  const result = await send({
    to,
    subject: 'CineSnap email test ✅',
    html: '<p>If you can read this, CineSnap production email is working.</p>',
  });
  res.json({ ok: !!result?.sent, from: EMAIL_FROM, result });
});

module.exports = router;
