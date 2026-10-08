const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const TypingProfile = require('../models/TypingProfile');
const TypingChallenge = require('../models/TypingChallenge');
const { getAuthenticFollowCounts, purgeOrphanedFollows } = require('../utils/followUtils');

// Get user profile by username
exports.getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username: username.toLowerCase() });

    if (!targetUser) {
      return res.status(404).json({ message: 'Course member not found.' });
    }

    const currentUserId = req.user ? req.user._id : null;

    const [counts, postsCount, isFollowing, typingProfile, duelsWonCount] = await Promise.all([
      getAuthenticFollowCounts(targetUser._id),
      Post.countDocuments({ author: targetUser._id }),
      currentUserId && !currentUserId.equals(targetUser._id)
        ? Follow.exists({ follower: currentUserId, following: targetUser._id })
        : false,
      TypingProfile.findOne({ user: targetUser._id }),
      TypingChallenge.countDocuments({ winner: targetUser._id, status: 'completed' }),
    ]);

    return res.status(200).json({
      user: {
        ...targetUser.toJSON(),
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
        postsCount,
        isFollowing: !!isFollowing,
        isSelf: currentUserId ? currentUserId.equals(targetUser._id) : false,
        typingStats: typingProfile
          ? {
              bestWpm: typingProfile.bestWpm || 0,
              avgWpm: typingProfile.avgWpm || 0,
              bestAccuracy: typingProfile.bestAccuracy || 0,
              testsCompleted: typingProfile.testsCompleted || 0,
              highestCombo: typingProfile.highestCombo || 0,
              currentRank: typingProfile.currentRank || 'Novice',
              xp: typingProfile.xp || 0,
              badges: typingProfile.badges || ['⌨️ Keyboard Initiate'],
              duelsWon: duelsWonCount || 0,
            }
          : {
              bestWpm: 0,
              avgWpm: 0,
              bestAccuracy: 0,
              testsCompleted: 0,
              highestCombo: 0,
              currentRank: 'Novice',
              xp: 0,
              badges: ['⌨️ Keyboard Initiate'],
              duelsWon: duelsWonCount || 0,
            },
      },
    });
  } catch (err) {
    console.error('getProfileByUsername error:', err);
    return res.status(500).json({ message: 'Error retrieving member profile.' });
  }
};

