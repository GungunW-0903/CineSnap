const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/bookings
 * Creates a pending booking and locks the requested seats (if still free).
 * Payment is completed separately via the payment controller.
 * body: { showId, seats[], userId, userEmail, userName }
 */
const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;
  const userId = req.user?.userId || req.body.userId;
  const userEmail = req.user?.userEmail || req.body.userEmail;
  const userName = req.user?.userName || req.body.userName || 'Guest';

  if (!userId || !userEmail) {
    res.status(400);
    throw new Error('Missing user information (sign in required).');
  }
  if (!showId || !Array.isArray(seats) || seats.length === 0) {
    res.status(400);
    throw new Error('A show and at least one seat are required.');
  }

  const show = await Show.findById(showId).populate('movie');
  if (!show) {
    res.status(404);
    throw new Error('Show not found.');
  }

  // Seat-conflict check against active bookings.
  const activeBookings = await Booking.find({
    show: showId,
    status: 'confirmed',
    paymentStatus: { $in: ['completed', 'pending'] },
  }).lean();
  const taken = new Set(activeBookings.flatMap((b) => b.seats));
  const clash = seats.filter((s) => taken.has(s));
  if (clash.length > 0) {
    res.status(409);
    throw new Error(`Seats no longer available: ${clash.join(', ')}`);
  }

  const totalAmount = +(show.ticketPrice * seats.length).toFixed(2);

  const booking = await Booking.create({
    userId,
    userEmail,
    userName,
    show: show._id,
    movie: show.movie._id,
    seats,
    totalAmount,
    showDate: show.date,
    showTime: show.time,
    paymentStatus: 'pending',
    status: 'confirmed',
  });

  res.status(201).json({
    booking,
    movieTitle: show.movie.title,
    poster: show.movie.poster_path,
  });
});

/**
 * GET /api/bookings/user/:userId  (or ?userId=)
 * Powers the My Bookings page. Newest first, fully populated.
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user?.userId || req.query.userId;
  if (!userId) {
    res.status(400);
    throw new Error('User id required.');
  }

  const bookings = await Booking.find({ userId })
    .populate({ path: 'show', populate: { path: 'movie' } })
    .populate('movie')
    .sort({ createdAt: -1 })
    .lean();

  res.json(bookings);
});

/** GET /api/bookings/:id — single booking (ticket detail). */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({ path: 'show', populate: { path: 'movie' } })
    .populate('movie')
    .lean();
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  // If the caller is identified, only let them see their own ticket.
  if (req.user?.userId && booking.userId !== req.user.userId) {
    res.status(403);
    throw new Error('You can only view your own booking.');
  }
  res.json(booking);
});

/** PATCH /api/bookings/:id/cancel — cancel a booking and free the seats. */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  if (booking.userId !== req.user?.userId) {
    res.status(403);
    throw new Error('You can only cancel your own booking.');
  }
  if (booking.status === 'cancelled') {
    return res.json({ message: 'Already cancelled', booking });
  }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'completed') booking.paymentStatus = 'refunded';
  await booking.save();

  // Release the seats on the show so the seat map reflects availability again.
  const show = await Show.findById(booking.show);
  if (show && Array.isArray(show.seats) && show.seats.length > 0) {
    let changed = false;
    for (const seat of show.seats) {
      if (booking.seats.includes(seat.seatNumber) && seat.isBooked) {
        seat.isBooked = false;
        seat.bookedBy = undefined;
        seat.bookingId = undefined;
        changed = true;
      }
    }
    if (changed) {
      show.updateAvailableSeats();
      await show.save();
    }
  }

  res.json({ message: 'Booking cancelled', booking });
});

// Available promo codes. `type` is 'percent' or 'flat'.
const PROMOS = {
  CINE10: { type: 'percent', value: 10, label: '10% off' },
  WEEKEND15: { type: 'percent', value: 15, label: '15% off' },
  FLAT5: { type: 'flat', value: 5, label: '$5 off' },
  FIRST50: { type: 'percent', value: 50, label: '50% off your booking' },
};

/**
 * POST /api/bookings/:id/promo
 * body: { code }
 * Applies a promo code to a pending booking and recomputes the total.
 */
const applyPromo = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const promo = PROMOS[code];
  if (!promo) {
    res.status(400);
    throw new Error('Invalid or expired promo code.');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  if (booking.userId !== req.user?.userId) {
    res.status(403);
    throw new Error('You can only modify your own booking.');
  }
  if (booking.paymentStatus === 'completed') {
    res.status(400);
    throw new Error('This booking is already paid.');
  }

  const base = booking.originalAmount ?? booking.totalAmount;
  const discount =
    promo.type === 'percent'
      ? +((base * promo.value) / 100).toFixed(2)
      : Math.min(promo.value, base);

  booking.originalAmount = base;
  booking.promoCode = code;
  booking.discount = discount;
  booking.totalAmount = +(base - discount).toFixed(2);
  await booking.save();

  res.json({
    success: true,
    promo: { code, label: promo.label },
    discount,
    originalAmount: base,
    totalAmount: booking.totalAmount,
    booking,
  });
});

/**
 * GET /api/bookings/verify/:code
 * Public endpoint the QR code points at — returns whether a ticket is valid and
 * its details, so door staff can verify a scan. Does NOT mutate anything.
 */
const verifyTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ bookingCode: req.params.code })
    .populate('movie')
    .lean();

  if (!booking) {
    return res.status(404).json({ valid: false, reason: 'not_found', message: 'Ticket not found.' });
  }

  const problems = {
    cancelled: 'This ticket was cancelled.',
    unpaid: 'Payment not completed for this ticket.',
    used: 'This ticket has already been checked in.',
  };

  let state = 'valid';
  if (booking.status === 'cancelled') state = 'cancelled';
  else if (booking.paymentStatus !== 'completed') state = 'unpaid';
  else if (booking.status === 'used') state = 'used';

  res.json({
    valid: state === 'valid',
    state,
    message: problems[state] || 'Ticket is valid.',
    ticket: {
      bookingCode: booking.bookingCode,
      movieTitle: booking.movie?.title,
      poster: booking.movie?.poster_path,
      showDate: booking.showDate,
      showTime: booking.showTime,
      seats: booking.seats,
      userName: booking.userName,
      totalAmount: booking.totalAmount,
      checkedIn: booking.status === 'used',
    },
  });
});

/**
 * POST /api/bookings/verify/:code/checkin
 * Marks a valid ticket as used (checked in). Idempotent-ish: re-checking a used
 * ticket returns 409 so staff see it was already scanned.
 */
const checkInTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ bookingCode: req.params.code });
  if (!booking) {
    res.status(404);
    throw new Error('Ticket not found.');
  }
  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('This ticket was cancelled.');
  }
  if (booking.paymentStatus !== 'completed') {
    res.status(402);
    throw new Error('Payment not completed for this ticket.');
  }
  if (booking.status === 'used') {
    res.status(409);
    throw new Error('This ticket has already been checked in.');
  }

  booking.status = 'used';
  await booking.save();
  res.json({ success: true, message: 'Checked in ✓', bookingCode: booking.bookingCode });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  applyPromo,
  verifyTicket,
  checkInTicket,
};
