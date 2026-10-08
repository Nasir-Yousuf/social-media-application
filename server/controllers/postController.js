const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const { getClientIp } = require('../utils/ipUtils');
const { logActivity } = require('../utils/auditLogger');
const { extractMentions, notifyMentions } = require('../utils/mentionUtils');

// Build Mongo query filter matching viewer's visibility permissions
const buildVisibilityFilter = async (currentUserId, isAdmin = false) => {
  if (isAdmin) return {};

  if (!currentUserId) {
    return {
      $or: [
        { visibility: 'public' },
        { visibility: { $exists: false } },
        { visibility: null },
        { visibility: 'exclude' },
      ],
    };
  }

  const [followingEdges, followerEdges] = await Promise.all([
    Follow.find({ follower: currentUserId }).select('following'),
    Follow.find({ following: currentUserId }).select('follower'),
  ]);

  const followingIds = followingEdges.map((e) => e.following);
  const followerIds = followerEdges.map((e) => e.follower);
  const followerIdSet = new Set(followerIds.map((id) => id.toString()));
  const mutualIds = followingIds.filter((id) => followerIdSet.has(id.toString()));

  return {
    $or: [
      { author: currentUserId },
      { visibility: 'public' },
      { visibility: { $exists: false } },
      { visibility: null },
      { visibility: 'followers', author: { $in: followingIds } },
      { visibility: 'following', author: { $in: followerIds } },
      { visibility: 'mutuals', author: { $in: mutualIds } },
      { visibility: 'specific', audience: currentUserId },
      { visibility: 'exclude', excludedAudience: { $ne: currentUserId } },
    ],
  };
};

// Check if a specific post document is viewable by current user
const canUserViewPost = async (post, currentUserId, isAdmin = false) => {
  if (isAdmin) return true;
  if (!post) return false;

  const authorId = post.author?._id || post.author;
  if (currentUserId && authorId && authorId.toString() === currentUserId.toString()) return true;

  const vis = post.visibility || 'public';
  if (vis === 'public') return true;
  if (vis === 'private' || vis === 'only_me') return false;

  // Everyone except specific people (blacklist)
  if (vis === 'exclude') {
    if (!currentUserId) return true; // Guest is not in the excluded list
    const excludedList = post.excludedAudience || [];
    const currentStr = currentUserId.toString();
    const isExcluded = excludedList.some(
      (id) => (id?._id ? id._id.toString() : id.toString()) === currentStr
    );
    return !isExcluded;
  }

  if (!currentUserId) return false;

  if (vis === 'followers') {
    // Current user must follow author
    return Boolean(await Follow.exists({ follower: currentUserId, following: authorId }));
  }

  if (vis === 'following') {
    // Post author must follow current user
    return Boolean(await Follow.exists({ follower: authorId, following: currentUserId }));
  }

  if (vis === 'mutuals') {
    const [followsAuthor, authorFollows] = await Promise.all([
      Follow.exists({ follower: currentUserId, following: authorId }),
      Follow.exists({ follower: authorId, following: currentUserId }),
    ]);
    return Boolean(followsAuthor && authorFollows);
  }

  if (vis === 'specific') {
    // Current user must be explicitly whitelisted in audience
    const aud = post.audience || [];
    const currentStr = currentUserId.toString();
    return aud.some((id) => (id?._id ? id._id.toString() : id.toString()) === currentStr);
  }

  return true;
};

// Check if user has permission to comment/reply on post based on replyPolicy
const canUserReplyToPost = async (post, currentUserId, isAdmin = false) => {
  if (isAdmin) return true;
  if (!currentUserId) return false;

  const authorId = post.author?._id || post.author;
  if (authorId && authorId.toString() === currentUserId.toString()) return true;

  const policy = post.replyPolicy || 'everyone';
  if (policy === 'everyone') return true;

  if (policy === 'following') {
    // Only users the post author follows can reply
    return Boolean(await Follow.exists({ follower: authorId, following: currentUserId }));
  }

  if (policy === 'mentioned') {
    const { usernames } = extractMentions(post.content || '');
    const user = await User.findById(currentUserId).select('username');
    return user ? usernames.includes(user.username.toLowerCase()) : false;
  }

  return true;
};

