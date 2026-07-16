const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

/** GET /api/shows?movie=&date= — list shows, optionally filtered. */
const getShows = asyncHandler(async (req, res) => {
  const { movie, date } = req.query;
  const filter = { status: { $in: ['active', 'full'] } };
  if (movie) filter.movie = movie;
  if (date) filter.date = date;

  const shows = await Show.find(filter).populate('movie').sort({ date: 1, time: 1 }).lean();
  res.json(shows);
});

/** GET /api/shows/movie/:movieId — grouped by date for the booking UI. */
const getShowsForMovie = asyncHandler(async (req, res) => {
  // Only today-onwards: past show dates must never appear in the booking UI.
  const today = new Date().toISOString().split('T')[0];
  const shows = await Show.find({
    movie: req.params.movieId,
    status: { $in: ['active', 'full'] },
    date: { $gte: today },
  })
    .sort({ date: 1, time: 1 })
    .lean();

  const byDate = {};
  for (const s of shows) {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push({
      showId: s._id,
      time: s.time,
      ticketPrice: s.ticketPrice,
      format: s.format,
      availableSeats: s.availableSeats,
    });
  }
  res.json({ movieId: req.params.movieId, dates: byDate });
});

/** GET /api/shows/:id — full show incl. occupied seats. */
const getShowById = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id).populate('movie').lean();
  if (!show) {
    res.status(404);
    throw new Error('Show not found');
  }
  // Confirmed bookings define occupied seats (authoritative).
  const bookings = await Booking.find({
    show: show._id,
    status: 'confirmed',
    paymentStatus: { $in: ['completed', 'pending'] },
  }).lean();
  const occupiedSeats = bookings.flatMap((b) => b.seats);
  res.json({ ...show, occupiedSeats });
});

/** POST /api/shows — create (admin/seed). */
const createShow = asyncHandler(async (req, res) => {
  const show = await Show.create(req.body);
  res.status(201).json(show);
});

module.exports = { getShows, getShowsForMovie, getShowById, createShow };
