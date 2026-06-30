const { stripe, createCheckoutSession, retrieveSession } = require('../config/stripe');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendBookingConfirmation } = require('../services/emailService');

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
  if (booking.paymentStatus === 'completed') return booking; // already done

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

  // loyalty: 10 points per dollar
  const earned = Math.round(booking.totalAmount * 10);
  const movie = await Booking.findById(booking._id).populate('movie').then((b) => b?.movie);
  const user = await User.findOne({ clerkId: booking.userId });
  if (user) {
    user.loyaltyPoints += earned;
    user.totalBookings += 1;
    user.totalSpent += booking.totalAmount;
    user.tier = tierFor(user.loyaltyPoints);
    await user.save();
  }

  // confirmation email (non-blocking failure)
  if (!booking.emailSent) {
    const result = await sendBookingConfirmation({
      ...booking.toObject(),
      movieTitle: movie?.title,
    });
    if (result?.sent || result?.skipped) booking.emailSent = true;
  }

  await booking.save();
  return booking;
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

  await completeBooking(booking, session.payment_intent);
  const populated = await Booking.findById(booking._id)
    .populate({ path: 'show', populate: { path: 'movie' } })
    .populate('movie')
    .lean();

  res.json({ success: true, booking: populated });
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

module.exports = { createSession, confirmPayment, handleWebhook };
