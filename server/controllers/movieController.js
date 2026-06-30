const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/movies
 * Supports ?search= &genre= &sort=rating|newest|title|runtime|popular &status=
 */
const getMovies = asyncHandler(async (req, res) => {
  const { search, genre, sort = 'rating', status } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (genre && genre !== 'All') filter['genres.name'] = genre;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const sortMap = {
    rating: { vote_average: -1 },
    newest: { release_date: -1 },
    title: { title: 1 },
    runtime: { runtime: -1 },
    popular: { popularity: -1, viewCount: -1 },
  };

  const movies = await Movie.find(filter).sort(sortMap[sort] || sortMap.rating).lean();
  res.json(movies);
});

/** GET /api/movies/trending — top by popularity/views/rating. */
const getTrending = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
  const movies = await Movie.find({ status: { $ne: 'ended' } })
    .sort({ popularity: -1, viewCount: -1, vote_average: -1 })
    .limit(limit)
    .lean();
  res.json(movies);
});

/** GET /api/movies/:id — increments view count, includes review summary. */
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  ).lean();

  if (!movie) {
    res.status(404);
    throw new Error('Movie not found');
  }

  const reviews = await Review.find({ movie: movie._id }).sort({ createdAt: -1 }).limit(20).lean();
  const reviewCount = reviews.length;
  const avgUserRating =
    reviewCount > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;

  res.json({ ...movie, reviews, reviewCount, avgUserRating });
});

/** POST /api/movies — create (admin/seed). */
const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
});

module.exports = { getMovies, getTrending, getMovieById, createMovie };
