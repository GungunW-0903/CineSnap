const crypto = require('crypto');
const Razorpay = require('razorpay');

// A key is only "real" if both id + secret are present and aren't the
// placeholders shipped in .env.example. This lets Razorpay stay cleanly
// disabled (503) — with the demo payment still working — until real keys
// are pasted in, instead of failing with a confusing auth error.
const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const isRealKey =
  keyId.startsWith('rzp_') &&
  !keyId.includes('your_') &&
  keySecret.length > 0 &&
  !keySecret.includes('your_');

if (!isRealKey) {
  console.warn(
    '⚠ RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured — Razorpay disabled (demo payment still works).'
  );
}

const razorpay = isRealKey ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

// Razorpay settles in the smallest currency unit (paise for INR).
const CURRENCY = process.env.RAZORPAY_CURRENCY || 'INR';

/**
 * Create a Razorpay order for a booking. `amount` is in major units (rupees).
 * Returns the order object (id, amount, currency, …) the frontend needs to
 * open Razorpay Checkout.
 */
async function createOrder({ bookingId, amount, notes = {} }) {
  if (!razorpay) throw new Error('Razorpay is not configured');

  return razorpay.orders.create({
    amount: Math.round(amount * 100), // rupees → paise
    currency: CURRENCY,
    receipt: `booking_${bookingId}`,
    notes: { bookingId: String(bookingId), ...notes },
  });
}

/**
 * Verify a Razorpay Checkout signature. Razorpay signs
 * `${order_id}|${payment_id}` with the key secret (HMAC-SHA256); a matching
 * signature proves the payment came from Razorpay and wasn't forged client-side.
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  // timingSafeEqual guards against timing attacks; lengths must match first.
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verify a Razorpay webhook signature (signed with the webhook secret, over the
 * raw request body). Separate secret from the API key secret.
 */
function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = {
  razorpay,
  isRazorpayEnabled: isRealKey,
  keyId,
  CURRENCY,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
