const express = require('express');
const router = express.Router();
const { getMovies, getTrending, getMovieById, createMovie } = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/trending', getTrending);
router.get('/:id', getMovieById);
router.post('/', createMovie);

module.exports = router;
