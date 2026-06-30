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
  res.json(booking);
});

/** PATCH /api/bookings/:id/cancel — cancel a booking and free the seats. */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }
  if (booking.status === 'cancelled') {
    return res.json({ message: 'Already cancelled', booking });
  }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'completed') booking.paymentStatus = 'refunded';
  await booking.save();
  res.json({ message: 'Booking cancelled', booking });
});

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
