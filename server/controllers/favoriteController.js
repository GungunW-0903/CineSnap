const Favorite = require('../models/Favorite');
const { asyncHandler } = require('../middleware/errorHandler');

/** GET /api/favorites/:userId */
const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const favorites = await Favorite.find({ userId }).populate('movie').sort({ createdAt: -1 }).lean();
  res.json(favorites.map((f) => f.movie).filter(Boolean));
});

/** POST /api/favorites/toggle  body: { userId, movieId } -> { favorited } */
const toggleFavorite = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.body.userId;
  const { movieId } = req.body;
  if (!userId || !movieId) {
    res.status(400);
    throw new Error('userId and movieId are required.');
  }

  const existing = await Favorite.findOne({ userId, movie: movieId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ favorited: false });
  }
  await Favorite.create({ userId, movie: movieId });
  res.json({ favorited: true });
});

module.exports = { getFavorites, toggleFavorite };
