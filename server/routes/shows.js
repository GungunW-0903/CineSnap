const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowsForMovie,
  getShowById,
  createShow,
} = require('../controllers/showController');

router.get('/', getShows);
router.get('/movie/:movieId', getShowsForMovie);
router.get('/:id', getShowById);
router.post('/', createShow);

module.exports = router;
