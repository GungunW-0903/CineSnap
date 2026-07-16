/**
 * Seed script — populates the database with sample movies and generated shows.
 * Run with:  npm run seed
 *
 * Show generation lives in lib/showFactory.js so this script and the startup
 * auto-seeder (config/autoSeed.js) always produce identical schedules.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const { movies } = require('./seedData');
const { generateShowDocs, DAYS_AHEAD } = require('./lib/showFactory');

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database…');

  await Movie.deleteMany({});
  await Show.deleteMany({});
  console.log('   Cleared existing movies & shows.');

  const createdMovies = await Movie.insertMany(movies);
  console.log(`   Inserted ${createdMovies.length} movies.`);

  // Coming-soon titles are not bookable — no showtimes for them.
  const bookable = createdMovies.filter((m) => m.status !== 'coming_soon');
  const docs = bookable.flatMap((movie) => generateShowDocs(movie._id));

  // Bulk insert — one round-trip instead of hundreds of Show.create() calls.
  await Show.insertMany(docs);

  console.log(`   Generated ${docs.length} shows across ${DAYS_AHEAD} days.`);
  console.log('✓ Seed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('✗ Seed failed:', err);
  process.exit(1);
});
