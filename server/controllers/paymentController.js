const QRCode = require('qrcode');
const { stripe, createCheckoutSession, retrieveSession } = require('../config/stripe');
const {
  razorpay,
  isRazorpayEnabled,
  keyId: razorpayKeyId,
  CURRENCY: razorpayCurrency,
  createOrder: createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../config/razorpay');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendBookingConfirmation } = require('../services/emailService');

// Read fresh on every call, not cached at require()-time — a bare env-var
// update (no code deploy) wouldn't otherwise reach an already-running process.
function frontendUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
}

// Guest checkouts get a synthetic @guest.cinesnap.app address, so tickets sent
// there vanish. The checkout page therefore collects the customer's real email
// and passes it as `ticketEmail` — apply it to the booking (pre-payment only)
// so the confirmation actually lands in their inbox.
const TICKET_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function applyTicketEmail(booking, ticketEmail) {
  const email = String(ticketEmail || '').trim().toLowerCase();
  if (!email || !TICKET_EMAIL_RE.test(email)) return;
  if (booking.paymentStatus === 'completed') return; // never rewrite a paid booking
  if (email !== booking.userEmail) booking.userEmail = email;
}

const TIER_THRESHOLDS = [
  { tier: 'Platinum', points: 2000 },
  { tier: 'Gold', points: 800 },
  { tier: 'Silver', points: 300 },
  { tier: 'Bronze', points: 0 },
];
function tierFor(points) {
  return TIER_THRESHOLDS.find((t) => points >= t.points)?.tier || 'Bronze';
}

/**
 * Idempotently mark a booking paid: flips status, marks seats on the show,
 * awards loyalty points, sends the confirmation email. Safe to call from both
 * the confirm endpoint and the webhook.
 */
async function completeBooking(booking, paymentIntentId) {
  if (booking.paymentStatus === 'completed') return { booking, emailPreview: null }; // already done

  booking.paymentStatus = 'completed';
  booking.status = 'confirmed';
  if (paymentIntentId) booking.paymentIntentId = paymentIntentId;

  // mark seats on the show
  const show = await Show.findById(booking.show);
  if (show && Array.isArray(show.seats) && show.seats.length > 0) {
    for (const seat of show.seats) {
      if (booking.seats.includes(seat.seatNumber)) {
        seat.isBooked = true;
        seat.bookedBy = booking.userId;
        seat.bookingId = booking._id;
      }
    }
    show.updateAvailableSeats();
    await show.save();
  }

  // loyalty: 1 point per ₹10 spent
  const earned = Math.round(booking.totalAmount / 10);
  const movie = await Booking.findById(booking._id).populate('movie').then((b) => b?.movie);

  // Ensure a user record exists so points always accrue (guests included).
  let user = await User.findOne({ clerkId: booking.userId });
  if (!user) {
    try {
      user = await User.create({
        clerkId: booking.userId,
        email: booking.userEmail,
        firstName: booking.userName || 'Guest',
        referralCode: `CINE${String(booking.userId).slice(-4).toUpperCase()}`,
      });
    } catch {
      user = await User.findOne({ clerkId: booking.userId }); // race / dup — refetch
    }
  }
  if (user) {
    user.loyaltyPoints += earned;
    user.totalBookings += 1;
    user.totalSpent += booking.totalAmount;
    user.tier = tierFor(user.loyaltyPoints);
    await user.save();
  }

  // Generate the scannable QR ticket (encodes a verification URL staff can open
  // at the door). Stored on the booking so the UI and email can both show it.
  if (!booking.qrCode) {
    try {
      const verifyUrl = `${frontendUrl()}/verify/${booking.bookingCode}`;
      booking.qrCode = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 1,
        color: { dark: '#0b0f1a', light: '#ffffff' },
      });
    } catch (err) {
      console.warn('⚠ QR generation failed:', err.message);
    }
  }

  // confirmation email (non-blocking failure)
  let emailPreview = null;
  if (!booking.emailSent) {
    const result = await sendBookingConfirmation({
      ...booking.toObject(),
      movieTitle: movie?.title,
    });
    // Only a real send (or a deliberate dev-mode skip) marks the booking done —
    // "skipped" in production means every transport failed, so leave emailSent
    // false to allow a retry, instead of silently losing the ticket forever.
    if (result?.sent || (result?.skipped && process.env.NODE_ENV !== 'production')) {
      booking.emailSent = true;
    }
    emailPreview = result?.preview || null; // Ethereal preview URL (dev only)
  }

  await booking.save();
  return { booking, emailPreview };
}

