const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const { getAuthenticFollowCounts } = require('../utils/followUtils');
const { buildVisibilityFilter, sanitizePostForViewer } = require('./postController');

exports.searchAll = async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';

    if (!q) {
      return res.status(200).json({ users: [], posts: [] });
    }

    const cleanQ = q.replace(/^#/, '').trim();
    const regex = new RegExp(cleanQ || q, 'i');
    const currentUserId = req.user ? req.user._id : null;
    const isAdmin = req.user?.role === 'admin';

    // Search users
    const users = await User.find({
      $or: [{ name: regex }, { username: regex }, { bio: regex }],
      isApproved: true,
    })
      .select('name username bio avatarUrl role')
      .limit(15);

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const [isFollowing, counts] = await Promise.all([
          currentUserId
            ? Follow.exists({ follower: currentUserId, following: u._id })
            : false,
          getAuthenticFollowCounts(u._id),
        ]);
        return {
          ...u.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId ? currentUserId.equals(u._id) : false,
          followersCount: counts.followersCount,
          followingCount: counts.followingCount,
        };
      })
    );

    // Search posts with visibility filter (by text, hashtag in tags array, or snippet)
    const visFilter = await buildVisibilityFilter(currentUserId, isAdmin);
    const searchFilter = {
      $or: [
        { content: regex },
        { tags: cleanQ.toLowerCase() },
        { 'codeSnippet.title': regex },
        { 'codeSnippet.language': cleanQ.toLowerCase() },
      ],
    };
    const finalPostQuery = Object.keys(visFilter).length > 0 ? { $and: [searchFilter, visFilter] } : searchFilter;

    const posts = await Post.find(finalPostQuery)
      .populate('author', 'name username avatarUrl role')
      .populate('audience', 'name username avatarUrl role')
      .populate('excludedAudience', 'name username avatarUrl role')
      .sort({ createdAt: -1 })
      .limit(25);

    const postIds = posts.map((p) => p._id);
    const userLikes = currentUserId
      ? await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post')
      : [];
    const likedSet = new Set(userLikes.map((l) => l.post.toString()));

    const totalUsers = await User.countDocuments();
    const enrichedPosts = posts.map((p) => {
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
      return sanitizePostForViewer(
        {
          ...p.toObject(),
          viewsCount: uniqueViews,
          isLiked: likedSet.has(p._id.toString()),
          isOwner: currentUserId ? p.author && p.author._id.equals(currentUserId) : false,
        },
        currentUserId,
        isAdmin
      );
    });

    return res.status(200).json({
      users: enrichedUsers,
      posts: enrichedPosts,
    });
  } catch (err) {
    console.error('searchAll error:', err);
    return res.status(500).json({ message: 'Search execution error.' });
  }
};
