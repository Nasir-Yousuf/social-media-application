const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getClientIp } = require('../utils/ipUtils');
const { logActivity } = require('../utils/auditLogger');
const { canUserViewPost, canUserReplyToPost } = require('./postController');
const { sendPushToUser } = require('../services/pushNotificationService');

// Get comments for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user ? req.user._id : null;
    const isAdmin = req.user?.role === 'admin';

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const canView = await canUserViewPost(post, currentUserId, isAdmin);
    if (!canView) {
      return res.status(403).json({ message: 'You do not have permission to view comments on this post.' });
    }

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name username avatarUrl role status')
      .sort({ createdAt: 1 });

    // Also fetch any LearningAnswer linked to this question / post ID
    const LearningAnswer = require('../models/LearningAnswer');
    let answers = await LearningAnswer.find({ question: postId })
      .populate('author', 'name username avatarUrl role status')
      .sort({ createdAt: 1 });

    // Check if there is an associated LearningQuestion
    const LearningQuestion = require('../models/LearningQuestion');
    const matchedQ = await LearningQuestion.findOne({
      $or: [
        { feedPost: postId },
        { title: (post.content || '').split('\n')[0].replace(/^❓\s*\*\*Question:\*\*\s*/i, '').trim() }
      ]
    });
    if (matchedQ) {
      const qAnswers = await LearningAnswer.find({ question: matchedQ._id })
        .populate('author', 'name username avatarUrl role status')
        .sort({ createdAt: 1 });
      answers = [...answers, ...qAnswers];
    }

    const mergedList = [...comments];
    answers.forEach((ans) => {
      const exists = mergedList.some((c) => c.content?.trim() === ans.content?.trim());
      if (!exists) {
        mergedList.push({
          _id: ans._id,
          post: postId,
          author: ans.author,
          content: ans.content,
          createdAt: ans.createdAt,
          isAccepted: ans.isAccepted,
        });
      }
    });

    const enriched = mergedList.map((c) => {
      const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
      if (!isAdmin) {
        delete obj.ipAddress;
        delete obj.userAgent;
      }
      return {
        ...obj,
        isOwner: currentUserId ? obj.author && (obj.author._id?.equals?.(currentUserId) || obj.author._id === currentUserId) : false,
      };
    });

    // Auto-sync post commentsCount if mismatched
    if (post.commentsCount !== enriched.length) {
      post.commentsCount = enriched.length;
      post.save().catch(() => {});
    }

    return res.status(200).json({ comments: enriched, commentsCount: enriched.length });
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

    if (content.trim().length > 5000) {
      return res.status(400).json({ message: 'Comment cannot exceed 5000 characters.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isAdmin = req.user?.role === 'admin';
    const canView = await canUserViewPost(post, req.user._id, isAdmin);
    if (!canView) {
      return res.status(403).json({ message: 'You do not have permission to comment on this post.' });
    }

    const canReply = await canUserReplyToPost(post, req.user._id, isAdmin);
    if (!canReply) {
      return res.status(403).json({ message: 'The author has restricted who can reply to this post.' });
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

      sendPushToUser(post.author, {
        title: 'New Reply',
        body: `${req.user.name || 'Someone'} replied: "${content.trim().slice(0, 80)}"`,
        data: { type: 'comment', postId: postId.toString() },
        channelId: 'social',
      }).catch((err) => console.warn('Comment push alert note:', err.message));
    }

    // Extract @mentions from comment and notify mentioned users
    try {
      const { notifyMentions } = require('../utils/mentionUtils');
      await notifyMentions({
        texts: [content.trim()],
        senderId: req.user._id,
        refs: { post: postId, comment: comment._id },
        directType: 'mention',
        broadcastType: 'everyone_mention',
        excludeIds: [post.author],
      });
    } catch (mentionErr) {
      console.warn('createComment mention notify error:', mentionErr.message);
    }

    // Mirror comment to LearningAnswer if this post represents or is linked to a LearningQuestion
    try {
      const LearningQuestion = require('../models/LearningQuestion');
      const LearningAnswer = require('../models/LearningAnswer');
      const cleanTitle = (post.content || '').split('\n')[0].replace(/^❓\s*\*\*Question:\*\*\s*/i, '').trim();
      const matchedQ = await LearningQuestion.findOne({
        $or: [
          { feedPost: postId },
          ...(postId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: postId }] : []),
          ...(cleanTitle ? [{ title: cleanTitle }] : []),
        ],
      });

      if (matchedQ) {
        const existingAns = await LearningAnswer.findOne({
          question: matchedQ._id,
          content: content.trim(),
        });
        if (!existingAns) {
          await LearningAnswer.create({
            question: matchedQ._id,
            author: req.user._id,
            content: content.trim(),
            upvotes: [],
            downvotes: [],
            votesScore: 0,
            isAccepted: false,
          });
          await LearningQuestion.findByIdAndUpdate(matchedQ._id, { $inc: { answersCount: 1 } });
        }
      }
    } catch (mirrorErr) {
      console.warn('Mirror comment to LearningAnswer error:', mirrorErr.message);
    }

    // If comment mentions @ai, asynchronously generate a smart reply comment
    if (content.toLowerCase().match(/(^|[^a-zA-Z0-9_])@ai($|[^a-zA-Z0-9_])/) && req.user.username !== 'ai') {
      (async () => {
        try {
          const aiService = require('../services/aiService');
          const aiUser = await aiService.ensureAiUser();
          if (aiUser) {
            const recentComments = await Comment.find({ post: postId })
              .sort({ createdAt: -1 })
              .limit(4)
              .populate('author', 'name username');

            const aiReplyText = await aiService.generateCommentReply({
              post,
              commentText: content.trim(),
              commenterName: req.user.name || req.user.username,
              parentComments: recentComments.reverse(),
            });

            if (aiReplyText) {
              const aiComment = new Comment({
                post: postId,
                author: aiUser._id,
                content: aiReplyText.trim().slice(0, 5000),
                ipAddress: '127.0.0.1',
                userAgent: 'Clearfeed-AI/1.0',
              });
              await aiComment.save();
              await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

              // Notify the commenter who tagged @ai
              await Notification.create({
                recipient: req.user._id,
                sender: aiUser._id,
                type: 'comment',
                post: postId,
                comment: aiComment._id,
              });
            }
          }
        } catch (aiCommentErr) {
          console.warn('AI comment reply error:', aiCommentErr.message);
        }
      })();
    }

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
