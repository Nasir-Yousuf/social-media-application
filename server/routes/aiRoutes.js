const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { aiPerUserLimiter } = require('../middleware/rateLimiter');
const aiController = require('../controllers/aiController');

// All AI endpoints require authentication
router.use(requireAuth);

// Persona Configuration
router.get('/persona', aiController.getPersonaConfig);
router.put('/persona', aiController.updatePersonaConfig);

// Multi-thread Conversation Management
router.get('/conversations', aiController.listConversations);
router.post('/conversations', aiController.createConversation);
router.get('/conversations/:id', aiController.getConversation);
router.patch('/conversations/:id', aiController.updateConversation);
router.delete('/conversations/:id', aiController.deleteConversation);
router.delete('/conversations/:id/messages', aiController.clearConversationMessages);

// Interactive AI Endpoints with Per-User Rate Limiting
router.post('/chat', aiPerUserLimiter, aiController.chat);
router.post('/classroom-mentor', aiPerUserLimiter, aiController.classroomMentor);
router.post('/explain-code', aiPerUserLimiter, aiController.explainCode);

module.exports = router;
