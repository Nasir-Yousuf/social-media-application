const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

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

    // Mark unread messages sent to current user as read only if unread messages exist
    const currentUnread = conversation.unreadCounts?.get(currentUserId.toString()) || 0;
    if (currentUnread > 0) {
      if (conversation.unreadCounts) {
        conversation.unreadCounts.set(currentUserId.toString(), 0);
      }
      await Promise.all([
        Message.updateMany(
          {
            conversation: conversationId,
            recipient: currentUserId,
            isRead: false,
          },
          { isRead: true }
        ),
        Notification.updateMany(
          {
            recipient: currentUserId,
            conversation: conversationId,
            type: 'message',
            read: false,
          },
          { read: true }
        ),
        conversation.save(),
      ]);
    }

    // Fetch messages (paginated, chronological order)
    const limit = parseInt(req.query.limit) || 60;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select('sender recipient text codeSnippet typingChallenge isRead reactions createdAt')
      .populate('reactions.user', 'name username avatarUrl')
      .populate('typingChallenge');

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

    // Update conversation metadata
    const messageCreatedAt = new Date();
    conversation.lastMessage = {
      text: trimmedText || (hasValidCode ? 'Shared a code snippet' : 'New message'),
      hasCode: Boolean(hasValidCode),
      sender: currentUserId,
      createdAt: messageCreatedAt,
    };

    const recipientKey = targetRecipientId.toString();
    const currentUnread = conversation.unreadCounts?.get(recipientKey) || 0;
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(recipientKey, currentUnread + 1);
    }

    // Create notification for recipient
    const notification = new Notification({
      recipient: targetRecipientId,
      sender: currentUserId,
      type: 'message',
      conversation: conversation._id,
    });

    // Save message, conversation, and notification concurrently to eliminate latency
    await Promise.all([
      message.save(),
      conversation.save(),
      notification.save(),
    ]);

    return res.status(201).json({
      message: 'Message delivered.',
      data: message,
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
};

// Total unread messages count for navbar badge with latest unread message details
exports.getUnreadTotal = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const count = await Message.countDocuments({
      recipient: currentUserId,
      isRead: false,
    });

    const latestUnread = count > 0
      ? await Message.findOne({
          recipient: currentUserId,
          isRead: false,
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'name username avatarUrl')
      : null;

    return res.status(200).json({
      unreadTotal: count,
      latestUnread: latestUnread
        ? {
            _id: latestUnread._id,
            sender: latestUnread.sender,
            text: latestUnread.text || (latestUnread.codeSnippet?.code ? 'Shared a code snippet' : 'Sent a message'),
            conversation: latestUnread.conversation,
            createdAt: latestUnread.createdAt,
          }
        : null,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error counting unread messages.' });
  }
};

// Delete a specific individual message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    const convId = message.conversation;
    const conversation = await Conversation.findById(convId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Sender or participant of the conversation can delete message to free storage
    const isParticipant = conversation.participants.some((p) => p.equals(currentUserId));
    if (!message.sender.equals(currentUserId) && !isParticipant) {
      return res.status(403).json({ message: 'You are not authorized to delete this message.' });
    }

    await Message.findByIdAndDelete(messageId);

    // If deleted message was the last one, update conversation metadata
    if (conversation) {
      const newestRemaining = await Message.findOne({ conversation: convId }).sort({ createdAt: -1 });
      if (newestRemaining) {
        conversation.lastMessage = {
          text: newestRemaining.text || (newestRemaining.codeSnippet?.code ? 'Shared a code snippet' : ''),
          hasCode: Boolean(newestRemaining.codeSnippet?.code),
          sender: newestRemaining.sender,
          createdAt: newestRemaining.createdAt,
        };
      } else {
        conversation.lastMessage = {
          text: '',
          hasCode: false,
          sender: null,
          createdAt: new Date(),
        };
      }
      await conversation.save();
    }

    return res.status(200).json({
      message: 'Message deleted successfully.',
      messageId,
    });
  } catch (err) {
    console.error('deleteMessage error:', err);
    return res.status(500).json({ message: 'Failed to delete message.' });
  }
};

// Delete the whole conversation and all its messages (frees Atlas storage)
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some((p) => p.equals(currentUserId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation.' });
    }

    // Purge all messages from collection
    await Message.deleteMany({ conversation: conversationId });
    // Purge notifications related to this conversation
    await Notification.deleteMany({ conversation: conversationId });
    // Purge conversation metadata
    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({
      message: 'Conversation and all messages permanently deleted.',
      conversationId,
    });
  } catch (err) {
    console.error('deleteConversation error:', err);
    return res.status(500).json({ message: 'Failed to delete conversation.' });
  }
};

