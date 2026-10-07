const express = require('express');
const router = express.Router();
const typingController = require('../controllers/typingController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.post('/submit', requireAuth, typingController.submitResult);
router.get('/leaderboard', optionalAuth, typingController.getLeaderboard);
router.get('/contest', optionalAuth, typingController.getWeeklyContest);
router.get('/profile/:username', optionalAuth, typingController.getProfile);

module.exports = router;
