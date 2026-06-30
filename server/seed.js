/**
 * Seed script — populates the database with sample movies and generated shows.
 * Run with:  npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const { movies } = require('./seedData');

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // 8 rows
const SEATS_PER_ROW = 15; // 120 seats
const SHOWTIMES = ['11:00 AM', '2:30 PM', '6:00 PM', '9:15 PM'];
const FORMATS = ['2D', '3D', 'IMAX', 'Dolby'];
const PRICES = { '2D': 12, '3D': 15, IMAX: 19, Dolby: 17 };
const DAYS_AHEAD = 6;

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

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database…');

  await Movie.deleteMany({});
  await Show.deleteMany({});
  console.log('   Cleared existing movies & shows.');

  const createdMovies = await Movie.insertMany(movies);
  console.log(`   Inserted ${createdMovies.length} movies.`);

  let showCount = 0;
  const totalSeats = ROWS.length * SEATS_PER_ROW;

  for (const movie of createdMovies) {
    for (let day = 0; day < DAYS_AHEAD; day++) {
      // 3 showtimes per day, rotating which ones
      const times = SHOWTIMES.slice(0, 3 + (day % 2));
      for (let t = 0; t < times.length; t++) {
        const format = FORMATS[(day + t) % FORMATS.length];
        await Show.create({
          movie: movie._id,
          theater: { name: 'CineSnap Grand', location: 'Downtown', screen: `Screen ${(t % 4) + 1}` },
          date: dateStr(day),
          time: times[t],
          ticketPrice: PRICES[format],
          format,
          language: 'English',
          totalSeats,
          availableSeats: totalSeats,
          seats: buildSeats(),
          status: 'active',
        });
        showCount++;
      }
    }
  }

  console.log(`   Generated ${showCount} shows across ${DAYS_AHEAD} days.`);
  console.log('✓ Seed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('✗ Seed failed:', err);
  process.exit(1);
});