// Helper to ensure post IP and excludedAudience information is protected
const sanitizePostForViewer = (postObj, currentUserId = null, isAdmin = false) => {
  if (!postObj) return postObj;
  if (!isAdmin) {
    delete postObj.ipAddress;
    delete postObj.userAgent;
  }
  const authorId = postObj.author?._id ? postObj.author._id.toString() : postObj.author?.toString();
  const isAuthor = currentUserId && authorId === currentUserId.toString();
  if (!isAuthor && !isAdmin) {
    // Keep excluded list hidden from other viewers to respect privacy
    delete postObj.excludedAudience;
  }
  return postObj;
};

// Helper to compute strictly authentic unique views (author + unique viewers)
// Caps the view count so it can never mathematically exceed the total registered users
const computeUniqueViews = (post, totalUsers = null) => {
  const viewerSet = new Set();

  if (Array.isArray(post.viewedBy)) {
    for (const v of post.viewedBy) {
      if (v) {
        const idStr = v._id ? v._id.toString() : v.toString();
        if (idStr) viewerSet.add(idStr);
      }
    }
  }

  // Author is always counted as a unique viewer of their own post
  if (post.author) {
    const authorIdStr = post.author._id ? post.author._id.toString() : post.author.toString();
    if (authorIdStr) viewerSet.add(authorIdStr);
  }

  const rawCount = Math.max(1, viewerSet.size);
  return typeof totalUsers === 'number' && totalUsers > 0
    ? Math.min(rawCount, totalUsers)
    : rawCount;
};

