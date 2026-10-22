const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Direct profile /me and avatar aliases for full mobile and client compatibility
router.get('/me', requireAuth, authController.getMe);
router.patch('/me/avatar', requireAuth, userController.updateProfile);

router.get('/directory', optionalAuth, userController.getCourseDirectory);

router.get('/suggestions', optionalAuth, userController.getSuggestions);
router.get('/profile/:username', optionalAuth, userController.getProfileByUsername);
router.patch('/profile', requireAuth, userController.updateProfile);
router.post('/sync-follows', requireAuth, userController.syncFollows);
router.get('/sync-follows', requireAuth, userController.syncFollows);
router.get('/:id/avatar', userController.getAvatar);

router.post('/:id/follow', requireAuth, userController.followUser);
router.delete('/:id/follow', requireAuth, userController.unfollowUser);
router.get('/:id/followers', requireAuth, userController.getFollowers);
router.get('/:id/following', requireAuth, userController.getFollowing);

module.exports = router;
