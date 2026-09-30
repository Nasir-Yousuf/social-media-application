const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to enrich post with currentUser state
const enrichPost = async (post, currentUserId) => {
  const isLiked = currentUserId ? await Like.exists({ post: post._id, user: currentUserId }) : false;
  const isOwner = currentUserId ? post.author && post.author._id.equals(currentUserId) : false;

  return {
    ...post.toObject(),
    isLiked: !!isLiked,
    isOwner,
  };
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, isAnnouncement, isPinned } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content cannot be empty.' });
    }

    if (content.trim().length > 280) {
      return res.status(400).json({ message: 'Post cannot exceed 280 characters.' });
    }

    const isAdmin = req.user.role === 'admin';

    const post = new Post({
      author: req.user._id,
      content: content.trim(),
      isAnnouncement: isAdmin ? !!isAnnouncement : false,
      isPinned: isAdmin ? !!isPinned : false,
    });

    await post.save();
    await post.populate('author', 'name username avatarUrl role');

    // If it's an official announcement, notify all course members
    if (post.isAnnouncement) {
      const allStudents = await User.find({ _id: { $ne: req.user._id }, isApproved: true }).select('_id');
      const notifications = allStudents.map((s) => ({
        recipient: s._id,
        sender: req.user._id,
        type: 'announcement',
        post: post._id,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    return res.status(201).json({
      message: 'Post published to the course feed.',
      post: {
        ...post.toObject(),
        isLiked: false,
        isOwner: true,
      },
    });
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ message: 'Failed to create post.' });
  }
};

// Get Feed (All or Following)
exports.getFeed = async (req, res) => {
  try {
    const tab = req.query.tab || 'all'; // 'all' or 'following'
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const currentUserId = req.user._id;
    let query = {};

    if (tab === 'following') {
      const followingEdges = await Follow.find({ follower: currentUserId }).select('following');
      const followingIds = followingEdges.map((e) => e.following);
      followingIds.push(currentUserId); // include own posts in following feed
      query = { author: { $in: followingIds } };
    }

    const posts = await Post.find(query)
      .populate('author', 'name username avatarUrl role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    // Batch query likes for current user to avoid N+1 queries
    const postIds = posts.map((p) => p._id);
    const userLikes = await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post');
    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));

    const enrichedPosts = posts.map((post) => ({
      ...post.toObject(),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isOwner: post.author && post.author._id.equals(currentUserId),
    }));

    return res.status(200).json({
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        totalPosts,
        hasMore: skip + posts.length < totalPosts,
      },
    });
  } catch (err) {
    console.error('getFeed error:', err);
    return res.status(500).json({ message: 'Failed to load course feed.' });
  }
};

// Get single post
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name username avatarUrl role');

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const enriched = await enrichPost(post, req.user ? req.user._id : null);
    return res.status(200).json({ post: enriched });
  } catch (err) {
    console.error('getPostById error:', err);
    return res.status(500).json({ message: 'Error retrieving post.' });
  }
};

// Update own post
exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content cannot be empty.' });
    }

    if (content.trim().length > 280) {
      return res.status(400).json({ message: 'Post cannot exceed 280 characters.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only author can edit post
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to edit this post.' });
    }

    post.content = content.trim();
    post.isEdited = true;
    await post.save();
    await post.populate('author', 'name username avatarUrl role');

    const enriched = await enrichPost(post, req.user._id);

    return res.status(200).json({
      message: 'Post updated successfully.',
      post: enriched,
    });
  } catch (err) {
    console.error('updatePost error:', err);
    return res.status(500).json({ message: 'Failed to update post.' });
  }
};

// Delete post (Owner or Admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isOwner = post.author.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }

    // Cascade delete comments, likes, and notifications
    await Promise.all([
      Post.findByIdAndDelete(post._id),
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
      Notification.deleteMany({ post: post._id }),
    ]);

    return res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ message: 'Failed to delete post.' });
  }
};

// Toggle like on a post
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const existingLike = await Like.findOne({ post: postId, user: currentUserId });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      // Clean up notification if user unliked
      await Notification.findOneAndDelete({
        recipient: post.author,
        sender: currentUserId,
        type: 'like',
        post: postId,
      });

      return res.status(200).json({
        liked: false,
        likesCount: Math.max(0, updatedPost.likesCount),
      });
    } else {
      // Like
      await Like.create({ post: postId, user: currentUserId });
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true }
      );

      // Notify post author if not liking own post
      if (!post.author.equals(currentUserId)) {
        await Notification.create({
          recipient: post.author,
          sender: currentUserId,
          type: 'like',
          post: postId,
        });
      }

      return res.status(200).json({
        liked: true,
        likesCount: updatedPost.likesCount,
      });
    }
  } catch (err) {
    console.error('toggleLike error:', err);
    return res.status(500).json({ message: 'Failed to update like status.' });
  }
};

// Get posts by a specific user (profile view)
exports.getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentUserId = req.user ? req.user._id : null;
    const posts = await Post.find({ author: user._id })
      .populate('author', 'name username avatarUrl role')
      .sort({ createdAt: -1 });

    const postIds = posts.map((p) => p._id);
    const userLikes = currentUserId
      ? await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post')
      : [];
    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));

    const enriched = posts.map((post) => ({
      ...post.toObject(),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
    }));

    return res.status(200).json({ posts: enriched });
  } catch (err) {
    console.error('getUserPosts error:', err);
    return res.status(500).json({ message: 'Error retrieving user posts.' });
  }
};

// Get Explore posts (popular and trending course posts)
exports.getExplorePosts = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;

    // Get posts sorted by highest engagement (likes + comments)
    const posts = await Post.find({})
      .populate('author', 'name username avatarUrl role')
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .limit(30);

    const postIds = posts.map((p) => p._id);
    const userLikes = currentUserId
      ? await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post')
      : [];
    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));

    const enriched = posts.map((post) => ({
      ...post.toObject(),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
    }));

    return res.status(200).json({ posts: enriched });
  } catch (err) {
    console.error('getExplorePosts error:', err);
    return res.status(500).json({ message: 'Failed to retrieve explore feed.' });
  }
};