// Update profile (own)
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, status, avatarUrl, avatarBase64, removeAvatar } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (status !== undefined) user.status = status.trim().slice(0, 60);

    // Process remove avatar
    if (removeAvatar) {
      user.avatar = undefined;
      user.avatarMimeType = 'image/jpeg';
      user.hasCustomAvatar = false;
      user.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=1d9bf0,00ba7c,7856ff,f91880&textColor=ffffff&fontSize=40`;
    } else if (avatarBase64) {
      // Process avatar base64 upload if provided
      const matches = avatarBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let buffer;
      let mimeType = 'image/jpeg';

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(avatarBase64, 'base64');
      }

      // 200KB limit enforcement
      const MAX_SIZE = 200 * 1024;
      if (buffer.length > MAX_SIZE) {
        return res.status(400).json({
          message: `Profile photo must be under 200KB (current: ${(buffer.length / 1024).toFixed(1)}KB).`,
        });
      }

      user.avatar = buffer;
      user.avatarMimeType = mimeType;
      user.hasCustomAvatar = true;
      user.avatarUrl = `/api/users/${user._id}/avatar?t=${Date.now()}`;
    } else if (avatarUrl) {
      user.avatarUrl = avatarUrl.trim();
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// Serve avatar image directly from MongoDB Buffer
exports.getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+avatar +avatarMimeType');

    if (!user || !user.avatar) {
      return res.status(404).json({ message: 'Avatar image not found.' });
    }

    res.set('Content-Type', user.avatarMimeType || 'image/jpeg');
    res.set('Cache-Control', 'no-cache, private, must-revalidate');
    return res.send(user.avatar);
  } catch (err) {
    console.error('getAvatar error:', err);
    return res.status(500).json({ message: 'Error retrieving avatar image.' });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (currentUserId.equals(targetUserId)) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user does not exist.' });
    }

    // Try creating follow
    const existing = await Follow.findOne({ follower: currentUserId, following: targetUserId });
    if (existing) {
      return res.status(400).json({ message: 'You are already following this member.' });
    }

    await Follow.create({ follower: currentUserId, following: targetUserId });

    // Create notification
    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow',
    });

    const [targetCounts, currentCounts] = await Promise.all([
      getAuthenticFollowCounts(targetUserId),
      getAuthenticFollowCounts(currentUserId),
    ]);

    return res.status(200).json({
      message: `You are now following @${targetUser.username}`,
      isFollowing: true,
      followersCount: targetCounts.followersCount,
      followingCount: targetCounts.followingCount,
      currentUserFollowersCount: currentCounts.followersCount,
      currentUserFollowingCount: currentCounts.followingCount,
      targetUserId,
    });
  } catch (err) {
    console.error('followUser error:', err);
    return res.status(500).json({ message: 'Failed to follow user.' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });

    const [targetCounts, currentCounts] = await Promise.all([
      getAuthenticFollowCounts(targetUserId),
      getAuthenticFollowCounts(currentUserId),
    ]);

    return res.status(200).json({
      message: 'Unfollowed successfully.',
      isFollowing: false,
      followersCount: targetCounts.followersCount,
      followingCount: targetCounts.followingCount,
      currentUserFollowersCount: currentCounts.followersCount,
      currentUserFollowingCount: currentCounts.followingCount,
      targetUserId,
    });
  } catch (err) {
    console.error('unfollowUser error:', err);
    return res.status(500).json({ message: 'Failed to unfollow user.' });
  }
};

// Get followers list
exports.getFollowers = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const validUsers = await User.find({}).select('_id');
    const validUserIds = validUsers.map((u) => u._id);

    const follows = await Follow.find({
      following: targetUserId,
      follower: { $in: validUserIds },
    })
      .populate('follower', 'name username bio avatarUrl role')
      .sort({ createdAt: -1 });

    const currentUserId = req.user._id;
    const users = await Promise.all(
      follows.map(async (f) => {
        const u = f.follower;
        if (!u) return null;
        const [isFollowing, counts] = await Promise.all([
          Follow.exists({ follower: currentUserId, following: u._id }),
          getAuthenticFollowCounts(u._id, validUserIds),
        ]);
        return {
          ...u.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId.equals(u._id),
          followersCount: counts.followersCount,
          followingCount: counts.followingCount,
        };
      })
    );

    return res.status(200).json({ followers: users.filter(Boolean) });
  } catch (err) {
    console.error('getFollowers error:', err);
    return res.status(500).json({ message: 'Error retrieving followers.' });
  }
};

// Get following list
exports.getFollowing = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const validUsers = await User.find({}).select('_id');
    const validUserIds = validUsers.map((u) => u._id);

    const follows = await Follow.find({
      follower: targetUserId,
      following: { $in: validUserIds },
    })
      .populate('following', 'name username bio avatarUrl role')
      .sort({ createdAt: -1 });

    const currentUserId = req.user._id;
    const users = await Promise.all(
      follows.map(async (f) => {
        const u = f.following;
        if (!u) return null;
        const [isFollowing, counts] = await Promise.all([
          Follow.exists({ follower: currentUserId, following: u._id }),
          getAuthenticFollowCounts(u._id, validUserIds),
        ]);
        return {
          ...u.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId.equals(u._id),
          followersCount: counts.followersCount,
          followingCount: counts.followingCount,
        };
      })
    );

    return res.status(200).json({ following: users.filter(Boolean) });
  } catch (err) {
    console.error('getFollowing error:', err);
    return res.status(500).json({ message: 'Error retrieving following list.' });
  }
};

// Get course member directory (~35 students)
exports.getCourseDirectory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const members = await User.find({ isApproved: true })
      .select('name username bio avatarUrl role createdAt')
      .sort({ role: 1, name: 1 });

    const validUserIds = members.map((m) => m._id);

    const enriched = await Promise.all(
      members.map(async (m) => {
        const [isFollowing, counts] = await Promise.all([
          Follow.exists({ follower: currentUserId, following: m._id }),
          getAuthenticFollowCounts(m._id, validUserIds),
        ]);
        return {
          ...m.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId.equals(m._id),
          followersCount: counts.followersCount,
          followingCount: counts.followingCount,
        };
      })
    );

    return res.status(200).json({ members: enriched });
  } catch (err) {
    console.error('getCourseDirectory error:', err);
    return res.status(500).json({ message: 'Error fetching course directory.' });
  }
};

// Get suggestions for who to follow
exports.getSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;

    // Get IDs of users current user already follows
    const followingEdges = currentUserId ? await Follow.find({ follower: currentUserId }).select('following') : [];
    const followingIds = followingEdges.map((e) => e.following);
    if (currentUserId) followingIds.push(currentUserId); // exclude self

    // Find up to 5 members not followed yet
    const suggestions = await User.find({
      _id: { $nin: followingIds },
      isApproved: true,
    })
      .select('name username bio avatarUrl role')
      .limit(5);

    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (s) => {
        const counts = await getAuthenticFollowCounts(s._id);
        return {
          ...s.toObject(),
          followersCount: counts.followersCount,
          followingCount: counts.followingCount,
        };
      })
    );

    return res.status(200).json({ suggestions: enrichedSuggestions });
  } catch (err) {
    console.error('getSuggestions error:', err);
    return res.status(500).json({ message: 'Error fetching suggestions.' });
  }
};

// Sync and purge orphaned follows across the system
exports.syncFollows = async (req, res) => {
  try {
    const purgedCount = await purgeOrphanedFollows();
    return res.status(200).json({
      message: `Follow graph synchronized. Purged ${purgedCount} invalid/orphaned follow records.`,
      purgedCount,
    });
  } catch (err) {
    console.error('syncFollows error:', err);
    return res.status(500).json({ message: 'Failed to sync follow graph.' });
  }
};