// Helper to enrich post with currentUser state
const enrichPost = async (post, currentUserId, isAdmin = false) => {
  const [isLiked, isBookmarked, totalUsers, canReply] = await Promise.all([
    currentUserId ? Like.exists({ post: post._id, user: currentUserId }) : false,
    currentUserId ? Bookmark.exists({ post: post._id, user: currentUserId }) : false,
    User.countDocuments(),
    canUserReplyToPost(post, currentUserId, isAdmin),
  ]);
  const isOwner = currentUserId ? post.author && post.author._id.equals(currentUserId) : false;

  const uniqueViews = computeUniqueViews(post, totalUsers);
  const raw = sanitizePostForViewer(post.toObject(), currentUserId, isAdmin);

  return {
    ...raw,
    viewsCount: uniqueViews,
    isLiked: !!isLiked,
    isBookmarked: !!isBookmarked,
    canReply,
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
    const {
      content,
      codeSnippet,
      isAnnouncement,
      isPinned,
      forkedFrom,
      location,
      visibility = 'public',
      audience = [],
      excludedAudience = [],
      replyPolicy = 'everyone',
    } = req.body;

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
    const clientIp = getClientIp(req);
    const userAgent = req.headers ? req.headers['user-agent'] || '' : '';

    const validVis = ['public', 'followers', 'following', 'mutuals', 'specific', 'exclude', 'private', 'only_me'];
    const sanitizedVisibility = validVis.includes(visibility)
      ? (visibility === 'only_me' ? 'private' : visibility)
      : 'public';

    const validPol = ['everyone', 'following', 'mentioned'];
    const sanitizedReplyPolicy = validPol.includes(replyPolicy) ? replyPolicy : 'everyone';

    const sanitizedAudience = Array.isArray(audience)
      ? audience.map((u) => (u && u._id ? u._id : u)).filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    const sanitizedExcludedAudience = Array.isArray(excludedAudience)
      ? excludedAudience.map((u) => (u && u._id ? u._id : u)).filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    const post = new Post({
      author: req.user._id,
      content: trimmedContent,
      codeSnippet: formattedSnippet,
      forkedFrom: forkedFrom || null,
      isAnnouncement: isAdmin ? !!isAnnouncement : false,
      isPinned: isAdmin ? !!isPinned : false,
      visibility: sanitizedVisibility,
      audience: sanitizedAudience,
      excludedAudience: sanitizedExcludedAudience,
      replyPolicy: sanitizedReplyPolicy,
      location: location ? location.trim().slice(0, 100) : '',
      tags: extractedTags,
      viewedBy: [req.user._id],
      viewsCount: 1, // Author is the first unique viewer
      ipAddress: clientIp,
      userAgent: userAgent.slice(0, 250),
    });

    await post.save();

    // Update user's lastActiveIp
    User.findByIdAndUpdate(req.user._id, { $set: { lastActiveIp: clientIp } }).catch(() => {});

    // Record audit event
    await logActivity(req, 'create_post', {
      postId: post._id,
      contentPreview: trimmedContent.slice(0, 120),
      isGuest: req.user.username === 'guest',
      hasCode: Boolean(formattedSnippet),
      visibility: post.visibility,
    });

    if (forkedFrom) {
      await Post.findByIdAndUpdate(forkedFrom, { $inc: { forksCount: 1 } });
    }

    await post.populate('author', 'name username avatarUrl role status');
    await post.populate('audience', 'name username avatarUrl role');
    await post.populate('excludedAudience', 'name username avatarUrl role');
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

    // Extract @mentions (incl. @everyone / @followers) and notify - one notification per person.
    // Announcements already notified every member above, so skip to avoid duplicate alerts.
    if (!post.isAnnouncement) {
      try {
        await notifyMentions({
          texts: [trimmedContent],
          senderId: req.user._id,
          refs: { post: post._id },
          directType: 'mention',
          broadcastType: 'everyone_mention',
          filterRecipients: async (candidateIds) => {
            if (post.visibility === 'public') return candidateIds;
            const allowed = [];
            for (const cid of candidateIds) {
              if (await canUserViewPost(post, cid, false)) {
                allowed.push(cid);
              }
            }
            return allowed;
          },
        });
      } catch (mentionErr) {
        console.warn('createPost mention notify failed:', mentionErr.message);
      }

      // Notify community members about new post (only those allowed to see it)
      if (post.visibility !== 'private' && post.visibility !== 'only_me') {
        try {
          const otherMembers = await User.find({ _id: { $ne: req.user._id } }).select('_id');
          const eligibleMembers = [];
          for (const m of otherMembers) {
            if (await canUserViewPost(post, m._id, false)) {
              eligibleMembers.push(m);
            }
          }
          if (eligibleMembers.length > 0) {
            const postNotifs = eligibleMembers.map((m) => ({
              recipient: m._id,
              sender: req.user._id,
              type: 'new_post',
              post: post._id,
            }));
            await Notification.insertMany(postNotifs, { ordered: false });
          }
        } catch (postNotifErr) {
          console.warn('createPost general notify failed:', postNotifErr.message);
        }
      }
    }

    return res.status(201).json({
      message: 'Post published to Clearfeed.',
      post: sanitizePostForViewer(
        {
          ...post.toObject(),
          isLiked: false,
          isBookmarked: false,
          canReply: true,
          isOwner: true,
        },
        req.user._id,
        isAdmin
      ),
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
    const isAdmin = req.user?.role === 'admin';
    const visFilter = await buildVisibilityFilter(currentUserId, isAdmin);

    let baseQuery = {};
    if (tab === 'following') {
      const followingEdges = await Follow.find({ follower: currentUserId }).select('following');
      const followingIds = followingEdges.map((e) => e.following);
      followingIds.push(currentUserId); // include own posts in following feed
      baseQuery = { author: { $in: followingIds } };
    }

    const query = Object.keys(visFilter).length > 0 ? { $and: [baseQuery, visFilter] } : baseQuery;

    const posts = await Post.find(query)
      .populate('author', 'name username avatarUrl role status')
      .populate('audience', 'name username avatarUrl role')
      .populate('excludedAudience', 'name username avatarUrl role')
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

    const totalUsers = await User.countDocuments();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const uniqueViews = computeUniqueViews(post, totalUsers);
        const canReply = await canUserReplyToPost(post, currentUserId, isAdmin);
        // Auto-heal inflated counts in background if mismatched
        if (post.viewsCount !== uniqueViews) {
          Post.updateOne({ _id: post._id }, { $set: { viewsCount: uniqueViews } }).catch(() => {});
        }
        return sanitizePostForViewer(
          {
            ...post.toObject(),
            viewsCount: uniqueViews,
            isLiked: likedPostIdSet.has(post._id.toString()),
            isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
            canReply,
            isOwner: post.author && post.author._id.equals(currentUserId),
          },
          currentUserId,
          isAdmin
        );
      })
    );

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatarUrl role status')
      .populate('audience', 'name username avatarUrl role')
      .populate('excludedAudience', 'name username avatarUrl role')
      .populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isAdmin = req.user?.role === 'admin';
    const currentUserId = req.user ? req.user._id : null;
    const canView = await canUserViewPost(post, currentUserId, isAdmin);
    if (!canView) {
      return res.status(403).json({ message: 'This post is private or restricted to a specific audience.' });
    }

    const enriched = await enrichPost(post, currentUserId, isAdmin);
    return res.status(200).json({ post: enriched });
  } catch (err) {
    console.error('getPostById error:', err);
    return res.status(500).json({ message: 'Error retrieving post.' });
  }
};

