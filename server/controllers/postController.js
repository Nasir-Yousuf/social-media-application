const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');

// Helper to enrich post with currentUser state
const enrichPost = async (post, currentUserId) => {
  const [isLiked, isBookmarked] = await Promise.all([
    currentUserId ? Like.exists({ post: post._id, user: currentUserId }) : false,
    currentUserId ? Bookmark.exists({ post: post._id, user: currentUserId }) : false,
  ]);
  const isOwner = currentUserId ? post.author && post.author._id.equals(currentUserId) : false;

  const uniqueViews = Array.isArray(post.viewedBy) && post.viewedBy.length > 0
    ? post.viewedBy.length
    : Math.max(1, post.viewsCount || 1);

  return {
    ...post.toObject(),
    viewsCount: uniqueViews,
    isLiked: !!isLiked,
    isBookmarked: !!isBookmarked,
    isOwner,
  };
};

// Helper to sanitize multi-file or single-file code snippets
const sanitizeSnippet = (codeSnippet) => {
  if (!codeSnippet) return null;

  let files = [];
  if (Array.isArray(codeSnippet.files) && codeSnippet.files.length > 0) {
    files = codeSnippet.files
      .filter((f) => f && f.code && f.code.trim())
      .map((f, idx) => ({
        name: (f.name || `file${idx + 1}`).trim().slice(0, 100),
        language: (f.language || 'javascript').toLowerCase().trim(),
        code: f.code.slice(0, 25000),
      }));
  } else if (codeSnippet.code && codeSnippet.code.trim()) {
    files = [
      {
        name: (codeSnippet.title || 'snippet').trim().slice(0, 100),
        language: (codeSnippet.language || 'javascript').toLowerCase().trim(),
        code: codeSnippet.code.slice(0, 25000),
      },
    ];
  }

  if (files.length === 0) return null;

  return {
    title: (codeSnippet.title || files[0].name || '').trim().slice(0, 120),
    files,
    code: files[0].code,
    language: files[0].language,
  };
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, codeSnippet, isAnnouncement, isPinned, forkedFrom, location } = req.body;

    const formattedSnippet = sanitizeSnippet(codeSnippet);
    let trimmedContent = content ? content.trim() : '';

    // If content is empty but codeSnippet is provided, provide a default content
    if (!trimmedContent && formattedSnippet) {
      trimmedContent = formattedSnippet.title
        ? `Shared snippet: ${formattedSnippet.title}`
        : `Shared ${formattedSnippet.files.length} code file${formattedSnippet.files.length > 1 ? 's' : ''}`;
    }

    if (!trimmedContent) {
      return res.status(400).json({ message: 'Post content or code snippet cannot be empty.' });
    }

    if (trimmedContent.length > 2000) {
      return res.status(400).json({ message: 'Post text cannot exceed 2000 characters.' });
    }

    // Extract hashtags (e.g., #javascript, #cs518, #react)
    const extractedTags = [];
    const tagMatches = trimmedContent.match(/#([a-zA-Z0-9_\u00c0-\u017e]+)/g);
    if (tagMatches) {
      tagMatches.forEach((t) => {
        const clean = t.replace('#', '').toLowerCase();
        if (!extractedTags.includes(clean)) {
          extractedTags.push(clean);
        }
      });
    }

    const isAdmin = req.user.role === 'admin';

    const post = new Post({
      author: req.user._id,
      content: trimmedContent,
      codeSnippet: formattedSnippet,
      forkedFrom: forkedFrom || null,
      isAnnouncement: isAdmin ? !!isAnnouncement : false,
      isPinned: isAdmin ? !!isPinned : false,
      location: location ? location.trim().slice(0, 100) : '',
      tags: extractedTags,
      viewedBy: [req.user._id],
      viewsCount: 1, // Author is the first unique viewer
    });

    await post.save();

    if (forkedFrom) {
      await Post.findByIdAndUpdate(forkedFrom, { $inc: { forksCount: 1 } });
    }

    await post.populate('author', 'name username avatarUrl role status');
    if (post.forkedFrom) {
      await post.populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      });
    }

    // If it's an official announcement, notify all members
    if (post.isAnnouncement) {
      const allMembers = await User.find({ _id: { $ne: req.user._id }, isApproved: true }).select('_id');
      const notifications = allMembers.map((s) => ({
        recipient: s._id,
        sender: req.user._id,
        type: 'announcement',
        post: post._id,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    // Extract @mentions from post content and notify mentioned members
    const mentionMatches = trimmedContent.match(/@([a-zA-Z0-9_]{3,20})/g);
    if (mentionMatches) {
      const usernames = [...new Set(mentionMatches.map((m) => m.slice(1).toLowerCase()))];
      const mentionedUsers = await User.find({
        username: { $in: usernames },
        _id: { $ne: req.user._id },
        isApproved: true,
      }).select('_id');

      if (mentionedUsers.length > 0) {
        const mentionNotifs = mentionedUsers.map((u) => ({
          recipient: u._id,
          sender: req.user._id,
          type: 'mention',
          post: post._id,
        }));
        await Notification.insertMany(mentionNotifs);
      }
    }

    return res.status(201).json({
      message: 'Post published to Clearfeed.',
      post: {
        ...post.toObject(),
        isLiked: false,
        isBookmarked: false,
        isOwner: true,
      },
    });
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ message: 'Failed to create post.' });
  }
};

