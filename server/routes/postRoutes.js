const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/feed', requireAuth, postController.getFeed);
router.get('/explore', optionalAuth, postController.getExplorePosts);
router.get('/code-snippets', optionalAuth, postController.getCodeFeed);
router.get('/user/:username', optionalAuth, postController.getUserPosts);
router.post('/', requireAuth, postController.createPost);
router.get('/trending-hashtags', optionalAuth, postController.getTrendingHashtags);
router.post('/sync-views', requireAuth, postController.syncViews);
router.get('/sync-views', requireAuth, postController.syncViews);
router.post('/:id/view', optionalAuth, postController.recordView);
router.post('/:id/flag', requireAuth, postController.flagPost);
router.get('/:id', optionalAuth, postController.getPostById);
router.patch('/:id', requireAuth, postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

// Likes & Bookmarks
router.post('/:id/like', requireAuth, postController.toggleLike);
router.post('/:id/bookmark', requireAuth, postController.toggleBookmark);

// Digest
router.get('/digest/weekly', optionalAuth, postController.getDigest);

// Comments
router.get('/:postId/comments', optionalAuth, commentController.getCommentsByPost);
router.post('/:postId/comments', requireAuth, commentController.createComment);

module.exports = router;
