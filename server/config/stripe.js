const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠ STRIPE_SECRET_KEY not set. Payment features will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

/**
 * Create a Stripe Checkout Session for movie ticket booking
 */
const createCheckoutSession = async ({ bookingId, seats, amount, userEmail, movieTitle, showDate, showTime }) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: movieTitle,
          description: `${seats.length} ticket(s) - ${showDate} at ${showTime}`,
          images: ['https://yourdomain.com/ticket-icon.png'], // Add your ticket icon URL
        },
        unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
      },
      quantity: 1,
    }],
    metadata: {
      bookingId: bookingId.toString(),
      seats: seats.join(','),
      showDate,
      showTime,
    },
    success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/booking-cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
  });

  return session;
};

/**
 * Create a Payment Intent for direct payment
 */
const createPaymentIntent = async ({ amount, currency = 'usd', metadata }) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
};

/**
 * Retrieve a checkout session
 */
const retrieveSession = async (sessionId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Process a refund
 */
const createRefund = async (paymentIntentId, amount = null) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const refundData = { payment_intent: paymentIntentId };
  if (amount) {
    refundData.amount = Math.round(amount * 100);
  }

  return await stripe.refunds.create(refundData);
};

module.exports = {
  stripe,
  createCheckoutSession,
  createPaymentIntent,
  retrieveSession,
  createRefund,
};
