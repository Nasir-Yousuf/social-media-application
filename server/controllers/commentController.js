const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getClientIp } = require('../utils/ipUtils');
const { logActivity } = require('../utils/auditLogger');

// Get comments for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user ? req.user._id : null;
    const isAdmin = req.user?.role === 'admin';

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name username avatarUrl role')
      .sort({ createdAt: 1 });

    const enriched = comments.map((c) => {
      const obj = c.toObject();
      if (!isAdmin) {
        delete obj.ipAddress;
        delete obj.userAgent;
      }
      return {
        ...obj,
        isOwner: currentUserId ? c.author && c.author._id.equals(currentUserId) : false,
      };
    });

    return res.status(200).json({ comments: enriched });
  } catch (err) {
    console.error('getCommentsByPost error:', err);
    return res.status(500).json({ message: 'Error retrieving comments.' });
  }
};

// Add comment to a post
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({ message: 'Comment cannot exceed 500 characters.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const clientIp = getClientIp(req);
    const userAgent = req.headers ? req.headers['user-agent'] || '' : '';

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      ipAddress: clientIp,
      userAgent: userAgent.slice(0, 250),
    });

    await comment.save();
    await comment.populate('author', 'name username avatarUrl role');

    // Update commenter's lastActiveIp
    User.findByIdAndUpdate(req.user._id, { $set: { lastActiveIp: clientIp } }).catch(() => {});

    // Log comment creation in AuditLog
    await logActivity(req, 'create_comment', {
      postId,
      commentId: comment._id,
      contentPreview: content.trim().slice(0, 100),
      isGuest: req.user.username === 'guest',
    });

    // Increment post comment counter
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    // Notify author if not self-commenting
    if (!post.author.equals(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: postId,
        comment: comment._id,
      });
    }

    // Extract @mentions from comment and notify mentioned users
    const mentionMatches = content.trim().match(/@([a-zA-Z0-9_]{3,20})/g);
    if (mentionMatches) {
      const usernames = [...new Set(mentionMatches.map((m) => m.slice(1).toLowerCase()))];
      const mentionedUsers = await User.find({
        username: { $in: usernames },
        _id: { $ne: req.user._id },
        isApproved: true,
      }).select('_id');

      if (mentionedUsers.length > 0) {
        const mentionNotifs = mentionedUsers
          .filter((u) => !post.author.equals(u._id))
          .map((u) => ({
            recipient: u._id,
            sender: req.user._id,
            type: 'mention',
            post: postId,
            comment: comment._id,
          }));
        if (mentionNotifs.length > 0) {
          await Notification.insertMany(mentionNotifs);
        }
      }
    }

    const isAdmin = req.user.role === 'admin';
    const commentObj = comment.toObject();
    if (!isAdmin) {
      delete commentObj.ipAddress;
      delete commentObj.userAgent;
    }

    return res.status(201).json({
      message: 'Comment added.',
      comment: {
        ...commentObj,
        isOwner: true,
      },
      commentsCount: updatedPost.commentsCount,
    });
  } catch (err) {
    console.error('createComment error:', err);
    return res.status(500).json({ message: 'Failed to post comment.' });
  }
};

// Delete comment (Author or Admin)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const isOwner = comment.author.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
    }

    await logActivity(req, 'delete_comment', {
      commentId: id,
      postId: comment.post,
      deletedByAdmin: isAdmin && !isOwner,
    });

    const postId = comment.post;
    await Comment.findByIdAndDelete(id);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: -1 } },
      { new: true }
    );

    // Remove notification
    await Notification.findOneAndDelete({ comment: id });

    return res.status(200).json({
      message: 'Comment deleted.',
      commentsCount: updatedPost ? Math.max(0, updatedPost.commentsCount) : 0,
    });
  } catch (err) {
    console.error('deleteComment error:', err);
    return res.status(500).json({ message: 'Failed to delete comment.' });
  }
};
