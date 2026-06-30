const express = require('express');
const router = express.Router();
const { syncUser, getProfile } = require('../controllers/userController');

router.post('/sync', syncUser);
router.get('/:clerkId', getProfile);

module.exports = router;
