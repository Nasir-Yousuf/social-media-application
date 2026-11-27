const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const LearningProgress = require('../models/LearningProgress');
const LearningQuestion = require('../models/LearningQuestion');
const LearningAnswer = require('../models/LearningAnswer');
const TypingProfile = require('../models/TypingProfile');
const TypingResult = require('../models/TypingResult');
const TypingChallenge = require('../models/TypingChallenge');
const AIConversation = require('../models/AIConversation');
const AIPersonaConfig = require('../models/AIPersonaConfig');
const { getAuthenticFollowCounts, purgeOrphanedFollows } = require('../utils/followUtils');
const { sendPushToUser } = require('../services/pushNotificationService');
const { logActivity } = require('../utils/auditLogger');
const { validateAndSanitizeImage, MAX_AVATAR_BYTES } = require('../utils/fileSecurity');
const { isCoAdmin } = require('./authController');

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
    const {
      name,
      bio,
      status,
      avatarUrl,
      avatarBase64,
      removeAvatar,
      coverUrl,
      coverBase64,
      removeCover,
    } = req.body;
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
      let rawBuffer;

      if (matches && matches.length === 3) {
        rawBuffer = Buffer.from(matches[2], 'base64');
      } else {
        rawBuffer = Buffer.from(avatarBase64, 'base64');
      }

      try {
        const sanitized = validateAndSanitizeImage(rawBuffer, {
          maxSize: MAX_AVATAR_BYTES,
          allowedFormats: ['jpeg', 'png', 'webp', 'gif'],
        });
        user.avatar = sanitized.buffer;
        user.avatarMimeType = sanitized.mimeType;
        user.hasCustomAvatar = true;
        user.avatarUrl = `/api/users/${user._id}/avatar?t=${Date.now()}`;
      } catch (validationErr) {
        return res.status(400).json({ message: validationErr.message });
      }
    } else if (avatarUrl) {
      user.avatarUrl = avatarUrl.trim();
    }

    // Process cover image
    const effectiveCoverBase64 = coverBase64 || (coverUrl && coverUrl.startsWith('data:') ? coverUrl : '');
    if (removeCover) {
      user.coverImage = undefined;
      user.coverMimeType = 'image/jpeg';
      user.hasCustomCover = false;
      user.coverUrl = '';
    } else if (effectiveCoverBase64) {
      const matches = effectiveCoverBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      const rawBuffer = matches && matches.length === 3
        ? Buffer.from(matches[2], 'base64')
        : Buffer.from(effectiveCoverBase64, 'base64');

      try {
        const sanitized = validateAndSanitizeImage(rawBuffer, {
          maxSize: 500 * 1024, // 500 KB limit for wide cover banners
          allowedFormats: ['jpeg', 'png', 'webp', 'gif'],
        });
        user.coverImage = sanitized.buffer;
        user.coverMimeType = sanitized.mimeType;
        user.hasCustomCover = true;
        user.coverUrl = `/api/users/${user._id}/cover?t=${Date.now()}`;
      } catch (validationErr) {
        return res.status(400).json({ message: validationErr.message });
      }
    } else if (coverUrl !== undefined && !coverUrl.startsWith('data:')) {
      user.coverUrl = coverUrl.trim();
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

// Serve cover image directly from MongoDB Buffer
exports.getCover = async (req, res) => {
  try {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');

    const user = await User.findById(req.params.id).select('+coverImage +coverMimeType');
    if (!user || !user.coverImage) {
      return res.status(404).json({ message: 'Cover image not found.' });
    }

    res.set('Content-Type', user.coverMimeType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return res.send(user.coverImage);
  } catch (err) {
    console.error('getCover error:', err);
    return res.status(500).json({ message: 'Failed to load cover image.' });
  }
};

// Serve avatar image directly from MongoDB Buffer
exports.getAvatar = async (req, res) => {
  try {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');

    const user = await User.findById(req.params.id).select('+avatar +avatarMimeType username');

    if (!user || !user.avatar) {
      const username = user?.username || 'user';
      return res.redirect(302, `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=1d9bf0,00ba7c,7856ff,f91880&textColor=ffffff&fontSize=40`);
    }

    res.set('Content-Type', user.avatarMimeType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return res.send(user.avatar);
  } catch (err) {
    console.error('getAvatar error:', err);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    return res.redirect(302, 'https://api.dicebear.com/7.x/initials/svg?seed=user');
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
    const notif = await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow',
    });

    try {
      const { broadcastNotification } = require('../sockets/socketManager');
      broadcastNotification(targetUserId, notif);
    } catch {}

    sendPushToUser(targetUserId, {
      title: 'New Follower',
      body: `@${req.user.username} started following you`,
      data: { type: 'follow', userId: currentUserId.toString() },
      channelId: 'social',
    }).catch((err) => console.warn('Follow push alert note:', err.message));

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
      .sort({ createdAt: -1 })
      .lean();

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
          ...(typeof u.toObject === 'function' ? u.toObject() : u),
          isFollowing: !!isFollowing,
          isSelf: currentUserId ? currentUserId.toString() === u._id?.toString() : false,
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
      .sort({ createdAt: -1 })
      .lean();

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
          ...(typeof u.toObject === 'function' ? u.toObject() : u),
          isFollowing: !!isFollowing,
          isSelf: currentUserId ? currentUserId.toString() === u._id?.toString() : false,
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
    const currentUserId = req.user ? req.user._id : null;
    const members = await User.find({ isApproved: true })
      .select('name username bio avatarUrl role createdAt')
      .sort({ role: 1, name: 1 })
      .lean();

    const validUserIds = members.map((m) => m._id);

    const enriched = await Promise.all(
      members.map(async (m) => {
        const [isFollowing, counts] = await Promise.all([
          currentUserId ? Follow.exists({ follower: currentUserId, following: m._id }) : false,
          getAuthenticFollowCounts(m._id, validUserIds),
        ]);
        return {
          ...(typeof m.toObject === 'function' ? m.toObject() : m),
          isFollowing: !!isFollowing,
          isSelf: currentUserId ? currentUserId.toString() === m._id?.toString() : false,
          followersCount: counts.followersCount,
          followingCount: counts.followingCount,
        };
      })
    );


    return res.status(200).json({ members: enriched, users: enriched });
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
    const followingEdges = currentUserId ? await Follow.find({ follower: currentUserId }).select('following').lean() : [];
    const followingIds = followingEdges.map((e) => e.following);
    if (currentUserId) followingIds.push(currentUserId); // exclude self

    // Find up to 5 members not followed yet
    const suggestions = await User.find({
      _id: { $nin: followingIds },
      isApproved: true,
    })
      .select('name username bio avatarUrl role')
      .limit(5)
      .lean();

    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (s) => {
        const counts = await getAuthenticFollowCounts(s._id);
        return {
          ...(typeof s.toObject === 'function' ? s.toObject() : s),
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

// Export all personal data archive as structured JSON ("Right to Data Portability")
exports.exportData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      user,
      posts,
      comments,
      bookmarks,
      follows,
      learningProgress,
      learningQuestions,
      learningAnswers,
      typingProfile,
      typingResults,
      aiPersonas,
    ] = await Promise.all([
      User.findById(userId).select('-password -__v'),
      Post.find({ author: userId }).select('-__v').sort({ createdAt: -1 }),
      Comment.find({ author: userId }).select('-__v').sort({ createdAt: -1 }),
      Bookmark.find({ user: userId }).populate('post', 'content title author createdAt').sort({ createdAt: -1 }),
      Follow.find({ $or: [{ follower: userId }, { following: userId }] }).populate('follower following', 'username name'),
      LearningProgress.findOne({ user: userId }).select('-__v'),
      LearningQuestion.find({ author: userId }).select('-__v'),
      LearningAnswer.find({ author: userId }).select('-__v'),
      TypingProfile.findOne({ user: userId }).select('-__v'),
      TypingResult.find({ user: userId }).select('-__v').sort({ createdAt: -1 }).limit(100),
      AIPersonaConfig.find({ user: userId }).select('-__v'),
    ]);

    const followingList = [];
    const followersList = [];
    for (const f of follows) {
      if (f.follower && f.follower._id && f.follower._id.equals(userId)) {
        followingList.push(f.following?.username || f.following);
      } else if (f.following && f.following._id && f.following._id.equals(userId)) {
        followersList.push(f.follower?.username || f.follower);
      }
    }

    const exportArchive = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      platform: 'Clearfeed',
      profile: user,
      activity: {
        postsCount: posts.length,
        commentsCount: comments.length,
        bookmarksCount: bookmarks.length,
        followingCount: followingList.length,
        followersCount: followersList.length,
      },
      social: {
        following: followingList,
        followers: followersList,
        bookmarks,
      },
      content: {
        posts,
        comments,
      },
      learn: {
        progress: learningProgress || null,
        discussions: {
          questions: learningQuestions,
          answers: learningAnswers,
        },
      },
      typing: {
        profile: typingProfile || null,
        recentResults: typingResults,
      },
      aiSettings: {
        personas: aiPersonas,
      },
    };

    await logActivity(req, 'user_data_export', { sizeKB: Math.round(JSON.stringify(exportArchive).length / 1024) }, req.user);

    const filename = `clearfeed-data-export-${user?.username || 'user'}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(JSON.stringify(exportArchive, null, 2));
  } catch (err) {
    console.error('exportData error:', err);
    return res.status(500).json({ message: 'Failed to generate data export archive.' });
  }
};

// Permanent account deletion & anonymization ("Right to be Forgotten")
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Your current account password is required to confirm deletion.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password. Account deletion aborted.' });
    }

    // Primary maintainer safeguard
    const username = (user.username || '').toLowerCase().trim();
    const email = (user.email || '').toLowerCase().trim();
    if (isCoAdmin(username, email)) {
      return res.status(403).json({
        message: 'Primary platform maintainer accounts cannot be deleted.',
      });
    }

    const userId = user._id;

    // Cascade delete user data across all collections
    await Promise.all([
      User.findByIdAndDelete(userId),
      Post.deleteMany({ author: userId }),
      Comment.deleteMany({ author: userId }),
      Like.deleteMany({ user: userId }),
      Bookmark.deleteMany({ user: userId }),
      Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
      Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
      LearningProgress.deleteMany({ user: userId }),
      LearningQuestion.deleteMany({ author: userId }),
      LearningAnswer.deleteMany({ author: userId }),
      TypingProfile.deleteMany({ user: userId }),
      TypingResult.deleteMany({ user: userId }),
      AIConversation.deleteMany({ user: userId }),
      AIPersonaConfig.deleteMany({ user: userId }),
    ]);

    await logActivity(req, 'user_self_deleted', { username, email }, user);

    return res.status(200).json({
      message: 'Your Clearfeed account and all associated personal data have been permanently deleted.',
    });
  } catch (err) {
    console.error('deleteAccount error:', err);
    return res.status(500).json({ message: 'Failed to delete account.' });
  }
};
