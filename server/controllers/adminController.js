const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// Admin Platform Overview & Analytics
exports.getOverview = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, totalLikes, recentUsers] = await Promise.all([
      User.countDocuments({}),
      Post.countDocuments({}),
      Comment.countDocuments({}),
      Like.countDocuments({}),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('name username email role createdAt'),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
      },
      recentUsers,
    });
  } catch (err) {
    console.error('getOverview error:', err);
    return res.status(500).json({ message: 'Failed to retrieve admin overview.' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ role: 1, createdAt: -1 });

    const enriched = await Promise.all(
      users.map(async (u) => {
        const postsCount = await Post.countDocuments({ author: u._id });
        return {
          ...u.toJSON(),
          postsCount,
        };
      })
    );

    return res.status(200).json({ users: enriched });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ message: 'Error fetching users.' });
  }
};

// Toggle user role
exports.toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own admin role.' });
    }

    user.role = user.role === 'admin' ? 'student' : 'admin';
    await user.save();

    return res.status(200).json({
      message: `User @${user.username} role updated to ${user.role}.`,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('toggleUserRole error:', err);
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
};

// Toggle user status (suspend / approve)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot suspend your own account.' });
    }

    user.isApproved = !user.isApproved;
    await user.save();

    return res.status(200).json({
      message: `User status changed to ${user.isApproved ? 'Active' : 'Suspended'}.`,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    return res.status(500).json({ message: 'Failed to update user status.' });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id.equals(id)) {
      return res.status(400).json({ message: 'Cannot delete your own account via admin.' });
    }

    await Promise.all([
      User.findByIdAndDelete(id),
      Post.deleteMany({ author: id }),
      Comment.deleteMany({ author: id }),
      Like.deleteMany({ user: id }),
      Follow.deleteMany({ $or: [{ follower: id }, { following: id }] }),
      Notification.deleteMany({ $or: [{ recipient: id }, { sender: id }] }),
    ]);

    return res.status(200).json({ message: 'Course member and associated data deleted.' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
};

// Admin Moderation: get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const [posts, totalUsers] = await Promise.all([
      Post.find({})
        .populate('author', 'name username email role avatarUrl')
        .sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    const sanitizedPosts = posts.map((p) => {
      const viewerSet = new Set();
      if (Array.isArray(p.viewedBy)) {
        for (const v of p.viewedBy) {
          if (v) viewerSet.add(v.toString());
        }
      }
      if (p.author) {
        viewerSet.add(p.author._id ? p.author._id.toString() : p.author.toString());
      }
      const uniqueViews = Math.min(
        Math.max(1, viewerSet.size),
        totalUsers > 0 ? totalUsers : 1
      );
      return {
        ...p.toObject(),
        viewsCount: uniqueViews,
      };
    });

    return res.status(200).json({ posts: sanitizedPosts });
  } catch (err) {
    console.error('admin getAllPosts error:', err);
    return res.status(500).json({ message: 'Error retrieving posts for moderation.' });
  }
};

// Admin Platform Reset: purge all data for fresh real-world launch
exports.purgeAllData = async (req, res) => {
  try {
    const { cleanAllData } = require('../scripts/cleanData');
    const summary = await cleanAllData({ exitOnComplete: false });
    return res.status(200).json({
      message: 'All dummy users and platform data have been permanently deleted.',
      deleted: summary,
    });
  } catch (err) {
    console.error('purgeAllData error:', err);
    return res.status(500).json({ message: 'Failed to purge data: ' + err.message });
  }
};
