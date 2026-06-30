const express = require('express');
const router = express.Router();
const { getMovieReviews, upsertReview, likeReview } = require('../controllers/reviewController');
const { attachUser } = require('../middleware/auth');

router.get('/movie/:movieId', getMovieReviews);
router.post('/', attachUser, upsertReview);
router.post('/:id/like', likeReview);

module.exports = router;
