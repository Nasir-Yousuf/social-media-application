const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { optionalAuth } = require('../middleware/auth');

// CodeHub Direct Endpoints
router.get('/feed', optionalAuth, postController.getCodeFeed);
router.get('/snippets', optionalAuth, postController.getCodeFeed);
router.get('/:id/diff', optionalAuth, postController.getPostDiff);
router.get('/:id', optionalAuth, postController.getPostById);

module.exports = router;
