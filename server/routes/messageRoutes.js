const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/conversations', messageController.getConversations);
router.get('/conversations/:conversationId', messageController.getMessages);
router.delete('/conversations/:conversationId', messageController.deleteConversation);
router.delete('/conversations/:conversationId/messages', messageController.clearConversation);
router.post('/conversations', messageController.startConversation);
router.post('/send', messageController.sendMessage);
router.delete('/:messageId', messageController.deleteMessage);
router.post('/:messageId/react', messageController.reactToMessage);
router.get('/unread-total', messageController.getUnreadTotal);

module.exports = router;
