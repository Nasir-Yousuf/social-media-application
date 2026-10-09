const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatarUrl role')
      .populate({
        path: 'post',
        select: 'content codeSnippet tags isAnnouncement visibility createdAt',
      })
      .populate({
        path: 'conversation',
        select: 'lastMessage',
      })
      .populate({
        path: 'question',
        select: 'title track',
      })
      .populate('typingChallenge')
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
    const body = req.body || {};
    const query = req.query || {};
    const notificationId = body.notificationId || query.notificationId || req.params?.id;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { read: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return res.status(200).json({
      message: 'Notifications marked as read.',
      unreadCount,
    });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ message: 'Failed to update notification state.' });
  }
};

// Get unread notifications count and latest unread alert
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    // 1. Prioritize unread typing challenge alerts first so duel invitations are NEVER missed or hidden
    let latestUnread = await Notification.findOne({
      recipient: req.user._id,
      read: false,
      type: { $in: ['typing_challenge', 'typing_challenge_result'] },
    })
      .populate('sender', 'name username avatarUrl role')
      .populate('typingChallenge')
      .sort({ createdAt: -1 });

    // 2. If no unread challenge, fetch the latest general unread notification
    if (!latestUnread) {
      latestUnread = await Notification.findOne({
        recipient: req.user._id,
        read: false,
      })
        .populate('sender', 'name username avatarUrl role')
        .populate({
          path: 'post',
          select: 'content codeSnippet tags isAnnouncement',
        })
        .populate('typingChallenge')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      unreadCount,
      latestUnread: latestUnread || null,
    });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    return res.status(500).json({ message: 'Failed to get unread count.' });
  }
};

// Register or update device push token
exports.registerPushToken = async (req, res) => {
  try {
    const { token, platform = 'expo' } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Valid push token string is required.' });
    }

    const cleanToken = token.trim();
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!Array.isArray(user.pushTokens)) {
      user.pushTokens = [];
    }

    // Check if token already exists for this user
    const existingIdx = user.pushTokens.findIndex((t) => t.token === cleanToken);
    if (existingIdx >= 0) {
      user.pushTokens[existingIdx].updatedAt = new Date();
      user.pushTokens[existingIdx].platform = platform;
    } else {
      user.pushTokens.push({
        token: cleanToken,
        platform,
        updatedAt: new Date(),
      });
    }

    // Keep at most 5 latest active devices per user
    if (user.pushTokens.length > 5) {
      user.pushTokens = user.pushTokens.slice(-5);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Push token registered successfully.',
    });
  } catch (err) {
    console.error('registerPushToken error:', err);
    return res.status(500).json({ message: 'Failed to register push token.' });
  }
};

// Remove push token on logout
exports.removePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      // Remove all tokens for user
      await User.updateOne({ _id: userId }, { $set: { pushTokens: [] } });
    } else {
      await User.updateOne(
        { _id: userId },
        { $pull: { pushTokens: { token: token.trim() } } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Push token unregistered successfully.',
    });
  } catch (err) {
    console.error('removePushToken error:', err);
    return res.status(500).json({ message: 'Failed to remove push token.' });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ message: 'Preferences object is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      preferences: user.notificationPreferences,
    });
  } catch (err) {
    console.error('updatePreferences error:', err);
    return res.status(500).json({ message: 'Failed to update preferences.' });
  }
};

