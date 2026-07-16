/**
 * Shared show-generation logic — used by the one-off seed script (seed.js)
 * and the startup auto-seeder (config/autoSeed.js) so both produce identical,
 * realistic showtimes and pricing.
 */

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // 8 rows
const SEATS_PER_ROW = 15; // 120 seats

// A full day of showtimes, tagged by slot so pricing can react to the time of
// day (matinees are cheaper, evening prime-time costs more).
const SHOWTIMES = [
  { time: '09:15 AM', slot: 'matinee' },
  { time: '11:45 AM', slot: 'matinee' },
  { time: '02:30 PM', slot: 'afternoon' },
  { time: '05:15 PM', slot: 'afternoon' },
  { time: '06:45 PM', slot: 'prime' },
  { time: '09:30 PM', slot: 'prime' },
  { time: '11:59 PM', slot: 'latenight' },
];

const FORMATS = ['2D', '3D', 'IMAX', 'Dolby', '4DX'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu'];

// Base ticket price per format, in INR (Razorpay settles in rupees).
const BASE_PRICES = { '2D': 200, '3D': 320, Dolby: 450, IMAX: 600, '4DX': 750 };

// Multipliers layered on top of the base price to feel like a real box office.
const SLOT_MULTIPLIER = {
  matinee: 0.75, // cheap early-bird shows
  afternoon: 1.0, // standard
  prime: 1.25, // evening prime-time premium
  latenight: 0.9, // slight late-night discount
};
const WEEKEND_MULTIPLIER = 1.2; // Fri/Sat/Sun surcharge

const DAYS_AHEAD = 30;

// Round to the nearest ₹10 so prices look like a real menu (₹340, not ₹337.5).
function priceFor(format, slot, isWeekend) {
  const raw = BASE_PRICES[format] * SLOT_MULTIPLIER[slot] * (isWeekend ? WEEKEND_MULTIPLIER : 1);
  return Math.round(raw / 10) * 10;
}

function buildSeats() {
  const seats = [];
  for (const row of ROWS) {
    for (let i = 1; i <= SEATS_PER_ROW; i++) {
      seats.push({ seatNumber: `${row}${i}`, row, isBooked: false });
    }
  }
  return seats;
}

function dateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Build DAYS_AHEAD days of Show documents for one movie.
 * Returns plain objects ready for Show.insertMany().
 */
function generateShowDocs(movieId, daysAhead = DAYS_AHEAD) {
  const totalSeats = ROWS.length * SEATS_PER_ROW;
  const docs = [];

  for (let day = 0; day < daysAhead; day++) {
    const d = new Date();
    d.setDate(d.getDate() + day);
    const dow = d.getDay(); // 0=Sun … 6=Sat
    const isWeekend = dow === 0 || dow === 5 || dow === 6; // Fri/Sat/Sun
    const date = dateStr(day);

    // Every day runs the full slate of showtimes, so users always see a rich
    // list of timings. Format/language rotate per show for variety.
    for (let t = 0; t < SHOWTIMES.length; t++) {
      const { time, slot } = SHOWTIMES[t];
      const format = FORMATS[(day + t) % FORMATS.length];
      const language = LANGUAGES[(day + t) % LANGUAGES.length];
      docs.push({
        movie: movieId,
        theater: {
          name: 'CineSnap Grand',
          location: 'Downtown',
          screen: `Screen ${(t % 5) + 1}`,
        },
        date,
        time,
        ticketPrice: priceFor(format, slot, isWeekend),
        format,
        language,
        totalSeats,
        availableSeats: totalSeats,
        seats: buildSeats(),
        status: 'active',
      });
    }
  }

  return docs;
}

module.exports = {
  ROWS,
  SEATS_PER_ROW,
  SHOWTIMES,
  DAYS_AHEAD,
  priceFor,
  buildSeats,
  dateStr,
  generateShowDocs,
};
