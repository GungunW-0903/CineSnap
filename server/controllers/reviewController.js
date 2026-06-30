const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

/** GET /api/reviews/movie/:movieId */
const getMovieReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId })
    .sort({ likes: -1, createdAt: -1 })
    .lean();
  const count = reviews.length;
  const average = count ? +(reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(2) : null;
  res.json({ reviews, count, average });
});

/** POST /api/reviews  body: { movieId, userId, userName, rating, comment } (upsert) */
const upsertReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.body.userId;
  const userName = req.user?.userName || req.body.userName || 'Anonymous';
  const { movieId, rating, comment } = req.body;

  if (!userId || !movieId || !rating) {
    res.status(400);
    throw new Error('movieId, userId and rating are required.');
  }

  const review = await Review.findOneAndUpdate(
    { movie: movieId, userId },
    { movie: movieId, userId, userName, rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(review);
});

/** POST /api/reviews/:id/like */
const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  res.json(review);
});

module.exports = { getMovieReviews, upsertReview, likeReview };
