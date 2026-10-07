const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Progress tracking
router.get('/progress', optionalAuth, learningController.getProgress);
router.post('/progress/complete', requireAuth, learningController.completeLesson);
router.post('/progress/save-code', requireAuth, learningController.saveLessonCode);

// Quizzes & Final Certification Exams
router.post('/quiz/submit', requireAuth, learningController.submitQuiz);
router.post('/exam/submit', requireAuth, learningController.submitExam);
router.get('/certificate/:certificateId', optionalAuth, learningController.getCertificate);

// Community Questions & Answers (supporting both plural and singular route aliases)
router.get(['/questions', '/question'], optionalAuth, learningController.getQuestions);
router.post(['/questions', '/question', '/questions/create', '/question/create'], requireAuth, learningController.createQuestion);
router.get(['/questions/:id', '/question/:id'], optionalAuth, learningController.getQuestionById);
router.post(['/questions/:id/upvote', '/question/:id/upvote'], requireAuth, learningController.toggleQuestionUpvote);
router.post(['/questions/:id/answers', '/question/:id/answers', '/questions/:id/answer', '/question/:id/answer'], requireAuth, learningController.createAnswer);
router.post(['/questions/:id/answers/:answerId/accept', '/question/:id/answers/:answerId/accept', '/questions/:id/answer/:answerId/accept', '/question/:id/answer/:answerId/accept'], requireAuth, learningController.acceptAnswer);
router.post(['/answers/:id/upvote', '/answer/:id/upvote'], requireAuth, learningController.toggleAnswerUpvote);

module.exports = router;