// Get Feed (All or Following) - Strictly Chronological
exports.getFeed = async (req, res) => {
  try {
    const tab = req.query.tab || 'all'; // 'all' or 'following'
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
      .populate('author', 'name username avatarUrl role status')
      .populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    // Batch query likes and bookmarks for current user to avoid N+1 queries
    const postIds = posts.map((p) => p._id);
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ post: { $in: postIds }, user: currentUserId }).select('post'),
      Bookmark.find({ post: { $in: postIds }, user: currentUserId }).select('post'),
    ]);

    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));
    const bookmarkedPostIdSet = new Set(userBookmarks.map((b) => b.post.toString()));

    const enrichedPosts = posts.map((post) => ({
      ...post.toObject(),
      viewsCount: Array.isArray(post.viewedBy) && post.viewedBy.length > 0
        ? post.viewedBy.length
        : Math.max(1, post.viewsCount || 1),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
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
    return res.status(500).json({ message: 'Failed to load feed.' });
  }
};

// Get single post
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatarUrl role status')
      .populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      });

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
    const { content, codeSnippet } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content cannot be empty.' });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({ message: 'Post text cannot exceed 2000 characters.' });
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

    if (codeSnippet !== undefined) {
      post.codeSnippet = sanitizeSnippet(codeSnippet);
    }

    post.isEdited = true;
    await post.save();

    // Extract @mentions from updated post content and notify new mentions
    const mentionMatches = content.trim().match(/@([a-zA-Z0-9_]{3,20})/g);
    if (mentionMatches) {
      const usernames = [...new Set(mentionMatches.map((m) => m.slice(1).toLowerCase()))];
      const mentionedUsers = await User.find({
        username: { $in: usernames },
        _id: { $ne: req.user._id },
        isApproved: true,
      }).select('_id');

      for (const u of mentionedUsers) {
        const alreadyNotified = await Notification.exists({
          recipient: u._id,
          post: post._id,
          type: 'mention',
        });
        if (!alreadyNotified) {
          await Notification.create({
            recipient: u._id,
            sender: req.user._id,
            type: 'mention',
            post: post._id,
          });
        }
      }
    }

    await post.populate('author', 'name username avatarUrl role status');
    if (post.forkedFrom) {
      await post.populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      });
    }

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

// Delete post (Author or Admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isOwner = post.author.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    // Cascade delete comments, likes, notifications, bookmarks
    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
      Notification.deleteMany({ post: post._id }),
      Bookmark.deleteMany({ post: post._id }),
      Post.findByIdAndDelete(post._id),
    ]);

    return res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ message: 'Failed to delete post.' });
  }
};

// Toggle Like
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
      await Like.deleteOne({ _id: existingLike._id });
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      return res.status(200).json({
        message: 'Post unliked.',
        isLiked: false,
        likesCount: post.likesCount,
      });
    } else {
      await Like.create({ post: postId, user: currentUserId });
      post.likesCount += 1;
      await post.save();

      // Only notify if author isn't liking own post
      if (!post.author.equals(currentUserId)) {
        await Notification.create({
          recipient: post.author,
          sender: currentUserId,
          type: 'like',
          post: post._id,
        });
      }

      return res.status(200).json({
        message: 'Post liked.',
        isLiked: true,
        likesCount: post.likesCount,
      });
    }
  } catch (err) {
    console.error('toggleLike error:', err);
    return res.status(500).json({ message: 'Error updating like.' });
  }
};

// Toggle Bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const existing = await Bookmark.findOne({ post: postId, user: currentUserId });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.status(200).json({
        message: 'Post removed from saved.',
        isBookmarked: false,
      });
    } else {
      await Bookmark.create({ post: postId, user: currentUserId });
      return res.status(200).json({
        message: 'Post saved.',
        isBookmarked: true,
      });
    }
  } catch (err) {
    console.error('toggleBookmark error:', err);
    return res.status(500).json({ message: 'Error updating bookmark.' });
  }
};

