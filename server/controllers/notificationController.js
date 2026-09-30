const Notification = require('../models/Notification');

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatarUrl role')
      .populate({
        path: 'post',
        select: 'content',
      })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { read: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    }

    return res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ message: 'Failed to update notification state.' });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return res.status(200).json({ unreadCount: count });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    return res.status(500).json({ message: 'Failed to get unread count.' });
  }
};
