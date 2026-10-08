const express = require('express');
const router = express.Router();
const typingController = require('../controllers/typingController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

// Submit typing score (registered or guest)
router.post(['/submit', '/results'], optionalAuth, typingController.submitResult);
router.get('/leaderboard', optionalAuth, typingController.getLeaderboard);
router.get('/contest', optionalAuth, typingController.getWeeklyContest);
router.get('/profile/:username', optionalAuth, typingController.getProfile);

// Admin Leaderboard Moderation
router.delete('/leaderboard/:id', requireAuth, requireAdmin, typingController.removeLeaderboardEntry);
router.delete('/leaderboard/user/:userId', requireAuth, requireAdmin, typingController.removeUserFromLeaderboard);

// Typing Challenges / 1v1 Duels (supports /typing/challenges, /api/typing/challenges, /api/challenges, /challenges)
router.post(['/challenges', '/api/typing/challenges', '/typing/challenges', '/'], optionalAuth, typingController.createChallenge);
router.get(['/challenges', '/api/typing/challenges', '/typing/challenges', '/'], optionalAuth, typingController.getChallenges);
router.get(['/challenges/:id', '/api/typing/challenges/:id', '/typing/challenges/:id', '/:id'], optionalAuth, typingController.getChallengeById);
router.post(['/challenges/:id/complete', '/api/typing/challenges/:id/complete', '/typing/challenges/:id/complete', '/:id/complete'], optionalAuth, typingController.completeChallenge);
router.post(['/challenges/:id/decline', '/api/typing/challenges/:id/decline', '/typing/challenges/:id/decline', '/:id/decline'], optionalAuth, typingController.declineChallenge);

module.exports = router;