// Get User's Bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ user: currentUserId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'post',
        populate: [
          { path: 'author', select: 'name username avatarUrl role status' },
          {
            path: 'forkedFrom',
            select: 'content codeSnippet author createdAt',
            populate: { path: 'author', select: 'name username avatarUrl' },
          },
        ],
      });

    const validBookmarks = bookmarks.filter((b) => b.post != null);
    const postIds = validBookmarks.map((b) => b.post._id);

    const userLikes = await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post');
    const likedSet = new Set(userLikes.map((l) => l.post.toString()));

    const posts = validBookmarks.map((b) => ({
      ...b.post.toObject(),
      viewsCount: Array.isArray(b.post.viewedBy) && b.post.viewedBy.length > 0
        ? b.post.viewedBy.length
        : Math.max(1, b.post.viewsCount || 1),
      isLiked: likedSet.has(b.post._id.toString()),
      isBookmarked: true,
      isOwner: b.post.author && b.post.author._id.equals(currentUserId),
    }));

    const totalPosts = await Bookmark.countDocuments({ user: currentUserId });

    return res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        hasMore: skip + bookmarks.length < totalPosts,
      },
    });
  } catch (err) {
    console.error('getBookmarks error:', err);
    return res.status(500).json({ message: 'Failed to retrieve bookmarks.' });
  }
};

// Get posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user._id : null;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'name username avatarUrl role status')
      .populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      })
      .sort({ createdAt: -1 });

    const postIds = posts.map((p) => p._id);
    const [userLikes, userBookmarks] = await Promise.all([
      currentUserId ? Like.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
      currentUserId ? Bookmark.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
    ]);

    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));
    const bookmarkedPostIdSet = new Set(userBookmarks.map((b) => b.post.toString()));

    const enriched = posts.map((post) => ({
      ...post.toObject(),
      viewsCount: Array.isArray(post.viewedBy) && post.viewedBy.length > 0
        ? post.viewedBy.length
        : Math.max(1, post.viewsCount || 1),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
      isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
    }));

    return res.status(200).json({ posts: enriched });
  } catch (err) {
    console.error('getUserPosts error:', err);
    return res.status(500).json({ message: 'Error retrieving user posts.' });
  }
};

// Get Explore/Discover posts (chronological discover feed)
exports.getExplorePosts = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;

    const posts = await Post.find({})
      .populate('author', 'name username avatarUrl role status')
      .populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      })
      .sort({ createdAt: -1 })
      .limit(30);

    const postIds = posts.map((p) => p._id);
    const [userLikes, userBookmarks] = await Promise.all([
      currentUserId ? Like.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
      currentUserId ? Bookmark.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
    ]);

    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));
    const bookmarkedPostIdSet = new Set(userBookmarks.map((b) => b.post.toString()));

    const enriched = posts.map((post) => ({
      ...post.toObject(),
      viewsCount: Array.isArray(post.viewedBy) && post.viewedBy.length > 0
        ? post.viewedBy.length
        : Math.max(1, post.viewsCount || 1),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
      isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
    }));

    return res.status(200).json({ posts: enriched });
  } catch (err) {
    console.error('getExplorePosts error:', err);
    return res.status(500).json({ message: 'Failed to retrieve discover feed.' });
  }
};

// Get all posts that contain code snippets with optional language filter & search
exports.getCodeFeed = async (req, res) => {
  try {
    const { language, q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { 'codeSnippet.code': { $exists: true, $ne: null, $ne: '' } },
        { 'codeSnippet.files.0': { $exists: true } },
      ],
    };

    if (language && language.toLowerCase() !== 'all') {
      const langLower = language.toLowerCase();
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'codeSnippet.language': langLower },
          { 'codeSnippet.files.language': langLower },
        ],
      });
    }

    if (q && q.trim()) {
      const regex = { $regex: q.trim(), $options: 'i' };
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { content: regex },
          { 'codeSnippet.title': regex },
          { 'codeSnippet.code': regex },
          { 'codeSnippet.files.name': regex },
          { 'codeSnippet.files.code': regex },
        ],
      });
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatarUrl role status')
        .populate({
          path: 'forkedFrom',
          select: 'content codeSnippet author createdAt',
          populate: { path: 'author', select: 'name username avatarUrl' },
        }),
      Post.countDocuments(filter),
    ]);

    const currentUserId = req.user ? req.user._id : null;
    const postIds = posts.map((p) => p._id);
    const [userLikes, userBookmarks] = await Promise.all([
      currentUserId ? Like.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
      currentUserId ? Bookmark.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
    ]);

    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));
    const bookmarkedPostIdSet = new Set(userBookmarks.map((b) => b.post.toString()));

    const enriched = posts.map((post) => ({
      ...post.toObject(),
      viewsCount: Array.isArray(post.viewedBy) && post.viewedBy.length > 0
        ? post.viewedBy.length
        : Math.max(1, post.viewsCount || 1),
      isLiked: likedPostIdSet.has(post._id.toString()),
      isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
      isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
    }));

    return res.status(200).json({
      posts: enriched,
      total,
      page,
      hasMore: total > skip + posts.length,
    });
  } catch (err) {
    console.error('getCodeFeed error:', err);
    return res.status(500).json({ message: 'Failed to retrieve code snippets.' });
  }
};

