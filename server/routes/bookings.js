const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  applyPromo,
  verifyTicket,
  checkInTicket,
} = require('../controllers/bookingController');
const { requireUser, attachUser, requireOwnership } = require('../middleware/auth');

// Creating a booking requires an authenticated user.
router.post('/', requireUser, createBooking);

// Ticket verification (public — the QR code points here). Declared before
// `/:id` so "verify" isn't swallowed as an id.
router.get('/verify/:code', verifyTicket);
router.post('/verify/:code/checkin', checkInTicket);

// Reading a user's bookings: must be signed in AND own the id in the path.
router.get('/user/:userId', requireUser, requireOwnership('userId'), getMyBookings);

// Single booking / cancel / promo: identify the user, then verify ownership.
router.get('/:id', attachUser, getBookingById);
router.patch('/:id/cancel', requireUser, cancelBooking);
router.post('/:id/promo', requireUser, applyPromo);

module.exports = router;
