const User = require('../models/User');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Validates whether a token matches standard Expo push token patterns
 */
function isValidExpoPushToken(token) {
  if (typeof token !== 'string') return false;
  return /^(ExponentPushToken|ExpoPushToken)\[.*\]$/.test(token.trim());
}

/**
 * Sends push notification(s) to a recipient user across all registered devices
 * @param {string|mongoose.Types.ObjectId} userId - Recipient user ID
 * @param {object} payload - Notification payload { title, body, data, sound, badge, priority, channelId }
 */
async function sendPushToUser(userId, payload = {}) {
  try {
    if (!userId) return { success: false, reason: 'No userId provided' };

    const user = await User.findById(userId).select('pushTokens notificationPreferences');
    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      return { success: false, reason: 'No push tokens registered for user' };
    }

    // Check user notification preferences if configured
    const notifType = payload.data?.type;
    const prefs = user.notificationPreferences || {};
    if (notifType === 'message' && prefs.messages === false) {
      return { success: false, reason: 'User disabled message push alerts' };
    }
    if (notifType === 'like' && prefs.likes === false) {
      return { success: false, reason: 'User disabled like push alerts' };
    }
    if (notifType === 'comment' && prefs.comments === false) {
      return { success: false, reason: 'User disabled comment push alerts' };
    }
    if (notifType === 'follow' && prefs.follows === false) {
      return { success: false, reason: 'User disabled follow push alerts' };
    }
    if (notifType === 'announcement' && prefs.announcements === false) {
      return { success: false, reason: 'User disabled announcement push alerts' };
    }

    const validTokens = user.pushTokens
      .map((t) => t.token)
      .filter((tok) => isValidExpoPushToken(tok));

    if (validTokens.length === 0) {
      return { success: false, reason: 'No valid Expo push tokens found' };
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: payload.sound || 'default',
      title: payload.title || 'Clearfeed',
      body: payload.body || 'You have a new notification',
      data: payload.data || {},
      badge: typeof payload.badge === 'number' ? payload.badge : undefined,
      priority: payload.priority || 'high',
      channelId: payload.channelId || 'default',
      _displayInForeground: true,
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const resData = await response.json().catch(() => ({}));

    // Handle token cleanup for invalid or unregistered devices
    if (resData?.data && Array.isArray(resData.data)) {
      const tokensToRemove = [];
      resData.data.forEach((ticket, idx) => {
        if (ticket.status === 'error') {
          if (ticket.details?.error === 'DeviceNotRegistered') {
            tokensToRemove.push(validTokens[idx]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await User.updateOne(
          { _id: user._id },
          { $pull: { pushTokens: { token: { $in: tokensToRemove } } } }
        );
      }
    }

    return { success: true, count: validTokens.length };
  } catch (err) {
    console.warn('Push notification dispatch error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  isValidExpoPushToken,
  sendPushToUser,
};