// Weekly Digest Summary (Section 5.9)
exports.getDigest = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [topPosts, codeSnippetsCount, newMembersCount, totalPostsThisWeek] = await Promise.all([
      Post.find({ createdAt: { $gte: oneWeekAgo } })
        .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
        .limit(5)
        .populate('author', 'name username avatarUrl role status'),
      Post.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        'codeSnippet.code': { $exists: true, $ne: null },
      }),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Post.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    ]);

    return res.status(200).json({
      period: 'Past 7 days',
      stats: {
        totalPosts: totalPostsThisWeek,
        codeSnippets: codeSnippetsCount,
        newMembers: newMembersCount,
      },
      topPosts,
    });
  } catch (err) {
    console.error('getDigest error:', err);
    return res.status(500).json({ message: 'Failed to load weekly digest.' });
  }
};

// Record post view impression (strictly unique per user)
exports.recordView = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : null;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!Array.isArray(post.viewedBy)) {
      post.viewedBy = post.author ? [post.author] : [];
    }

    let changed = false;

    // Ensure author is included in viewedBy
    if (post.author && !post.viewedBy.some((id) => id.toString() === post.author.toString())) {
      post.viewedBy.push(post.author);
      changed = true;
    }

    if (userId) {
      const hasViewed = post.viewedBy.some((id) => id.toString() === userId.toString());
      if (!hasViewed) {
        post.viewedBy.push(userId);
        changed = true;
      }
    }

    const uniqueCount = Math.max(1, post.viewedBy.length);
    if (post.viewsCount !== uniqueCount) {
      post.viewsCount = uniqueCount;
      changed = true;
    }

    if (changed) {
      await post.save();
    }

    return res.status(200).json({ viewsCount: post.viewsCount });
  } catch (err) {
    console.error('recordView error:', err);
    return res.status(500).json({ message: 'Error recording view.' });
  }
};

// Flag/report a post for moderation
exports.flagPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    post.isFlagged = true;
    if (reason) {
      post.flagReason = reason.trim().slice(0, 300);
    }
    if (req.user && !post.flaggedBy.includes(req.user._id)) {
      post.flaggedBy.push(req.user._id);
    }
    await post.save();

    return res.status(200).json({
      message: 'Post flagged for moderator review. Thank you for keeping Clearfeed safe.',
      isFlagged: true,
    });
  } catch (err) {
    console.error('flagPost error:', err);
    return res.status(500).json({ message: 'Failed to flag post.' });
  }
};

// Get trending hashtags aggregated from posts
exports.getTrendingHashtags = async (req, res) => {
  try {
    const posts = await Post.find({}, 'content tags createdAt likesCount');
    const tagCounts = {};

    posts.forEach((p) => {
      const postTags = new Set();

      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          if (tag) postTags.add(tag.toLowerCase().trim());
        });
      }
      if (p.content) {
        const matches = p.content.match(/#([a-zA-Z0-9_\u00c0-\u017e]+)/g);
        if (matches) {
          matches.forEach((m) => {
            const clean = m.replace('#', '').toLowerCase().trim();
            if (clean) postTags.add(clean);
          });
        }
      }

      postTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const categoryMap = {
      cs518: 'Coursework · CS-518',
      react: 'Technology · Frontend',
      javascript: 'Programming · Trending',
      webdev: 'Web Development · Trending',
      cleancode: 'Software Architecture · Trending',
      algorithms: 'Computer Science · Trending',
      python: 'Data Science · Trending',
      database: 'Databases · Trending',
      mongodb: 'NoSQL · Trending',
      express: 'Backend · Node.js',
      tailwind: 'Design · CSS',
      css: 'Design · Trending',
      ai: 'Artificial Intelligence · Trending',
    };

    const trends = Object.entries(tagCounts)
      .filter(([tag, count]) => count > 0)
      .map(([tag, count]) => ({
        hashtag: tag,
        postsCount: count,
        category: categoryMap[tag] || `${tag.charAt(0).toUpperCase() + tag.slice(1)} · Trending`,
      }))
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, 6);

    return res.status(200).json({ trends });
  } catch (err) {
    console.error('getTrendingHashtags error:', err);
    return res.status(500).json({ message: 'Failed to retrieve trending topics.' });
  }
};

