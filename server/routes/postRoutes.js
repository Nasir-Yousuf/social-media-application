const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/feed', requireAuth, postController.getFeed);
router.get('/explore', optionalAuth, postController.getExplorePosts);
router.get('/user/:username', optionalAuth, postController.getUserPosts);
router.post('/', requireAuth, postController.createPost);
router.get('/:id', optionalAuth, postController.getPostById);
router.patch('/:id', requireAuth, postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

// Likes
router.post('/:id/like', requireAuth, postController.toggleLike);

// Comments
router.get('/:postId/comments', optionalAuth, commentController.getCommentsByPost);
router.post('/:postId/comments', requireAuth, commentController.createComment);

module.exports = router;