// Clear all messages in a conversation (frees storage, resets conversation)
exports.clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some((p) => p.equals(currentUserId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to clear this conversation.' });
    }

    // Purge all message records to free Atlas storage
    await Message.deleteMany({ conversation: conversationId });

    conversation.lastMessage = {
      text: '',
      hasCode: false,
      sender: null,
      createdAt: new Date(),
    };

    if (conversation.unreadCounts) {
      conversation.participants.forEach((p) => {
        conversation.unreadCounts.set(p.toString(), 0);
      });
    }

    await conversation.save();

    return res.status(200).json({
      message: 'All messages cleared successfully.',
      conversationId,
    });
  } catch (err) {
    console.error('clearConversation error:', err);
    return res.status(500).json({ message: 'Failed to clear messages.' });
  }
};

// Add, change, or remove a reaction on a message (WhatsApp style)
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji, remove } = req.body;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some((p) => p.equals(currentUserId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not authorized to react to this message.' });
    }

    if (!Array.isArray(message.reactions)) {
      message.reactions = [];
    }

    const existingIdx = message.reactions.findIndex((r) => {
      const uId = r.user?._id || r.user;
      return uId && currentUserId.equals(uId);
    });

    let action = 'added';

    if (remove) {
      if (existingIdx !== -1) {
        message.reactions.splice(existingIdx, 1);
        action = 'removed';
      }
    } else {
      if (!emoji || typeof emoji !== 'string' || !emoji.trim()) {
        return res.status(400).json({ message: 'Emoji reaction is required.' });
      }
      const cleanEmoji = emoji.trim().slice(0, 12);

      if (existingIdx !== -1) {
        if (message.reactions[existingIdx].emoji === cleanEmoji) {
          // WhatsApp behavior: clicking current emoji removes it
          message.reactions.splice(existingIdx, 1);
          action = 'removed';
        } else {
          // WhatsApp behavior: clicking different emoji updates it
          message.reactions[existingIdx].emoji = cleanEmoji;
          message.reactions[existingIdx].createdAt = new Date();
          action = 'updated';
        }
      } else {
        message.reactions.push({
          user: currentUserId,
          emoji: cleanEmoji,
          createdAt: new Date(),
        });
        action = 'added';
      }
    }

    await message.save();
    await message.populate('reactions.user', 'name username avatarUrl');

    return res.status(200).json({
      message: `Reaction ${action}.`,
      action,
      reactions: message.reactions,
      messageId: message._id,
    });
  } catch (err) {
    console.error('reactToMessage error:', err);
    return res.status(500).json({ message: 'Failed to update message reaction.' });
  }
};

// Get total unread message count across all conversations and latest unread message
exports.getUnreadTotal = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const [conversations, latestUnread] = await Promise.all([
      Conversation.find({ participants: currentUserId }).select('unreadCounts'),
      Message.findOne({ recipient: currentUserId, isRead: false })
        .sort({ createdAt: -1 })
        .populate('sender', 'name username avatarUrl role status'),
    ]);

    let unreadTotal = 0;
    const userIdStr = currentUserId.toString();
    for (const conv of conversations) {
      if (conv.unreadCounts) {
        unreadTotal += conv.unreadCounts.get(userIdStr) || 0;
      }
    }

    return res.status(200).json({
      unreadTotal,
      latestUnread: latestUnread || null,
    });
  } catch (err) {
    console.error('getUnreadTotal error:', err);
    return res.status(500).json({ message: 'Failed to retrieve unread message count.' });
  }
};


