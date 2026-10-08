const User = require('../models/User');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

/**
 * Special broadcast handles. These are never treated as usernames.
 *  - @everyone  -> every approved member on the platform
 *  - @followers -> every member who follows the sender
 */
const SPECIAL_MENTIONS = ['everyone', 'followers'];

// Matches "@handle" when not preceded by a word character (avoids emails like a@b.com)
const MENTION_REGEX = /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{3,20})/g;

/**
 * Extract mention intents from one or more text blocks.
 * @param  {...string} texts
 * @returns {{ usernames: string[], everyone: boolean, followers: boolean }}
 */
const extractMentions = (...texts) => {
  const usernames = new Set();
  let everyone = false;
  let followers = false;

  for (const text of texts) {
    if (!text || typeof text !== 'string') continue;
    MENTION_REGEX.lastIndex = 0;
    let match;
    while ((match = MENTION_REGEX.exec(text)) !== null) {
      const handle = match[2].toLowerCase();
      if (handle === 'everyone') everyone = true;
      else if (handle === 'followers') followers = true;
      else usernames.add(handle);
    }
  }

  return { usernames: [...usernames], everyone, followers };
};

/**
 * Resolve and send mention notifications. Guarantees at most ONE notification per
 * recipient per call (direct mentions take precedence over broadcast mentions).
 *
 * @param {Object}   opts
 * @param {string[]} opts.texts              Text blocks to scan for mentions
 * @param {ObjectId} opts.senderId           User who wrote the content
 * @param {Object}   opts.refs               Notification refs: { post, comment, question }
 * @param {string}   [opts.directType]       Notification type for direct @user mentions
 * @param {string}   [opts.broadcastType]    Notification type for @everyone / @followers
 * @param {Array}    [opts.excludeIds]       Users that must not be notified (e.g. already notified as author)
 * @param {Function} [opts.filterRecipients] async (ObjectId[]) => ObjectId[]; drop users who cannot view the content
 * @param {Set}      [opts.alreadyNotified]  String ids already notified for this content (edits)
 * @returns {Promise<{ notified: number, direct: number, broadcast: number }>}
 */
const notifyMentions = async ({
  texts = [],
  senderId,
  refs = {},
  directType = 'mention',
  broadcastType = 'everyone_mention',
  excludeIds = [],
  filterRecipients = null,
  alreadyNotified = null,
}) => {
  const result = { notified: 0, direct: 0, broadcast: 0 };
  if (!senderId) return result;

  const { usernames, everyone, followers } = extractMentions(...texts);
  if (usernames.length === 0 && !everyone && !followers) return result;

  const senderStr = senderId.toString();
  const blocked = new Set([senderStr, ...excludeIds.filter(Boolean).map((id) => id.toString())]);
  if (alreadyNotified) {
    for (const id of alreadyNotified) blocked.add(id.toString());
  }

  // 1. Direct mentions
  const directIds = [];
  if (usernames.length > 0) {
    const users = await User.find({ username: { $in: usernames }, isApproved: true }).select('_id');
    for (const u of users) {
      const idStr = u._id.toString();
      if (!blocked.has(idStr)) {
        directIds.push(u._id);
        blocked.add(idStr);
      }
    }
  }

  // 2. Broadcast mentions
  let broadcastIds = [];
  if (everyone) {
    const users = await User.find({ isApproved: true, _id: { $ne: senderId } }).select('_id');
    broadcastIds = users.map((u) => u._id).filter((id) => !blocked.has(id.toString()));
  } else if (followers) {
    const edges = await Follow.find({ following: senderId }).select('follower');
    broadcastIds = edges.map((e) => e.follower).filter((id) => id && !blocked.has(id.toString()));
  }

  // 3. Respect visibility of the content (e.g. followers-only posts)
  let finalDirect = directIds;
  let finalBroadcast = broadcastIds;
  if (typeof filterRecipients === 'function') {
    const allowed = new Set(
      (await filterRecipients([...directIds, ...broadcastIds])).map((id) => id.toString())
    );
    finalDirect = directIds.filter((id) => allowed.has(id.toString()));
    finalBroadcast = broadcastIds.filter((id) => allowed.has(id.toString()));
  }

  const docs = [
    ...finalDirect.map((recipient) => ({ recipient, sender: senderId, type: directType, ...refs })),
    ...finalBroadcast.map((recipient) => ({ recipient, sender: senderId, type: broadcastType, ...refs })),
  ];

  if (docs.length > 0) {
    await Notification.insertMany(docs, { ordered: false });
  }

  result.direct = finalDirect.length;
  result.broadcast = finalBroadcast.length;
  result.notified = docs.length;
  result.recipientIds = [...finalDirect, ...finalBroadcast];
  return result;
};

module.exports = {
  SPECIAL_MENTIONS,
  extractMentions,
  notifyMentions,
};
