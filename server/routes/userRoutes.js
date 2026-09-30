const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/directory', requireAuth, userController.getCourseDirectory);
router.get('/suggestions', requireAuth, userController.getSuggestions);
router.get('/profile/:username', optionalAuth, userController.getProfileByUsername);
router.patch('/profile', requireAuth, userController.updateProfile);

router.post('/:id/follow', requireAuth, userController.followUser);
router.delete('/:id/follow', requireAuth, userController.unfollowUser);
router.get('/:id/followers', requireAuth, userController.getFollowers);
router.get('/:id/following', requireAuth, userController.getFollowing);

module.exports = router;