// Update own post
exports.updatePost = async (req, res) => {
  try {
    const { content, codeSnippet, visibility, audience, excludedAudience, replyPolicy } = req.body;
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

    if (visibility !== undefined) {
      const validVis = ['public', 'followers', 'following', 'mutuals', 'specific', 'exclude', 'private', 'only_me'];
      if (validVis.includes(visibility)) {
        post.visibility = visibility === 'only_me' ? 'private' : visibility;
      }
    }

    if (audience !== undefined && Array.isArray(audience)) {
      post.audience = audience.map((u) => (u && u._id ? u._id : u)).filter((id) => mongoose.Types.ObjectId.isValid(id));
    }

    if (excludedAudience !== undefined && Array.isArray(excludedAudience)) {
      post.excludedAudience = excludedAudience.map((u) => (u && u._id ? u._id : u)).filter((id) => mongoose.Types.ObjectId.isValid(id));
    }

    if (replyPolicy !== undefined) {
      const validPol = ['everyone', 'following', 'mentioned'];
      if (validPol.includes(replyPolicy)) {
        post.replyPolicy = replyPolicy;
      }
    }

    post.isEdited = true;
    await post.save();

    // Notify only NEW mentions introduced by this edit (never re-notify anyone)
    try {
      const previous = await Notification.find({
        post: post._id,
        comment: { $exists: false },
        type: { $in: ['mention', 'everyone_mention', 'announcement'] },
      }).select('recipient');
      await notifyMentions({
        texts: [content.trim()],
        senderId: req.user._id,
        refs: { post: post._id },
        alreadyNotified: new Set(previous.map((n) => n.recipient.toString())),
      });
    } catch (mentionErr) {
      console.warn('updatePost mention notify failed:', mentionErr.message);
    }

    await post.populate('author', 'name username avatarUrl role status');
    await post.populate('audience', 'name username avatarUrl role');
    await post.populate('excludedAudience', 'name username avatarUrl role');
    if (post.forkedFrom) {
      await post.populate({
        path: 'forkedFrom',
        select: 'content codeSnippet author createdAt',
        populate: { path: 'author', select: 'name username avatarUrl' },
      });
    }

    const enriched = await enrichPost(post, req.user._id, req.user.role === 'admin');

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

    await logActivity(req, 'delete_post', {
      postId: post._id,
      deletedByAdmin: isAdmin && !isOwner,
    });

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
    const isAdmin = req.user.role === 'admin';
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
          { path: 'audience', select: 'name username avatarUrl role' },
          { path: 'excludedAudience', select: 'name username avatarUrl role' },
          {
            path: 'forkedFrom',
            select: 'content codeSnippet author createdAt',
            populate: { path: 'author', select: 'name username avatarUrl' },
          },
        ],
      });

    const viewableBookmarks = [];
    for (const b of bookmarks) {
      if (b.post && (await canUserViewPost(b.post, currentUserId, isAdmin))) {
        viewableBookmarks.push(b);
      }
    }

    const postIds = viewableBookmarks.map((b) => b.post._id);

    const userLikes = await Like.find({ post: { $in: postIds }, user: currentUserId }).select('post');
    const likedSet = new Set(userLikes.map((l) => l.post.toString()));

    const totalUsers = await User.countDocuments();
    const posts = await Promise.all(
      viewableBookmarks.map(async (b) => {
        const canReply = await canUserReplyToPost(b.post, currentUserId, isAdmin);
        return sanitizePostForViewer(
          {
            ...b.post.toObject(),
            viewsCount: computeUniqueViews(b.post, totalUsers),
            isLiked: likedSet.has(b.post._id.toString()),
            isBookmarked: true,
            canReply,
            isOwner: b.post.author && b.post.author._id.equals(currentUserId),
          },
          currentUserId,
          isAdmin
        );
      })
    );

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
    const isAdmin = req.user?.role === 'admin';

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const visFilter = await buildVisibilityFilter(currentUserId, isAdmin);
    const authorFilter = { author: user._id };
    const query = Object.keys(visFilter).length > 0 ? { $and: [authorFilter, visFilter] } : authorFilter;

    const posts = await Post.find(query)
      .populate('author', 'name username avatarUrl role status')
      .populate('audience', 'name username avatarUrl role')
      .populate('excludedAudience', 'name username avatarUrl role')
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

    const totalUsers = await User.countDocuments();
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const canReply = await canUserReplyToPost(post, currentUserId, isAdmin);
        return sanitizePostForViewer(
          {
            ...post.toObject(),
            viewsCount: computeUniqueViews(post, totalUsers),
            isLiked: likedPostIdSet.has(post._id.toString()),
            isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
            canReply,
            isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
          },
          currentUserId,
          isAdmin
        );
      })
    );

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
    const isAdmin = req.user?.role === 'admin';
    const visFilter = await buildVisibilityFilter(currentUserId, isAdmin);

    const posts = await Post.find(visFilter)
      .populate('author', 'name username avatarUrl role status')
      .populate('audience', 'name username avatarUrl role')
      .populate('excludedAudience', 'name username avatarUrl role')
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

    const totalUsers = await User.countDocuments();
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const canReply = await canUserReplyToPost(post, currentUserId, isAdmin);
        return sanitizePostForViewer(
          {
            ...post.toObject(),
            viewsCount: computeUniqueViews(post, totalUsers),
            isLiked: likedPostIdSet.has(post._id.toString()),
            isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
            canReply,
            isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
          },
          currentUserId,
          isAdmin
        );
      })
    );

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

    const currentUserId = req.user ? req.user._id : null;
    const isAdmin = req.user?.role === 'admin';
    const visFilter = await buildVisibilityFilter(currentUserId, isAdmin);

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

    const finalQuery = Object.keys(visFilter).length > 0 ? { $and: [filter, visFilter] } : filter;

    const [posts, total] = await Promise.all([
      Post.find(finalQuery)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatarUrl role status')
        .populate('audience', 'name username avatarUrl role')
        .populate('excludedAudience', 'name username avatarUrl role')
        .populate({
          path: 'forkedFrom',
          select: 'content codeSnippet author createdAt',
          populate: { path: 'author', select: 'name username avatarUrl' },
        }),
      Post.countDocuments(finalQuery),
    ]);

    const postIds = posts.map((p) => p._id);
    const [userLikes, userBookmarks] = await Promise.all([
      currentUserId ? Like.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
      currentUserId ? Bookmark.find({ post: { $in: postIds }, user: currentUserId }).select('post') : [],
    ]);

    const likedPostIdSet = new Set(userLikes.map((l) => l.post.toString()));
    const bookmarkedPostIdSet = new Set(userBookmarks.map((b) => b.post.toString()));

    const totalUsers = await User.countDocuments();
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const canReply = await canUserReplyToPost(post, currentUserId, isAdmin);
        return sanitizePostForViewer(
          {
            ...post.toObject(),
            viewsCount: computeUniqueViews(post, totalUsers),
            isLiked: likedPostIdSet.has(post._id.toString()),
            isBookmarked: bookmarkedPostIdSet.has(post._id.toString()),
            canReply,
            isOwner: currentUserId ? post.author._id.equals(currentUserId) : false,
          },
          currentUserId,
          isAdmin
        );
      })
    );

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

    const [post, totalUsers] = await Promise.all([
      Post.findById(postId),
      User.countDocuments(),
    ]);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!Array.isArray(post.viewedBy)) {
      post.viewedBy = [];
    }

    let changed = false;

    // Ensure author is included in viewedBy
    if (post.author) {
      const authorStr = post.author.toString();
      if (!post.viewedBy.some((id) => id.toString() === authorStr)) {
        post.viewedBy.push(post.author);
        changed = true;
      }
    }

    // Add viewing user if authenticated
    if (userId) {
      const userStr = userId.toString();
      if (!post.viewedBy.some((id) => id.toString() === userStr)) {
        post.viewedBy.push(userId);
        changed = true;
      }
    }

    // Deduplicate viewedBy array
    const uniqueIds = Array.from(new Set(post.viewedBy.map((id) => id.toString())));
    if (uniqueIds.length !== post.viewedBy.length) {
      post.viewedBy = uniqueIds;
      changed = true;
    }

    const correctCount = Math.min(
      Math.max(1, post.viewedBy.length),
      totalUsers > 0 ? totalUsers : 1
    );

    if (post.viewsCount !== correctCount) {
      post.viewsCount = correctCount;
      changed = true;
    }

    if (changed) {
      await post.save();
    }

    return res.status(200).json({ viewsCount: post.viewsCount, viewedByCount: post.viewedBy.length });
  } catch (err) {
    console.error('recordView error:', err);
    return res.status(500).json({ message: 'Error recording view.' });
  }
};

