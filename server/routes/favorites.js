const express = require('express');
const router = express.Router();
const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { attachUser } = require('../middleware/auth');

router.get('/:userId', getFavorites);
router.post('/toggle', attachUser, toggleFavorite);

module.exports = router;
