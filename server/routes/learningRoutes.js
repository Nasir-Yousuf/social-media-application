const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Progress tracking
router.get('/progress', optionalAuth, learningController.getProgress);
router.post('/progress/complete', requireAuth, learningController.completeLesson);
router.post('/progress/active', requireAuth, learningController.setActiveLesson);
router.post('/progress/save-code', requireAuth, learningController.saveLessonCode);

// Quizzes & Final Certification Exams
router.post('/quiz/submit', requireAuth, learningController.submitQuiz);
router.post('/exam/submit', requireAuth, learningController.submitExam);
router.get('/certificate/:certificateId', optionalAuth, learningController.getCertificate);

// Community Questions & Answers (Explicit single and plural routes for robust Express matching)
router.get('/questions', optionalAuth, learningController.getQuestions);
router.get('/question', optionalAuth, learningController.getQuestions);

router.post('/questions', optionalAuth, learningController.createQuestion);
router.post('/question', optionalAuth, learningController.createQuestion);
router.post('/questions/create', optionalAuth, learningController.createQuestion);
router.post('/question/create', optionalAuth, learningController.createQuestion);

router.get('/questions/:id', optionalAuth, learningController.getQuestionById);
router.get('/question/:id', optionalAuth, learningController.getQuestionById);

router.post('/questions/:id/upvote', requireAuth, learningController.toggleQuestionUpvote);
router.post('/question/:id/upvote', requireAuth, learningController.toggleQuestionUpvote);

router.post('/questions/:id/answers', requireAuth, learningController.createAnswer);
router.post('/question/:id/answers', requireAuth, learningController.createAnswer);
router.post('/questions/:id/answer', requireAuth, learningController.createAnswer);
router.post('/question/:id/answer', requireAuth, learningController.createAnswer);

router.post('/questions/:id/answers/:answerId/accept', requireAuth, learningController.acceptAnswer);
router.post('/question/:id/answers/:answerId/accept', requireAuth, learningController.acceptAnswer);

router.post('/answers/:id/upvote', requireAuth, learningController.toggleAnswerUpvote);
router.post('/answer/:id/upvote', requireAuth, learningController.toggleAnswerUpvote);

// Question CRUD (Edit & Delete)
router.patch('/questions/:id', requireAuth, learningController.updateQuestion);
router.patch('/question/:id', requireAuth, learningController.updateQuestion);
router.delete('/questions/:id', requireAuth, learningController.deleteQuestion);
router.delete('/question/:id', requireAuth, learningController.deleteQuestion);

// Answer CRUD (Edit & Delete)
router.patch('/answers/:id', requireAuth, learningController.updateAnswer);
router.patch('/answer/:id', requireAuth, learningController.updateAnswer);
router.delete('/answers/:id', requireAuth, learningController.deleteAnswer);
router.delete('/answer/:id', requireAuth, learningController.deleteAnswer);

module.exports = router;
