const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// Get user profile by username
exports.getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username: username.toLowerCase() });

    if (!targetUser) {
      return res.status(404).json({ message: 'Course member not found.' });
    }

    const currentUserId = req.user ? req.user._id : null;

    const [followersCount, followingCount, postsCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ following: targetUser._id }),
      Follow.countDocuments({ follower: targetUser._id }),
      Post.countDocuments({ author: targetUser._id }),
      currentUserId && !currentUserId.equals(targetUser._id)
        ? Follow.exists({ follower: currentUserId, following: targetUser._id })
        : false,
    ]);

    return res.status(200).json({
      user: {
        ...targetUser.toJSON(),
        followersCount,
        followingCount,
        postsCount,
        isFollowing: !!isFollowing,
        isSelf: currentUserId ? currentUserId.equals(targetUser._id) : false,
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

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: targetUserId }),
      Follow.countDocuments({ follower: targetUserId }),
    ]);

    return res.status(200).json({
      message: `You are now following @${targetUser.username}`,
      isFollowing: true,
      followersCount,
      followingCount,
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

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: targetUserId }),
      Follow.countDocuments({ follower: targetUserId }),
    ]);

    return res.status(200).json({
      message: 'Unfollowed successfully.',
      isFollowing: false,
      followersCount,
      followingCount,
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
    const follows = await Follow.find({ following: targetUserId })
      .populate('follower', 'name username bio avatarUrl role')
      .sort({ createdAt: -1 });

    const currentUserId = req.user._id;
    const users = await Promise.all(
      follows.map(async (f) => {
        const u = f.follower;
        if (!u) return null;
        const isFollowing = await Follow.exists({ follower: currentUserId, following: u._id });
        return {
          ...u.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId.equals(u._id),
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
    const follows = await Follow.find({ follower: targetUserId })
      .populate('following', 'name username bio avatarUrl role')
      .sort({ createdAt: -1 });

    const currentUserId = req.user._id;
    const users = await Promise.all(
      follows.map(async (f) => {
        const u = f.following;
        if (!u) return null;
        const isFollowing = await Follow.exists({ follower: currentUserId, following: u._id });
        return {
          ...u.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId.equals(u._id),
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

    const enriched = await Promise.all(
      members.map(async (m) => {
        const [isFollowing, followersCount] = await Promise.all([
          Follow.exists({ follower: currentUserId, following: m._id }),
          Follow.countDocuments({ following: m._id }),
        ]);
        return {
          ...m.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId.equals(m._id),
          followersCount,
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
    const currentUserId = req.user._id;

    // Get IDs of users current user already follows
    const followingEdges = await Follow.find({ follower: currentUserId }).select('following');
    const followingIds = followingEdges.map((e) => e.following);
    followingIds.push(currentUserId); // exclude self

    // Find up to 5 members not followed yet
    const suggestions = await User.find({
      _id: { $nin: followingIds },
      isApproved: true,
    })
      .select('name username bio avatarUrl role')
      .limit(5);

    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('getSuggestions error:', err);
    return res.status(500).json({ message: 'Error fetching suggestions.' });
  }
};
