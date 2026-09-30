const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', notificationController.getNotifications);
router.patch('/mark-read', notificationController.markAsRead);
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router;
