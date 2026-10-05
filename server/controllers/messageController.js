const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name username avatarUrl role status')
      .populate('lastMessage.sender', 'name username');

    const formatted = conversations.map((conv) => {
      // Find the other participant
      const otherUser = conv.participants.find(
        (p) => !p._id.equals(currentUserId)
      ) || conv.participants[0];

      const unreadCount = conv.unreadCounts?.get(currentUserId.toString()) || 0;

      return {
        _id: conv._id,
        otherUser: otherUser
          ? {
              _id: otherUser._id,
              name: otherUser.name,
              username: otherUser.username,
              avatarUrl: otherUser.avatarUrl,
              role: otherUser.role,
              status: otherUser.status,
            }
          : null,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (err) {
    console.error('getConversations error:', err);
    return res.status(500).json({ message: 'Failed to retrieve conversations.' });
  }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId).populate(
      'participants',
      'name username avatarUrl role status'
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some((p) =>
      p._id.equals(currentUserId)
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view these messages.' });
    }

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: currentUserId,
        isRead: false,
      },
      { isRead: true }
    );

    // Reset unread count for current user in conversation
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    // Fetch messages (paginated, chronological order)
    const limit = parseInt(req.query.limit) || 60;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select('sender recipient text codeSnippet isRead createdAt');

    const otherUser = conversation.participants.find(
      (p) => !p._id.equals(currentUserId)
    ) || conversation.participants[0];

    return res.status(200).json({
      conversation: {
        _id: conversation._id,
        otherUser,
      },
      messages,
    });
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ message: 'Failed to retrieve messages.' });
  }
};

// Start or get existing conversation with a user
exports.startConversation = async (req, res) => {
  try {
    const { recipientId, recipientUsername } = req.body;
    const currentUserId = req.user._id;

    let targetUser = null;
    if (recipientId) {
      targetUser = await User.findById(recipientId).select('name username avatarUrl role status');
    } else if (recipientUsername) {
      targetUser = await User.findOne({ username: recipientUsername.toLowerCase() }).select('name username avatarUrl role status');
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Recipient member not found.' });
    }

    if (targetUser._id.equals(currentUserId)) {
      return res.status(400).json({ message: 'Cannot start a direct message with yourself.' });
    }

    // Look for existing conversation between these 2 users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUser._id], $size: 2 },
    }).populate('participants', 'name username avatarUrl role status');

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, targetUser._id],
        lastMessage: {
          text: '',
          sender: currentUserId,
          createdAt: new Date(),
        },
        unreadCounts: new Map([
          [currentUserId.toString(), 0],
          [targetUser._id.toString(), 0],
        ]),
      });
      await conversation.save();
      await conversation.populate('participants', 'name username avatarUrl role status');
    }

    return res.status(200).json({
      conversation: {
        _id: conversation._id,
        otherUser: targetUser,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCounts?.get(currentUserId.toString()) || 0,
      },
    });
  } catch (err) {
    console.error('startConversation error:', err);
    return res.status(500).json({ message: 'Failed to initiate conversation.' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, text, codeSnippet } = req.body;
    const currentUserId = req.user._id;

    const trimmedText = text ? text.trim().slice(0, 1000) : '';
    const hasValidCode =
      codeSnippet &&
      codeSnippet.code &&
      codeSnippet.code.trim().length > 0;

    if (!trimmedText && !hasValidCode) {
      return res.status(400).json({ message: 'Message content or code snippet is required.' });
    }

    let conversation = null;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else if (recipientId) {
      conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, recipientId], $size: 2 },
      });
      if (!conversation) {
        conversation = new Conversation({
          participants: [currentUserId, recipientId],
          unreadCounts: new Map([
            [currentUserId.toString(), 0],
            [recipientId.toString(), 0],
          ]),
        });
        await conversation.save();
      }
    }

    if (!conversation) {
      return res.status(404).json({ message: 'Target conversation not found.' });
    }

    // Determine target recipient
    const targetRecipientId = conversation.participants.find(
      (p) => !p.equals(currentUserId)
    );

    if (!targetRecipientId) {
      return res.status(400).json({ message: 'Invalid conversation participants.' });
    }

    // Create lean message document
    const message = new Message({
      conversation: conversation._id,
      sender: currentUserId,
      recipient: targetRecipientId,
      text: trimmedText,
      codeSnippet: hasValidCode
        ? {
            language: (codeSnippet.language || 'javascript').slice(0, 30).toLowerCase(),
            code: codeSnippet.code.slice(0, 4000),
          }
        : undefined,
      isRead: false,
    });

    await message.save();

    // Update conversation metadata
    conversation.lastMessage = {
      text: trimmedText || (hasValidCode ? 'Shared a code snippet' : 'New message'),
      hasCode: Boolean(hasValidCode),
      sender: currentUserId,
      createdAt: message.createdAt,
    };

    const recipientKey = targetRecipientId.toString();
    const currentUnread = conversation.unreadCounts?.get(recipientKey) || 0;
    conversation.unreadCounts.set(recipientKey, currentUnread + 1);

    await conversation.save();

    return res.status(201).json({
      message: 'Message delivered.',
      data: message,
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
};

// Total unread messages count for navbar badge
exports.getUnreadTotal = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const count = await Message.countDocuments({
      recipient: currentUserId,
      isRead: false,
    });
    return res.status(200).json({ unreadTotal: count });
  } catch (err) {
    return res.status(500).json({ message: 'Error counting unread messages.' });
  }
};