/**
 * POST /api/payment/create-checkout-session
 * body: { bookingId }
 */
const createSession = asyncHandler(async (req, res) => {
  if (!stripe) {
    res.status(503);
    throw new Error('Payments are not configured. Add STRIPE_SECRET_KEY to .env.');
  }

  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate('movie');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  if (booking.paymentStatus === 'completed') {
    res.status(400);
    throw new Error('This booking is already paid.');
  }

  const session = await createCheckoutSession({
    bookingId: booking._id,
    seats: booking.seats,
    amount: booking.totalAmount,
    userEmail: booking.userEmail,
    movieTitle: booking.movie?.title || 'Movie ticket',
    showDate: booking.showDate,
    showTime: booking.showTime,
  });

  booking.stripeSessionId = session.id;
  await booking.save();

  res.json({ url: session.url, sessionId: session.id });
});

/**
 * POST /api/payment/confirm
 * body: { sessionId }
 * Called by the success page — verifies the session and finalizes the booking.
 */
const confirmPayment = asyncHandler(async (req, res) => {
  if (!stripe) {
    res.status(503);
    throw new Error('Payments are not configured.');
  }
  const { sessionId } = req.body;
  const session = await retrieveSession(sessionId);

  if (session.payment_status !== 'paid') {
    res.status(402);
    throw new Error('Payment not completed.');
  }

  const bookingId = session.metadata?.bookingId;
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found for this session.');
  }

  const { emailPreview } = await completeBooking(booking, session.payment_intent);
  const populated = await Booking.findById(booking._id)
    .populate({ path: 'show', populate: { path: 'movie' } })
    .populate('movie')
    .lean();

  res.json({ success: true, booking: populated, emailPreview });
});

/**
 * POST /api/payment/dev-confirm
 * body: { bookingId }
 * Simulates a successful payment without Stripe — runs the exact same
 * `completeBooking` path (seat locking, loyalty, confirmation email) so the
 * whole booking flow is demoable and testable with zero external secrets.
 * This backs the checkout page's "Demo Payment" option, so it's mounted in
 * every environment.
 */
const devConfirmPayment = asyncHandler(async (req, res) => {
  const { bookingId, ticketEmail } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  applyTicketEmail(booking, ticketEmail);

  const { emailPreview } = await completeBooking(booking, `dev_pi_${booking._id}`);
  const populated = await Booking.findById(booking._id)
    .populate({ path: 'show', populate: { path: 'movie' } })
    .populate('movie')
    .lean();

  res.json({ success: true, simulated: true, booking: populated, emailPreview });
});

/**
 * POST /api/payment/resend-email
 * body: { bookingId }
 * Re-sends the confirmation email for an already-paid booking. Needed because
 * a "skipped" send (every transport unavailable, e.g. BREVO_API_KEY missing)
 * previously got marked emailSent=true with no way to recover the ticket —
 * this lets a paid booking's email be retried without re-running payment.
 */
const resendConfirmationEmail = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate('movie');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  if (booking.paymentStatus !== 'completed') {
    res.status(400);
    throw new Error('This booking has not been paid yet.');
  }

  const result = await sendBookingConfirmation({
    ...booking.toObject(),
    movieTitle: booking.movie?.title,
  });
  if (result?.sent) booking.emailSent = true;
  await booking.save();

  res.json({ success: true, result });
});

