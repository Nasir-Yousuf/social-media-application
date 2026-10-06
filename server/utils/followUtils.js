const Follow = require('../models/Follow');
const User = require('../models/User');

/**
 * Purge any orphaned follow edges where follower or following user no longer exists,
 * or where a user follows themselves.
 */
async function purgeOrphanedFollows() {
  try {
    const validUsers = await User.find({}).select('_id');
    const validUserIds = validUsers.map((u) => u._id);

    const result = await Follow.deleteMany({
      $or: [
        { follower: { $nin: validUserIds } },
        { following: { $nin: validUserIds } },
        { $expr: { $eq: ['$follower', '$following'] } },
      ],
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Purged ${result.deletedCount} orphaned/invalid follow records.`);
    }

    return result.deletedCount || 0;
  } catch (err) {
    console.error('purgeOrphanedFollows error:', err);
    return 0;
  }
}

/**
 * Get authentic follower and following counts for a user, guaranteeing
 * that only existing, active users in the system are counted.
 */
async function getAuthenticFollowCounts(userId, validUserIds = null) {
  try {
    if (!validUserIds) {
      const validUsers = await User.find({}).select('_id');
      validUserIds = validUsers.map((u) => u._id);
    }

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({
        following: userId,
        follower: { $in: validUserIds, $ne: userId },
      }),
      Follow.countDocuments({
        follower: userId,
        following: { $in: validUserIds, $ne: userId },
      }),
    ]);

    return { followersCount, followingCount };
  } catch (err) {
    console.error('getAuthenticFollowCounts error:', err);
    return { followersCount: 0, followingCount: 0 };
  }
}

module.exports = {
  purgeOrphanedFollows,
  getAuthenticFollowCounts,
};
