/**
 * Startup auto-seed — keeps the production database in sync with seedData.js
 * without any manual shell access (Render's free tier has no shell).
 *
 * On every boot, after the DB connects:
 *   1. Any seed movie missing from the DB (matched by tmdbId, falling back to
 *      title) is inserted. Existing movies are never modified or deleted.
 *   2. Seed-matched movies also get their `status` refreshed — so a film we
 *      promote from coming_soon → now_showing in seedData.js updates live.
 *   3. Every bookable movie (status ≠ coming_soon/ended) with no future shows
 *      gets a fresh 30-day showtime schedule.
 *
 * Idempotent: reboots and redeploys are no-ops once the DB is in sync.
 */
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const { movies: seedMovies } = require('../seedData');
const { generateShowDocs } = require('../lib/showFactory');

async function autoSeed() {
  try {
    // ---- 1. Insert seed movies that don't exist yet ----
    const existing = await Movie.find({}, { tmdbId: 1, title: 1, status: 1 }).lean();
    const byTmdbId = new Map(existing.filter((m) => m.tmdbId).map((m) => [m.tmdbId, m]));
    const byTitle = new Map(existing.map((m) => [m.title.toLowerCase(), m]));

    const missing = [];
    const statusUpdates = [];
    for (const seed of seedMovies) {
      const match =
        (seed.tmdbId && byTmdbId.get(seed.tmdbId)) || byTitle.get(seed.title.toLowerCase());
      if (!match) {
        missing.push(seed);
      } else if (seed.status && match.status !== seed.status) {
        statusUpdates.push({ _id: match._id, status: seed.status });
      }
    }

    if (missing.length > 0) {
      await Movie.insertMany(missing, { ordered: false });
      console.log(`🌱 Auto-seed: inserted ${missing.length} new movies.`);
    }

    for (const u of statusUpdates) {
      await Movie.updateOne({ _id: u._id }, { $set: { status: u.status } });
    }
    if (statusUpdates.length > 0) {
      console.log(`🌱 Auto-seed: refreshed status on ${statusUpdates.length} movies.`);
    }

    // ---- 2. Generate shows for bookable movies with no future showtimes ----
    const today = new Date().toISOString().split('T')[0];
    const bookable = await Movie.find(
      { status: { $nin: ['coming_soon', 'ended'] } },
      { _id: 1, title: 1 }
    ).lean();

    let scheduled = 0;
    for (const movie of bookable) {
      const hasFuture = await Show.exists({
        movie: movie._id,
        date: { $gte: today },
        status: { $in: ['active', 'full'] },
      });
      if (hasFuture) continue;

      await Show.insertMany(generateShowDocs(movie._id));
      scheduled++;
    }
    if (scheduled > 0) {
      console.log(`🌱 Auto-seed: generated 30-day showtimes for ${scheduled} movies.`);
    }

    if (missing.length === 0 && statusUpdates.length === 0 && scheduled === 0) {
      console.log('🌱 Auto-seed: database already in sync.');
    }
  } catch (err) {
    // Never let seeding take the API down — log and continue serving.
    console.error('✗ Auto-seed failed (continuing anyway):', err.message);
  }
}

module.exports = autoSeed;
