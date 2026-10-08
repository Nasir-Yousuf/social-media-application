const express = require('express');
const router = express.Router();
const typingController = require('../controllers/typingController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

router.post('/submit', requireAuth, typingController.submitResult);
router.get('/leaderboard', optionalAuth, typingController.getLeaderboard);
router.get('/contest', optionalAuth, typingController.getWeeklyContest);
router.get('/profile/:username', optionalAuth, typingController.getProfile);

// Admin Leaderboard Moderation
router.delete('/leaderboard/:id', requireAuth, requireAdmin, typingController.removeLeaderboardEntry);
router.delete('/leaderboard/user/:userId', requireAuth, requireAdmin, typingController.removeUserFromLeaderboard);

// Typing Challenges / 1v1 Duels
router.post('/challenges', requireAuth, typingController.createChallenge);
router.get('/challenges', requireAuth, typingController.getChallenges);
router.get('/challenges/:id', optionalAuth, typingController.getChallengeById);
router.post('/challenges/:id/complete', requireAuth, typingController.completeChallenge);
router.post('/challenges/:id/decline', requireAuth, typingController.declineChallenge);

module.exports = router;
