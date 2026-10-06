const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Progress tracking
router.get('/progress', optionalAuth, learningController.getProgress);
router.post('/progress/complete', requireAuth, learningController.completeLesson);
router.post('/progress/save-code', requireAuth, learningController.saveLessonCode);

// Community Questions & Answers
router.get('/questions', optionalAuth, learningController.getQuestions);
router.post('/questions', requireAuth, learningController.createQuestion);
router.get('/questions/:id', optionalAuth, learningController.getQuestionById);
router.post('/questions/:id/upvote', requireAuth, learningController.toggleQuestionUpvote);
router.post('/questions/:id/answers', requireAuth, learningController.createAnswer);
router.post('/questions/:id/answers/:answerId/accept', requireAuth, learningController.acceptAnswer);
router.post('/answers/:id/upvote', requireAuth, learningController.toggleAnswerUpvote);

module.exports = router;