/**
 * GET /api/payment/config
 * Public — tells the frontend which real payment methods are available and the
 * Razorpay publishable key (safe to expose) so the client can open Checkout.
 */
const getPaymentConfig = asyncHandler(async (req, res) => {
  res.json({
    razorpay: {
      enabled: isRazorpayEnabled,
      keyId: isRazorpayEnabled ? razorpayKeyId : null,
      currency: razorpayCurrency,
    },
    stripe: { enabled: !!stripe },
  });
});

/**
 * POST /api/payment/razorpay/order
 * body: { bookingId }
 * Creates a Razorpay order for a pending booking and returns everything the
 * frontend needs to open Razorpay Checkout.
 */
const createRazorpayOrderHandler = asyncHandler(async (req, res) => {
  if (!razorpay) {
    res.status(503);
    throw new Error('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.');
  }

  const { bookingId, ticketEmail } = req.body;
  const booking = await Booking.findById(bookingId).populate('movie');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  if (booking.paymentStatus === 'completed') {
    res.status(400);
    throw new Error('This booking is already paid.');
  }
  applyTicketEmail(booking, ticketEmail);

  const order = await createRazorpayOrder({
    bookingId: booking._id,
    amount: booking.totalAmount,
    notes: { seats: booking.seats.join(','), movie: booking.movie?.title || '' },
  });

  booking.razorpayOrderId = order.id;
  await booking.save();

  res.json({
    orderId: order.id,
    amount: order.amount, // paise
    currency: order.currency,
    keyId: razorpayKeyId,
    booking: {
      id: booking._id,
      movieTitle: booking.movie?.title,
      seats: booking.seats,
      userName: booking.userName,
      userEmail: booking.userEmail,
    },
  });
});

/**
 * POST /api/payment/razorpay/verify
 * body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Called by the frontend after Razorpay Checkout succeeds. Verifies the
 * signature server-side, then finalizes the booking (seats, loyalty, email).
 */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body;

  if (!orderId || !paymentId || !signature) {
    res.status(400);
    throw new Error('Missing Razorpay payment fields.');
  }

  const ok = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!ok) {
    res.status(400);
    throw new Error('Payment verification failed — invalid signature.');
  }

  const booking = await Booking.findOne({ razorpayOrderId: orderId });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found for this order.');
  }

  booking.razorpayPaymentId = paymentId;
  const { emailPreview } = await completeBooking(booking, paymentId);
  const populated = await Booking.findById(booking._id)
    .populate({ path: 'show', populate: { path: 'movie' } })
    .populate('movie')
    .lean();

  res.json({ success: true, booking: populated, emailPreview });
});

/**
 * POST /api/payment/razorpay/webhook  (raw body)
 * Razorpay-driven confirmation — reliable even if the user closes the tab.
 * Requires RAZORPAY_WEBHOOK_SECRET to be configured.
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer (express.raw)

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).send('Invalid webhook signature');
  }

  const event = JSON.parse(rawBody.toString());
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const entity = event.payload?.payment?.entity || event.payload?.order?.entity;
    const orderId = entity?.order_id || entity?.id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (orderId) {
      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      if (booking) {
        if (paymentId) booking.razorpayPaymentId = paymentId;
        await completeBooking(booking, paymentId);
      }
    }
  }

  res.json({ received: true });
});

/**
 * POST /api/payment/webhook  (raw body)
 * Stripe-driven confirmation — reliable even if the user closes the tab.
 */
const handleWebhook = asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).end();

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = secret
      ? stripe.webhooks.constructEvent(req.body, sig, secret)
      : JSON.parse(req.body.toString());
  } catch (err) {
    return res.status(400).send(`Webhook signature error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) await completeBooking(booking, session.payment_intent);
    }
  }

  res.json({ received: true });
});

module.exports = {
  createSession,
  confirmPayment,
  devConfirmPayment,
  handleWebhook,
  resendConfirmationEmail,
  getPaymentConfig,
  createRazorpayOrderHandler,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
};
