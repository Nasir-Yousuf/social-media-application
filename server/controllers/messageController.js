const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPushToUser } = require('../services/pushNotificationService');
const { broadcastChatMessage, broadcastTypingStatus } = require('../sockets/socketManager');
const aiService = require('../services/aiService');

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
      const isAi = otherUser?.username === 'ai' || otherUser?.role === 'ai' || otherUser?.isAi;
      const customAiName = isAi && conv.customAiSettings?.customName ? conv.customAiSettings.customName : null;

      return {
        _id: conv._id,
        otherUser: otherUser
          ? {
              _id: otherUser._id,
              name: customAiName || otherUser.name,
              originalName: otherUser.name,
              username: otherUser.username,
              avatarUrl: otherUser.avatarUrl,
              role: otherUser.role,
              status: otherUser.status,
              isAi: Boolean(isAi),
            }
          : null,
        lastMessage: conv.lastMessage,
        unreadCount,
        customAiSettings: conv.customAiSettings || null,
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

    const isAi = otherUser?.username === 'ai' || otherUser?.role === 'ai' || otherUser?.isAi;
    const customAiName = isAi && conversation.customAiSettings?.customName ? conversation.customAiSettings.customName : null;

    return res.status(200).json({
      conversation: {
        _id: conversation._id,
        otherUser: otherUser
          ? {
              ...otherUser.toObject(),
              name: customAiName || otherUser.name,
              originalName: otherUser.name,
              isAi: Boolean(isAi),
            }
          : null,
        customAiSettings: conversation.customAiSettings || null,
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
    if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
      targetUser = await User.findById(recipientId).select('name username avatarUrl role status isAi');
    }
    if (!targetUser && recipientUsername) {
      targetUser = await User.findOne({ username: recipientUsername.toLowerCase() }).select('name username avatarUrl role status isAi');
    }
    if (!targetUser && recipientId && typeof recipientId === 'string') {
      targetUser = await User.findOne({ username: recipientId.toLowerCase() }).select('name username avatarUrl role status isAi');
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
    }).populate('participants', 'name username avatarUrl role status isAi');

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
      await conversation.populate('participants', 'name username avatarUrl role status isAi');
    }

    const isAi = targetUser?.username === 'ai' || targetUser?.role === 'ai' || targetUser?.isAi;
    const customAiName = isAi && conversation.customAiSettings?.customName ? conversation.customAiSettings.customName : null;

    return res.status(200).json({
      conversation: {
        _id: conversation._id,
        otherUser: {
          ...targetUser.toObject(),
          name: customAiName || targetUser.name,
          originalName: targetUser.name,
          isAi: Boolean(isAi),
        },
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCounts?.get(currentUserId.toString()) || 0,
        customAiSettings: conversation.customAiSettings || null,
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
    const { conversationId, recipientId, text, content, message: bodyMessage, codeSnippet } = req.body;
    const currentUserId = req.user._id;

    const rawText = text || content || bodyMessage || '';
    const trimmedText = typeof rawText === 'string' ? rawText.trim().slice(0, 1000) : '';
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
    }
    
    if (!conversation && recipientId) {
      let targetId = recipientId;
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        const u = await User.findOne({ username: String(recipientId).toLowerCase() });
        if (u) targetId = u._id;
      }

      if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
        conversation = await Conversation.findOne({
          participants: { $all: [currentUserId, targetId], $size: 2 },
        });
        if (!conversation) {
          conversation = new Conversation({
            participants: [currentUserId, targetId],
            unreadCounts: new Map([
              [currentUserId.toString(), 0],
              [targetId.toString(), 0],
            ]),
          });
          await conversation.save();
        }
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

    // Broadcast message via Socket.IO in real-time
    try {
      broadcastChatMessage(conversation._id, message, targetRecipientId, currentUserId);
    } catch (socketErr) {
      console.warn('Real-time socket broadcast notice:', socketErr.message);
    }

    // Dispatch background push alert to recipient
    sendPushToUser(targetRecipientId, {
      title: req.user.name || 'New Message',
      body: trimmedText || (hasValidCode ? 'Shared a code snippet' : 'Sent you a message'),
      data: {
        type: 'message',
        conversationId: conversation._id.toString(),
        senderId: currentUserId.toString(),
        senderName: req.user.name || req.user.username,
      },
      sound: 'default',
      badge: (currentUnread || 0) + 1,
      channelId: 'messages',
    }).catch((err) => console.warn('Background push error:', err.message));

    // Asynchronously dispatch AI response if recipient is Clearfeed AI (@ai)
    (async () => {
      try {
        const recipientDoc = await User.findById(targetRecipientId).select('name username role isAi');
        if (recipientDoc && (recipientDoc.username === 'ai' || recipientDoc.role === 'ai' || recipientDoc.isAi)) {
          // 1. Emit typing indicator to conversation room & recipient
          broadcastTypingStatus(conversation._id, targetRecipientId, true, currentUserId);

          // 2. Fetch past context (up to 10 recent messages)
          const history = await Message.find({ conversation: conversation._id })
            .sort({ createdAt: 1 })
            .limit(10)
            .populate('sender', 'name username role isAi');

          // 3. Generate response using aiService
          const aiReplyText = await aiService.generateDirectChatReply({
            user: req.user,
            conversation,
            recentMessages: history,
            userMessage: trimmedText,
          });

          // 4. Create and save AI message
          const aiMessage = new Message({
            conversation: conversation._id,
            sender: targetRecipientId,
            recipient: currentUserId,
            text: aiReplyText,
            isRead: false,
          });
          await aiMessage.save();

          // 5. Update conversation metadata
          const aiCreatedAt = new Date();
          conversation.lastMessage = {
            text: aiReplyText.slice(0, 1000),
            hasCode: false,
            sender: targetRecipientId,
            createdAt: aiCreatedAt,
          };
          const userKey = currentUserId.toString();
          const unread = conversation.unreadCounts?.get(userKey) || 0;
          if (conversation.unreadCounts) {
            conversation.unreadCounts.set(userKey, unread + 1);
          }
          await conversation.save();

          // 6. Turn off typing indicator & broadcast message
          broadcastTypingStatus(conversation._id, targetRecipientId, false, currentUserId);
          broadcastChatMessage(conversation._id, aiMessage, currentUserId, targetRecipientId);
        }
      } catch (aiErr) {
        console.error('Async AI chat reply error:', aiErr);
        broadcastTypingStatus(conversation._id, targetRecipientId, false, currentUserId);
      }
    })();

    return res.status(201).json({
      message: message,
      data: message,
      success: true,
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

// Update custom AI settings for a 1-on-1 conversation (name, persona/relationship, language preference)
exports.updateAiSettings = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { customName, relationship, languagePref } = req.body;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some((p) => p.equals(currentUserId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to modify this conversation.' });
    }

    if (!conversation.customAiSettings) {
      conversation.customAiSettings = {};
    }

    if (customName !== undefined) {
      conversation.customAiSettings.customName = (customName || '').trim().slice(0, 50) || 'Clearfeed AI';
    }
    if (relationship !== undefined) {
      conversation.customAiSettings.relationship = (relationship || '').trim().slice(0, 50) || 'best friend';
    }
    if (languagePref !== undefined && ['auto', 'bangla', 'english', 'both'].includes(languagePref)) {
      conversation.customAiSettings.languagePref = languagePref;
    }

    await conversation.save();

    return res.status(200).json({
      success: true,
      message: 'AI settings updated successfully.',
      customAiSettings: conversation.customAiSettings,
    });
  } catch (err) {
    console.error('updateAiSettings error:', err);
    return res.status(500).json({ message: 'Failed to update AI settings.' });
  }
};


