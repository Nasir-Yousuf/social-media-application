const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Follow = require('../models/Follow');

exports.searchAll = async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';

    if (!q) {
      return res.status(200).json({ users: [], posts: [] });
    }

    const cleanQ = q.replace(/^#/, '').trim();
    const regex = new RegExp(cleanQ || q, 'i');
    const currentUserId = req.user ? req.user._id : null;

    // Search users
    const users = await User.find({
      $or: [{ name: regex }, { username: regex }, { bio: regex }],
      isApproved: true,
    })
      .select('name username bio avatarUrl role')
      .limit(15);

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const [isFollowing, followersCount, followingCount] = await Promise.all([
          currentUserId
            ? Follow.exists({ follower: currentUserId, following: u._id })
            : false,
          Follow.countDocuments({ following: u._id }),
          Follow.countDocuments({ follower: u._id }),
        ]);
        return {
          ...u.toObject(),
          isFollowing: !!isFollowing,
          isSelf: currentUserId ? currentUserId.equals(u._id) : false,
          followersCount,
          followingCount,
        };
      })
    );

    // Search posts (by text, hashtag in tags array, or snippet)
    const posts = await Post.find({
      $or: [
        { content: regex },
        { tags: cleanQ.toLowerCase() },
        { 'codeSnippet.title': regex },
        { 'codeSnippet.language': cleanQ.toLowerCase() },
      ],
    })
      .populate('author', 'name username avatarUrl role')
      .sort({ createdAt: -1 })
      .limit(25);

    const postIds = posts.map((p) => p._id);
    const userLikes = currentUserId
      ? await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post')
      : [];
    const likedSet = new Set(userLikes.map((l) => l.post.toString()));

    const enrichedPosts = posts.map((p) => ({
      ...p.toObject(),
      viewsCount: Array.isArray(p.viewedBy) && p.viewedBy.length > 0
        ? p.viewedBy.length
        : Math.max(1, p.viewsCount || 1),
      isLiked: likedSet.has(p._id.toString()),
      isOwner: currentUserId ? p.author && p.author._id.equals(currentUserId) : false,
    }));

    return res.status(200).json({
      users: enrichedUsers,
      posts: enrichedPosts,
    });
  } catch (err) {
    console.error('searchAll error:', err);
    return res.status(500).json({ message: 'Search execution error.' });
  }
};