// Sync and sanitize unique views across all posts
exports.syncViews = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const posts = await Post.find().select('_id author viewedBy viewsCount');
    let updatedCount = 0;

    for (const p of posts) {
      const viewerSet = new Set();
      if (Array.isArray(p.viewedBy)) {
        for (const v of p.viewedBy) {
          if (v) viewerSet.add(v.toString());
        }
      }
      if (p.author) {
        viewerSet.add(p.author.toString());
      }
      const uniqueArray = Array.from(viewerSet);
      const correctViews = Math.min(
        Math.max(1, uniqueArray.length),
        totalUsers > 0 ? totalUsers : 1
      );

      if (p.viewsCount !== correctViews || (p.viewedBy || []).length !== uniqueArray.length) {
        p.viewedBy = uniqueArray;
        p.viewsCount = correctViews;
        await p.save();
        updatedCount++;
      }
    }

    return res.status(200).json({
      message: `Views sanitized successfully. ${updatedCount} posts synchronized.`,
      updatedCount,
      totalUsers,
    });
  } catch (err) {
    console.error('syncViews error:', err);
    return res.status(500).json({ message: 'Failed to sync views.' });
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

exports.canUserViewPost = canUserViewPost;
exports.canUserReplyToPost = canUserReplyToPost;
exports.buildVisibilityFilter = buildVisibilityFilter;
exports.sanitizePostForViewer = sanitizePostForViewer;

