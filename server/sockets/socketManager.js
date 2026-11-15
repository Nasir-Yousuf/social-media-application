const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const callSessionManager = require('../services/callSessionManager');
const { spaceSessionManager, SpaceRole } = require('../services/spaceSessionManager');
const { isCoAdmin } = require('../controllers/authController');

let ioInstance = null;

// Track online users: userId -> { user: Object, socketIds: Set<string> }
const onlineUsers = new Map();


// Track group call rooms: roomId -> Map<userId, { user: Object, isMuted: boolean, joinedAt: Date }>
const groupCallRooms = new Map();

const { isOriginAllowed } = require('../config/security');

const getUnreadForUser = (unreadCounts, userId) => {
  if (!unreadCounts || !userId) return 0;
  const uid = userId.toString();
  if (typeof unreadCounts.get === 'function') {
    return unreadCounts.get(uid) || 0;
  }
  return unreadCounts[uid] || 0;
};

const setUnreadForUser = (conv, userId, val) => {
  if (!conv || !userId) return;
  const uid = userId.toString();
  if (!conv.unreadCounts) {
    conv.unreadCounts = new Map([[uid, val]]);
    return;
  }
  if (typeof conv.unreadCounts.set === 'function') {
    conv.unreadCounts.set(uid, val);
  } else {
    conv.unreadCounts[uid] = val;
    if (typeof conv.markModified === 'function') {
      conv.markModified('unreadCounts');
    }
  }
};

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Socket.IO CORS blocked: Origin not authorized.'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  ioInstance = io;
  callSessionManager.setIO(io);

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const token =
        socket.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

      if (token) {
        const secret = process.env.JWT_SECRET || 'pulse518_super_secret_course_key_2026';
        const decoded = jwt.verify(token, secret);
        const userId = decoded.userId || decoded.id || decoded._id;

        if (userId) {
          try {
            const user = await User.findById(userId).select('name username email avatarUrl role status tokenVersion isApproved');
            if (user && user.isApproved) {
              const currentVersion = user.tokenVersion || 0;
              const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : null;
              if (tokenVersion === null ? currentVersion === 0 : tokenVersion === currentVersion) {
                socket.userId = user._id.toString();
                socket.user = user;
                socket.data = socket.data || {};
                socket.data.userId = socket.userId;
                socket.data.user = user;
              }
            }
          } catch {}
        }
      }
      next();
    } catch (err) {
      // Connect without authenticated user if token expired or invalid
      next();
    }
  });

  const registerUser = (socket, user) => {
    if (!user || !user._id) return;
    const uId = user._id.toString();
    const uname = (user.username || '').toLowerCase();
    socket.userId = uId;
    socket.user = user;

    // Join personal rooms for direct routing (both by MongoDB _id and username)
    socket.join(`user:${uId}`);
    if (uname) {
      socket.join(`user:${uname}`);
    }

    console.log(`⚡ [User Online] @${user.username || 'unknown'} (${uId}) connected via socket ${socket.id}`);

    // Track online presence
    if (!onlineUsers.has(uId)) {
      onlineUsers.set(uId, {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        socketIds: new Set(),
      });
      // Broadcast user online status
      ioInstance?.emit('presence:user_online', {
        userId: uId,
        user: onlineUsers.get(uId).user,
      });
    }

    onlineUsers.get(uId).socketIds.add(socket.id);

    // Send initial online users list to connecting client
    const onlineList = Array.from(onlineUsers.entries()).map(([entryUid, data]) => ({
      userId: entryUid,
      user: data.user,
    }));
    socket.emit('presence:online_users', onlineList);

    // Reconnection Grace handler: Cancel pending disconnect grace timer if user reconnected within 15s
    callSessionManager.handleSocketReconnect(uId);

    // Check for any pending incoming calls waiting for this user in callSessionManager
    for (const [callId, session] of callSessionManager.sessions.entries()) {
      const isTarget = session.calleeId === uId;
      if (isTarget && session.status === 'initiated') {
        callSessionManager.setRinging(callId);
        // Ring recipient who just came online
        socket.emit('call:incoming', {
          callId: session.callId,
          caller: session.callerInfo,
          callType: session.callType,
        });
      }
    }
  };

  io.on('connection', (socket) => {
    let userId = socket.userId;
    console.log(`🔌 [Socket Connect] ${socket.id} (user: ${userId || 'guest'})`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      if (socket.user) {
        registerUser(socket, socket.user);
      }
    }

    // Client can explicitly identify after login or token acquisition
    // STRICT SECURITY: Identification REQUIREs verified JWT token. Untrusted userId/username is rejected.
    socket.on('auth:identify', async ({ token } = {}, ack) => {
      try {
        if (!token) {
          if (typeof ack === 'function') ack({ success: false, error: 'Authentication token required.' });
          return;
        }

        const secret = process.env.JWT_SECRET || 'pulse518_super_secret_course_key_2026';
        const decoded = jwt.verify(token, secret);
        const uId = (decoded.userId || decoded.id || decoded._id)?.toString();

        if (!uId) {
          if (typeof ack === 'function') ack({ success: false, error: 'Invalid token payload.' });
          return;
        }

        const user = await User.findById(uId).select('name username email avatarUrl role status tokenVersion isApproved');
        if (!user || !user.isApproved) {
          if (typeof ack === 'function') ack({ success: false, error: 'User not found or suspended.' });
          return;
        }

        const currentVersion = user.tokenVersion || 0;
        const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : null;
        if (tokenVersion === null ? currentVersion > 0 : tokenVersion !== currentVersion) {
          if (typeof ack === 'function') ack({ success: false, error: 'Session has been revoked.' });
          return;
        }

        socket.userId = user._id.toString();
        socket.user = user;
        socket.data = socket.data || {};
        socket.data.userId = socket.userId;
        socket.data.user = user;
        userId = socket.userId;

        registerUser(socket, user);

        if (typeof ack === 'function') {
          ack({ success: true, userId: socket.userId, username: user.username });
        }
      } catch (err) {
        console.warn('Socket auth:identify error:', err.message);
        if (typeof ack === 'function') ack({ success: false, error: 'Authentication failed.' });
      }
    });

    // ==========================================
    // CLEARFEED MESH PACKET RELAY (LAN / Wi-Fi)
    // ==========================================
    socket.on('mesh:packet', (envelope) => {
      if (envelope && envelope.magic === 'CFM1') {
        console.log(`📡 [Mesh Relay] Relayed CFM1 packet ${envelope.packetId?.slice(0, 8)} (${envelope.type}) from ${envelope.senderPubkey?.slice(0, 8)} to ${envelope.recipientPubkey?.slice(0, 8)}`);
        // Broadcast the encrypted envelope to all other connected devices on the local network
        socket.broadcast.emit('mesh:packet', envelope);
      }
    });

    // ==========================================
    // 1. MESSAGING & CHAT EVENTS
    // ==========================================

    // Join specific conversation room (IDOR prevented: verifies participant membership)
    socket.on('chat:join', async ({ conversationId }, ack) => {
      const actorId = socket.userId || userId;
      if (!actorId) {
        if (typeof ack === 'function') ack({ success: false, error: 'Unauthorized' });
        return;
      }
      if (!conversationId) return;

      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (typeof ack === 'function') ack({ success: false, error: 'Conversation not found.' });
          return;
        }

        const isParticipant = conv.participants.some((p) => p.toString() === actorId);
        if (!isParticipant) {
          socket.emit('chat:error', { message: 'Forbidden: You are not a participant in this conversation.' });
          if (typeof ack === 'function') ack({ success: false, error: 'Forbidden: You are not a participant.' });
          return;
        }

        socket.join(`conv:${conversationId}`);
        if (typeof ack === 'function') ack({ success: true, conversationId });
      } catch (err) {
        console.warn('chat:join error:', err.message);
      }
    });

    // Leave conversation room
    socket.on('chat:leave', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv:${conversationId}`);
      }
    });

    // Typing status
    socket.on('chat:typing', ({ conversationId, recipientId, isTyping }) => {
      const finalUserId = userId || socket.id;
      const payload = {
        conversationId,
        userId: finalUserId,
        username: socket.user?.username || 'Someone',
        isTyping: Boolean(isTyping),
      };

      if (recipientId) {
        io.to(`user:${recipientId}`).emit('chat:typing', payload);
      }
      if (conversationId) {
        socket.to(`conv:${conversationId}`).emit('chat:typing', payload);
      }
    });

    // Direct Message sent via socket
    socket.on('chat:send_message', async (data, callback) => {
      const actorId = socket.userId || userId;
      if (!actorId) {
        if (typeof callback === 'function') callback({ error: 'Unauthorized' });
        return;
      }

      try {
        const { conversationId, recipientId, text, codeSnippet, replyTo, clientMessageId, mediaUrl } = data || {};

        // Idempotent duplicate check: If clientMessageId was previously submitted by this sender, return the saved message
        if (clientMessageId && typeof clientMessageId === 'string' && clientMessageId.trim()) {
          const cleanClientId = clientMessageId.trim();
          const existingMsg = await Message.findOne({
            sender: actorId,
            clientMessageId: cleanClientId,
          })
            .populate('sender', 'name username avatarUrl')
            .populate('recipient', 'name username avatarUrl')
            .populate('reactions.user', 'name username avatarUrl')
            .populate('typingChallenge');

          if (existingMsg) {
            const existingData = existingMsg.toObject();
            if (existingData.replyTo && !existingData.replyTo.text && !existingData.replyTo.hasCode) {
              existingData.replyTo = null;
            }
            if (typeof callback === 'function') {
              callback({ success: true, message: existingData, deduplicated: true });
            }
            return;
          }
        }

        const trimmedText = text ? text.trim().slice(0, 1000) : '';
        const cleanMediaUrl = typeof mediaUrl === 'string' && mediaUrl.trim() ? mediaUrl.trim() : null;
        const hasValidCode = codeSnippet && codeSnippet.code && codeSnippet.code.trim().length > 0;

        if (!trimmedText && !hasValidCode && !cleanMediaUrl) {
          if (typeof callback === 'function') callback({ error: 'Message cannot be empty.' });
          return;
        }

        let conv = null;
        if (conversationId) {
          conv = await Conversation.findById(conversationId);
        } else if (recipientId) {
          conv = await Conversation.findOne({
            participants: { $all: [actorId, recipientId] },
          });
          if (!conv) {
            conv = new Conversation({
              participants: [actorId, recipientId],
              unreadCounts: new Map([
                [actorId, 0],
                [recipientId, 0],
              ]),
            });
            await conv.save();
          }
        }

        if (!conv) {
          if (typeof callback === 'function') callback({ error: 'Conversation not found.' });
          return;
        }

        // Strict authorization check: sender must be in participants
        const isParticipant = conv.participants.some((p) => p.toString() === actorId);
        if (!isParticipant) {
          if (typeof callback === 'function') callback({ error: 'Forbidden: You are not a participant in this conversation.' });
          return;
        }

        const targetRecipientId = conv.participants.find((p) => p.toString() !== actorId);
        if (!targetRecipientId) {
          if (typeof callback === 'function') callback({ error: 'Invalid recipient.' });
          return;
        }

        const newMsg = new Message({
          conversation: conv._id,
          sender: actorId,
          recipient: targetRecipientId,
          text: trimmedText,
          mediaUrl: cleanMediaUrl || undefined,
          clientMessageId: clientMessageId && typeof clientMessageId === 'string' ? clientMessageId.trim() : undefined,
          deliveryStatus: 'SENT_TO_SERVER',
          codeSnippet: hasValidCode
            ? {
                language: (codeSnippet.language || 'javascript').slice(0, 30).toLowerCase(),
                code: codeSnippet.code.slice(0, 4000),
              }
            : undefined,
          replyTo:
            replyTo && (replyTo.text || replyTo.hasCode)
              ? {
                  messageId: replyTo.messageId ? String(replyTo.messageId) : null,
                  text: typeof replyTo.text === 'string' ? replyTo.text.slice(0, 500) : '',
                  senderName: typeof replyTo.senderName === 'string' ? replyTo.senderName.slice(0, 100) : '',
                  hasCode: Boolean(replyTo.hasCode),
                }
              : null,
          isRead: false,
        });

        await newMsg.save();

        // Update conversation summary
        conv.lastMessage = {
          text: trimmedText || (hasValidCode ? 'Shared a code snippet' : (cleanMediaUrl ? 'Sent a media attachment' : 'New message')),
          hasCode: Boolean(hasValidCode),
          sender: userId,
          createdAt: new Date(),
        };

        const currentUnread = getUnreadForUser(conv.unreadCounts, targetRecipientId);
        setUnreadForUser(conv, targetRecipientId, currentUnread + 1);
        await conv.save();

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'name username avatarUrl')
          .populate('recipient', 'name username avatarUrl');

        const messageData = populatedMsg.toObject();
        if (messageData.replyTo && !messageData.replyTo.text && !messageData.replyTo.hasCode) {
          messageData.replyTo = null;
        }

        // Real-time broadcast to conversation and personal rooms (chained to prevent duplicate packets to same socket)
        const rooms = new Set();
        if (conv._id) rooms.add(`conv:${conv._id.toString()}`);
        if (targetRecipientId) rooms.add(`user:${targetRecipientId.toString()}`);
        if (userId) rooms.add(`user:${userId.toString()}`);

        let broadcaster = io;
        for (const r of rooms) {
          broadcaster = broadcaster.to(r);
        }
        broadcaster.emit('chat:message', {
          conversationId: conv._id.toString(),
          message: messageData,
        });

        // Create Notification record for direct message and send background push alert
        (async () => {
          try {
            await Notification.create({
              recipient: targetRecipientId,
              sender: userId,
              type: 'message',
              conversation: conv._id,
            });

            const { sendPushToUser } = require('../services/pushNotificationService');
            const senderUserDoc = await User.findById(userId).select('name username').lean();
            const senderName = senderUserDoc?.name || senderUserDoc?.username || 'New Message';
            sendPushToUser(targetRecipientId, {
              title: senderName,
              body: trimmedText || (hasValidCode ? 'Shared a code snippet' : 'Sent you a direct message'),
              data: {
                type: 'message',
                conversationId: conv._id.toString(),
                senderId: userId.toString(),
                senderName,
              },
              sound: 'default',
              badge: currentUnread + 1,
              channelId: 'messages',
            }).catch((pushErr) => console.warn('Background push error:', pushErr.message));
          } catch (notifErr) {
            console.warn('Socket message notification error:', notifErr.message);
          }
        })();

        if (typeof callback === 'function') {
          callback({ success: true, message: messageData });
        }

        // Asynchronously dispatch AI response if recipient is Clearfeed AI (@ai)
        (async () => {
          try {
            const aiService = require('../services/aiService');
            const recipientDoc = await User.findById(targetRecipientId).select('name username role isAi');
            if (recipientDoc && (recipientDoc.username === 'ai' || recipientDoc.role === 'ai' || recipientDoc.isAi)) {
              broadcastTypingStatus(conv._id, targetRecipientId, true, userId);

              const history = await Message.find({ conversation: conv._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('sender', 'name username role isAi');

              const chronologicalHistory = history.reverse();

              const senderUser = await User.findById(userId);

              const aiReplyText = await aiService.generateDirectChatReply({
                user: senderUser || { name: 'User' },
                conversation: conv,
                recentMessages: chronologicalHistory,
                userMessage: trimmedText,
              });

              const aiMessage = new Message({
                conversation: conv._id,
                sender: targetRecipientId,
                recipient: userId,
                text: aiReplyText,
                isRead: false,
              });
              await aiMessage.save();

              conv.lastMessage = {
                text: aiReplyText.slice(0, 1000),
                hasCode: false,
                sender: targetRecipientId,
                createdAt: new Date(),
              };
              const curUnread = getUnreadForUser(conv.unreadCounts, userId);
              setUnreadForUser(conv, userId, curUnread + 1);
              await conv.save();

              broadcastTypingStatus(conv._id, targetRecipientId, false, userId);
              broadcastChatMessage(conv._id, aiMessage, userId, targetRecipientId);
            }
          } catch (aiErr) {
            console.error('Socket AI chat error:', aiErr);
            broadcastTypingStatus(conv._id, targetRecipientId, false, userId);
          }
        })();
      } catch (sendErr) {
        console.error('Socket chat:send_message error:', sendErr);
        if (typeof callback === 'function') callback({ error: sendErr.message });
      }
    });

    // Mark messages as read (double teal check mark acknowledgment)
    socket.on('chat:mark_read', async ({ conversationId, messageIds }) => {
      if (!userId || !conversationId) return;

      try {
        const readNow = new Date();
        const filter = {
          conversation: conversationId,
          recipient: userId,
          isRead: false,
        };
        if (Array.isArray(messageIds) && messageIds.length > 0) {
          filter._id = { $in: messageIds };
        }

        await Message.updateMany(filter, {
          isRead: true,
          deliveryStatus: 'READ',
          readAt: readNow,
        });

        const payload = {
          conversationId,
          readBy: userId,
          readAt: readNow.toISOString(),
          deliveryStatus: 'READ',
          messageIds: Array.isArray(messageIds) ? messageIds : undefined,
        };

        // Notify conversation partner that messages have been read
        socket.to(`conv:${conversationId}`).emit('chat:messages_read', payload);
        io.to(`conv:${conversationId}`).emit('chat:messages_read', payload);
      } catch (err) {
        console.error('Socket chat:mark_read error:', err);
      }
    });

    // Recipient Device Delivery Acknowledgment (DELIVERED_TO_DEVICE double check mark)
    socket.on('message:delivered_ack', async ({ messageId, clientMessageId, conversationId, senderId }) => {
      try {
        const query = messageId && mongoose.Types.ObjectId.isValid(messageId)
          ? { _id: messageId }
          : clientMessageId
          ? { clientMessageId }
          : null;

        if (!query) return;

        const msg = await Message.findOne(query);
        const deliveredNow = new Date();

        if (msg && msg.deliveryStatus !== 'READ') {
          msg.deliveryStatus = 'DELIVERED_TO_DEVICE';
          msg.deliveredAt = deliveredNow;
          await msg.save();
        }

        const targetSenderId = senderId || msg?.sender;
        const convId = conversationId || msg?.conversation;

        const payload = {
          messageId: msg?._id || messageId,
          clientMessageId: msg?.clientMessageId || clientMessageId,
          conversationId: convId ? convId.toString() : null,
          deliveryStatus: 'DELIVERED_TO_DEVICE',
          deliveredAt: (msg?.deliveredAt || deliveredNow).toISOString(),
        };

        if (targetSenderId) {
          io.to(`user:${targetSenderId.toString()}`).emit('chat:message_delivered', payload);
        }
        if (convId) {
          io.to(`conv:${convId.toString()}`).emit('chat:message_delivered', payload);
        }
      } catch (err) {
        console.warn('Socket message:delivered_ack error:', err.message);
      }
    });

    // ==========================================
    // 2. 1-ON-1 AUDIO CALL SIGNALING (WebRTC Free Mesh)
    // ==========================================

    // Initiate Call (Strict caller validation from authenticated socket)
    socket.on('call:initiate', async ({ callId, targetUserId, callerInfo, callType = 'audio' }) => {
      const effectiveCallerId = (socket.userId || userId || '').toString();
      const normTargetUserId = (targetUserId || '').toString().trim();

      if (!effectiveCallerId || !normTargetUserId) {
        console.warn('⚠️ call:initiate ignored: missing caller or target id', { effectiveCallerId, normTargetUserId });
        return;
      }

      // Ensure caller is in personal room and dedicated call room
      socket.join(`user:${effectiveCallerId}`);
      if (callId) {
        socket.join(`call:${callId}`);
      }

      const callerPayload = {
        _id: effectiveCallerId,
        name: socket.user?.name || callerInfo?.name || 'Classmate',
        username: socket.user?.username || callerInfo?.username || 'user',
        avatarUrl: socket.user?.avatarUrl || callerInfo?.avatarUrl,
      };

      const callData = {
        callId,
        caller: callerPayload,
        targetUserId: normTargetUserId,
        callType,
        status: 'calling',
        createdAt: new Date(),
      };

      // Resolve target user by ObjectId or by username
      let targetUserDoc = null;
      try {
        if (mongoose.Types.ObjectId.isValid(normTargetUserId)) {
          targetUserDoc = await User.findById(normTargetUserId).select('_id username name avatarUrl');
        }
        if (!targetUserDoc) {
          targetUserDoc = await User.findOne({ username: normTargetUserId.toLowerCase() }).select('_id username name avatarUrl');
        }
      } catch (err) {
        console.warn('⚠️ targetUserDoc resolve error:', err.message);
      }

      const targetId = targetUserDoc ? targetUserDoc._id.toString() : normTargetUserId;
      const targetUsername = targetUserDoc ? (targetUserDoc.username || '').toLowerCase() : '';
      callData.targetId = targetId;
      callData.targetUsername = targetUsername;

      try {
        // Delegate to Server-Authoritative Call Session Manager
        const initResult = await callSessionManager.initiateCall({
          callId,
          callerId: effectiveCallerId,
          calleeId: targetId,
          callerInfo: callerPayload,
          calleeInfo: targetUserDoc
            ? {
                _id: targetId,
                name: targetUserDoc.name,
                username: targetUserDoc.username,
                avatarUrl: targetUserDoc.avatarUrl,
              }
            : { _id: targetId, name: 'Callee' },
          callType,
          socket,
        });

        if (initResult.error) {
          if (initResult.error === 'glare_superseded') {
            console.log(`⚔️ [Glare Superseded] ${effectiveCallerId} -> ${targetId}, winning call: ${initResult.winningCallId}`);
            socket.emit('call:busy', {
              callId,
              reason: 'glare_superseded',
              winningCallId: initResult.winningCallId,
            });
            return;
          }

          if (initResult.error === 'busy') {
            socket.emit('call:busy', {
              callId,
              reason: initResult.reason || 'callee_busy',
              targetUserId: targetId,
            });
            socket.emit('call:rejected', {
              callId,
              reason: 'busy',
            });
            return;
          }

          socket.emit('call:ended', {
            callId,
            reason: initResult.error,
          });
          return;
        }

        if (initResult.duplicate) {
          return;
        }

        // Check if target user has active sockets in room or in online presence
        const targetIdRoom = io.sockets.adapter.rooms.get(`user:${targetId}`);
        const targetUserRoom = targetUsername ? io.sockets.adapter.rooms.get(`user:${targetUsername}`) : null;
        const rawTargetRoom = normTargetUserId !== targetId ? io.sockets.adapter.rooms.get(`user:${normTargetUserId}`) : null;
        const idSockets = targetIdRoom ? targetIdRoom.size : 0;
        const userSockets = targetUserRoom ? targetUserRoom.size : 0;
        const rawSockets = rawTargetRoom ? rawTargetRoom.size : 0;
        const hasActiveSockets = idSockets > 0 || userSockets > 0 || rawSockets > 0;
        const isOnline = onlineUsers.has(targetId) || (targetUsername && onlineUsers.has(targetUsername)) || hasActiveSockets;

        if (isOnline) {
          callSessionManager.setRinging(callId);
        }

        // ALWAYS emit call:incoming to all valid candidate rooms for this recipient
        const incomingPayload = {
          callId,
          caller: callerPayload,
          callType,
        };

        const recipientRooms = new Set([`user:${targetId}`]);
        if (targetUsername) recipientRooms.add(`user:${targetUsername}`);
        if (normTargetUserId) recipientRooms.add(`user:${normTargetUserId}`);

        for (const room of recipientRooms) {
          io.to(room).emit('call:incoming', incomingPayload);
        }

        console.log(`📞 [Call Started] from ${effectiveCallerId} to ${targetId} (@${targetUsername || 'unknown'}) (callId: ${callId}, online: ${isOnline}, sockets: ${idSockets}/${userSockets})`);

        // Wake mobile device via push notification if backgrounded
        try {
          const { sendPushToUser } = require('../services/pushNotificationService');
          sendPushToUser(targetId, {
            title: `📞 Incoming Call from ${callerPayload.name || callerPayload.username}`,
            body: `Tap to answer incoming ${callType} call`,
            data: {
              type: 'incoming_call',
              callId,
              caller: callerPayload,
              callType,
            },
          }).catch(() => {});
        } catch {}
      } catch (err) {
        console.error('Call initiate error:', err.message);
        socket.emit('call:ended', { callId, reason: 'internal_error' });
      }
    });

    // Cancel Call (Caller cancels before answer)
    socket.on('call:cancel', async ({ callId, targetUserId, reason = 'cancelled' } = {}) => {
      const callerId = (socket.userId || socket.user?._id || '').toString();
      if (callId) {
        socket.leave(`call:${callId}`);
      }
      await callSessionManager.cancelCall({ callId, callerId, reason });
      console.log(`📞 [Call Cancelled] ${callId} by caller ${callerId}`);
    });

    // Accept Call
    socket.on('call:accept', async ({ callId, targetUserId }) => {
      if (callId) {
        socket.join(`call:${callId}`);
      }
      const responderId = (socket.userId || socket.user?._id || '').toString();
      await callSessionManager.acceptCall({
        callId,
        responderId,
        socketId: socket.id,
        socket,
      });
      console.log(`📞 [Call Accepted] ${callId} by ${responderId}`);
    });

    // Reject / Decline Call
    socket.on('call:reject', async ({ callId, targetUserId, reason = 'declined' } = {}) => {
      if (callId) {
        socket.leave(`call:${callId}`);
      }
      const responderId = (socket.userId || socket.user?._id || '').toString();
      const session = callSessionManager.sessions.get(callId);
      const callerId = session ? session.callerId : targetUserId;

      await callSessionManager.rejectCall({
        callId,
        responderId,
        reason,
      });

      // Also emit call:rejected for legacy listeners
      if (callerId) {
        io.to(`user:${callerId}`).emit('call:rejected', {
          callId,
          reason,
        });
      }
      console.log(`📞 [Call Rejected] ${callId} reason: ${reason} by ${responderId}`);
    });

    // End / Hangup Call
    socket.on('call:end', async ({ callId, targetUserId, reason = 'completed' } = {}) => {
      if (callId) {
        socket.leave(`call:${callId}`);
      }
      const endedById = (socket.userId || socket.user?._id || '').toString();
      await callSessionManager.endCall({
        callId,
        endedById,
        reason,
      });
      console.log(`📞 [Call Ended] ${callId} endedBy: ${endedById}`);
    });

    // Heartbeat Ping from client (5s interval while call is active)
    socket.on('call:heartbeat', ({ callId }) => {
      const uId = socket.userId || socket.user?._id;
      if (callId && uId) {
        callSessionManager.recordHeartbeat(callId, uId);
      }
    });

    // WebRTC Signaling Relay (SDP Offer, SDP Answer, ICE Candidates)
    // Strictly verifies that the actor is an active caller/callee in the call session
    socket.on('call:signal', ({ callId, targetUserId, signal }) => {
      if (!signal) return;
      const actorId = (socket.userId || userId || '').toString();
      if (!actorId) return;

      if (callId) {
        const session = callSessionManager.sessions.get(callId);
        if (session) {
          const isParticipant =
            session.callerId === actorId ||
            session.calleeId === actorId ||
            session.responderId === actorId;
          if (!isParticipant) {
            console.warn(`🛑 [WebRTC Security] Unauthorized call:signal attempt by ${actorId} on callId ${callId}`);
            return;
          }

          // Track ICE restart count if signal indicates ice restart
          if (signal.type === 'offer' && signal.sdp?.sdp?.includes('ice-restart')) {
            session.iceRestartCount = (session.iceRestartCount || 0) + 1;
          }
        }
      }

      // 1. Relay through the dedicated call room (excluding sender)
      if (callId) {
        socket.to(`call:${callId}`).emit('call:signal', {
          callId,
          fromUserId: actorId,
          signal,
        });
      }

      // 2. Also relay directly to user's personal room for redundancy
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit('call:signal', {
          callId,
          fromUserId: actorId,
          signal,
        });
      }
    });

    // ==========================================
    // 3. GROUP AUDIO CALL SIGNALING (Free Mesh)
    // ==========================================

    // Join Group Call Room
    socket.on('group-call:join', ({ roomId, user }) => {
      const finalUserId = userId || user?._id || socket.id;
      if (!roomId || !finalUserId) return;

      const participantInfo = user || {
        _id: finalUserId,
        name: socket.user?.name || 'Member',
        username: socket.user?.username || 'member',
        avatarUrl: socket.user?.avatarUrl,
      };

      if (!groupCallRooms.has(roomId)) {
        groupCallRooms.set(roomId, new Map());
      }

      const roomParticipants = groupCallRooms.get(roomId);

      // Return current participants to the joining user
      const existingList = Array.from(roomParticipants.values());
      socket.emit('group-call:existing_participants', {
        roomId,
        participants: existingList,
      });

      // Add joining user to room map
      roomParticipants.set(finalUserId, {
        user: participantInfo,
        isMuted: false,
        joinedAt: new Date(),
        socketId: socket.id,
      });

      // Join socket room
      socket.join(`group-call:${roomId}`);

      // Broadcast to existing participants that a new user joined
      socket.to(`group-call:${roomId}`).emit('group-call:user_joined', {
        roomId,
        participant: roomParticipants.get(finalUserId),
      });
    });

    // Group Call Invitation
    socket.on('group-call:invite', ({ roomId, roomName, targetUserIds, caller }) => {
      if (!Array.isArray(targetUserIds) || !roomId) return;
      const callerData = caller || {
        _id: userId,
        name: socket.user?.name || 'User',
        username: socket.user?.username || 'user',
        avatarUrl: socket.user?.avatarUrl,
      };

      targetUserIds.forEach((targetId) => {
        io.to(`user:${targetId}`).emit('group-call:incoming', {
          roomId,
          roomName: roomName || 'Group Voice Call',
          caller: callerData,
        });
      });
    });

    // Group Call WebRTC Signal Relay
    socket.on('group-call:signal', ({ roomId, targetUserId, signal }) => {
      const finalUserId = userId || socket.id;
      if (!targetUserId || !signal) return;
      io.to(`user:${targetUserId}`).emit('group-call:signal', {
        roomId,
        fromUserId: finalUserId,
        fromUser: socket.user,
        signal,
      });
    });

    // Group Call Speaking State (audio wave synchronization)
    socket.on('group-call:speaking', ({ roomId, isSpeaking }) => {
      const finalUserId = userId || socket.id;
      if (!roomId) return;
      io.to(`group-call:${roomId}`).emit('group-call:user_speaking', {
        roomId,
        userId: finalUserId,
        isSpeaking: Boolean(isSpeaking),
      });
    });

    // Group Call Mute Toggle
    socket.on('group-call:toggle_mute', ({ roomId, isMuted }) => {
      const finalUserId = userId || socket.id;
      if (!roomId || !groupCallRooms.has(roomId)) return;
      const room = groupCallRooms.get(roomId);
      if (room.has(finalUserId)) {
        room.get(finalUserId).isMuted = Boolean(isMuted);
      }
      io.to(`group-call:${roomId}`).emit('group-call:user_mute_state', {
        roomId,
        userId: finalUserId,
        isMuted: Boolean(isMuted),
      });
    });

    // Leave Group Call
    socket.on('group-call:leave', ({ roomId }) => {
      const finalUserId = userId || socket.id;
      if (!roomId || !groupCallRooms.has(roomId)) return;
      const room = groupCallRooms.get(roomId);
      room.delete(finalUserId);

      if (room.size === 0) {
        groupCallRooms.delete(roomId);
      }

      socket.leave(`group-call:${roomId}`);
      io.to(`group-call:${roomId}`).emit('group-call:user_left', {
        roomId,
        userId: finalUserId,
      });
    });

    // ==========================================
    // 4. SPACES LIVE SERVER-AUTHORITATIVE ENGINE
    // ==========================================
    const handleSpaceJoin = ({ spaceId, user }) => {
      const finalUserId = userId || user?._id || socket.id;
      try {
        const userInfo = user || {
          _id: finalUserId,
          name: socket.user?.name || 'Visitor',
          username: socket.user?.username || 'visitor',
          avatarUrl: socket.user?.avatarUrl,
        };

        const result = spaceSessionManager.joinSpace(spaceId, userInfo, socket.id);
        socket.join(`space:${spaceId}`);

        socket.emit('spaces:joined', {
          space: result.space,
          participant: result.participant,
          mediaToken: result.mediaToken,
        });

        io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
        io.emit('spaces:updated', { spaces: spaceSessionManager.getActiveSpaces() });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    };
    socket.on('spaces:join', handleSpaceJoin);
    socket.on('space:join', handleSpaceJoin);

    const handleSpaceLeave = ({ spaceId }) => {
      const finalUserId = userId || socket.id;
      socket.leave(`space:${spaceId}`);
      const updatedSpace = spaceSessionManager.leaveSpace(spaceId, finalUserId, socket.id, io);
      if (updatedSpace) {
        io.to(`space:${spaceId}`).emit('space:state_change', { space: updatedSpace });
      }
      io.emit('spaces:updated', { spaces: spaceSessionManager.getActiveSpaces() });
    };
    socket.on('spaces:leave', handleSpaceLeave);
    socket.on('space:leave', handleSpaceLeave);

    const handleRequestSpeak = ({ spaceId, raised }) => {
      const finalUserId = userId || socket.id;
      try {
        let space;
        if (raised === false) {
          space = spaceSessionManager.cancelRequest(spaceId, finalUserId);
        } else {
          space = spaceSessionManager.requestSpeak(spaceId, finalUserId);
        }
        io.to(`space:${spaceId}`).emit('space:state_change', { space });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    };
    socket.on('spaces:request_speak', handleRequestSpeak);
    socket.on('spaces:cancel_request', ({ spaceId }) => handleRequestSpeak({ spaceId, raised: false }));
    socket.on('space:raise_hand', handleRequestSpeak);

    socket.on('spaces:approve_speak', ({ spaceId, targetUserId }) => {
      const finalUserId = userId || socket.id;
      try {
        const result = spaceSessionManager.approveSpeak(spaceId, finalUserId, targetUserId);
        io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
        io.to(`user:${targetUserId}`).emit('spaces:speaker_promoted', {
          spaceId,
          mediaToken: result.mediaToken,
        });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    socket.on('spaces:reject_speak', ({ spaceId, targetUserId }) => {
      const finalUserId = userId || socket.id;
      try {
        const space = spaceSessionManager.rejectSpeak(spaceId, finalUserId, targetUserId);
        io.to(`space:${spaceId}`).emit('space:state_change', { space });
        io.to(`user:${targetUserId}`).emit('spaces:speak_rejected', { spaceId });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    const handleToggleMute = ({ spaceId, isMuted }) => {
      const finalUserId = userId || socket.id;
      try {
        const space = spaceSessionManager.toggleMute(spaceId, finalUserId, isMuted);
        io.to(`space:${spaceId}`).emit('space:state_change', { space });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    };
    socket.on('spaces:toggle_mute', handleToggleMute);
    socket.on('space:toggle_mute', handleToggleMute);

    socket.on('spaces:force_mute', async ({ spaceId, targetUserId }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      try {
        if (targetUserId) {
          const targetDoc = await User.findById(targetUserId).select('username email');
          if (targetDoc && isCoAdmin(targetDoc.username, targetDoc.email)) {
            socket.emit('space:error', { message: 'Root platform maintainers cannot be force muted.' });
            return;
          }
        }
        const space = spaceSessionManager.forceMute(spaceId, finalUserId, targetUserId);
        io.to(`space:${spaceId}`).emit('space:state_change', { space });
        io.to(`user:${targetUserId}`).emit('spaces:force_muted', { spaceId });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    socket.on('spaces:demote_to_listener', async ({ spaceId, targetUserId }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      try {
        if (targetUserId) {
          const targetDoc = await User.findById(targetUserId).select('username email');
          if (targetDoc && isCoAdmin(targetDoc.username, targetDoc.email)) {
            socket.emit('space:error', { message: 'Root platform maintainers cannot be demoted.' });
            return;
          }
        }
        const result = spaceSessionManager.demoteToListener(spaceId, finalUserId, targetUserId);
        io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
        io.to(`user:${targetUserId}`).emit('spaces:demoted', {
          spaceId,
          mediaToken: result.mediaToken,
        });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    socket.on('spaces:promote_cohost', ({ spaceId, targetUserId }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      try {
        const result = spaceSessionManager.promoteCoHost(spaceId, finalUserId, targetUserId);
        io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
        io.to(`user:${targetUserId}`).emit('spaces:promoted_cohost', {
          spaceId,
          mediaToken: result.mediaToken,
        });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    socket.on('spaces:transfer_host', ({ spaceId, newHostId }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      try {
        const space = spaceSessionManager.transferHost(spaceId, finalUserId, newHostId);
        io.to(`space:${spaceId}`).emit('space:host_transferred', {
          spaceId,
          newHostId,
          reason: 'manual_transfer',
        });
        io.to(`space:${spaceId}`).emit('space:state_change', { space });
        io.emit('spaces:updated', { spaces: spaceSessionManager.getActiveSpaces() });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    socket.on('spaces:kick_participant', async ({ spaceId, targetUserId }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      try {
        if (targetUserId) {
          const targetDoc = await User.findById(targetUserId).select('username email');
          if (targetDoc && isCoAdmin(targetDoc.username, targetDoc.email)) {
            socket.emit('space:error', { message: 'Root platform maintainers cannot be kicked.' });
            return;
          }
        }
        const result = spaceSessionManager.kickParticipant(spaceId, finalUserId, targetUserId);
        for (const sId of result.kickedSocketIds) {
          const s = io.sockets.sockets.get(sId);
          if (s) {
            s.leave(`space:${spaceId}`);
            s.emit('spaces:kicked', { spaceId });
          }
        }
        io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
        io.emit('spaces:updated', { spaces: spaceSessionManager.getActiveSpaces() });
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    // Backward compatibility helper
    socket.on('space:set_role', async ({ spaceId, targetUserId, role }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      try {
        if (role === 'speaker') {
          const result = spaceSessionManager.approveSpeak(spaceId, finalUserId, targetUserId);
          io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
          io.to(`user:${targetUserId}`).emit('spaces:speaker_promoted', {
            spaceId,
            mediaToken: result.mediaToken,
          });
        } else if (role === 'listener') {
          if (targetUserId) {
            const targetDoc = await User.findById(targetUserId).select('username email');
            if (targetDoc && isCoAdmin(targetDoc.username, targetDoc.email)) {
              socket.emit('space:error', { message: 'Root platform maintainers cannot be demoted.' });
              return;
            }
          }
          const result = spaceSessionManager.demoteToListener(spaceId, finalUserId, targetUserId);
          io.to(`space:${spaceId}`).emit('space:state_change', { space: result.space });
          io.to(`user:${targetUserId}`).emit('spaces:demoted', {
            spaceId,
            mediaToken: result.mediaToken,
          });
        }
      } catch (err) {
        socket.emit('space:error', { message: err.message });
      }
    });

    const handleSpeakingState = ({ spaceId, isSpeaking }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;
      spaceSessionManager.setSpeakingState(spaceId, finalUserId, isSpeaking);
      io.to(`space:${spaceId}`).emit('space:user_speaking', {
        spaceId,
        userId: finalUserId,
        isSpeaking: Boolean(isSpeaking),
      });
    };
    socket.on('spaces:speaking_state', handleSpeakingState);
    socket.on('space:speaking_state', handleSpeakingState);

    const handleReaction = ({ spaceId, emoji, username }) => {
      io.to(`space:${spaceId}`).emit('space:reaction', {
        spaceId,
        emoji,
        username: username || socket.user?.name || 'Someone',
      });
    };
    socket.on('spaces:reaction', handleReaction);
    socket.on('space:reaction', handleReaction);

    const handleSignal = ({ spaceId, targetUserId, signal }) => {
      const finalUserId = socket.userId || userId;
      if (!finalUserId) return;

      const session = spaceSessionManager.sessions.get(spaceId);
      if (!session) return;

      // Sender must be an active participant in this Space
      if (!session.participants.has(finalUserId.toString())) return;

      // SECURITY CONSTRAINT: Listeners must NEVER be able to publish audio
      if (signal?.type === 'offer') {
        const sender = session.participants.get(finalUserId.toString());
        if (!sender || sender.role === SpaceRole.LISTENER) {
          socket.emit('space:error', { message: 'Listeners are not authorized to publish media' });
          return;
        }
      }

      io.to(`user:${targetUserId}`).emit('space:signal', {
        spaceId,
        fromUserId: finalUserId.toString(),
        signal,
      });
    };
    socket.on('spaces:signal', handleSignal);
    socket.on('space:signal', handleSignal);

    // ==========================================
    // 5. DISCONNECTION & CLEANUP
    // ==========================================
    socket.on('disconnect', () => {
      const currentUserId = socket.userId || userId;

      if (currentUserId && onlineUsers.has(currentUserId)) {
        const userEntry = onlineUsers.get(currentUserId);
        userEntry.socketIds.delete(socket.id);

        if (userEntry.socketIds.size === 0) {
          onlineUsers.delete(currentUserId);
          // Broadcast offline status
          io.emit('presence:user_offline', { userId: currentUserId });
        }
      }

      // Hand off socket disconnect to CallSessionManager (handles 15s grace period or immediate cancel)
      const hasRemainingSockets = currentUserId && onlineUsers.has(currentUserId) && onlineUsers.get(currentUserId).socketIds.size > 0;
      if (!hasRemainingSockets && currentUserId) {
        callSessionManager.handleSocketDisconnect(currentUserId, socket.id);
      }

      // Cleanup group calls
      for (const [roomId, room] of groupCallRooms.entries()) {
        if (currentUserId && room.has(currentUserId)) {
          room.delete(currentUserId);
          io.to(`group-call:${roomId}`).emit('group-call:user_left', {
            roomId,
            userId: currentUserId,
          });
          if (room.size === 0) {
            groupCallRooms.delete(roomId);
          }
        }
      }

      // Cleanup Spaces Authoritative Engine (handles 180s Host grace window & Co-Host survivability)
      if (currentUserId) {
        spaceSessionManager.handleSocketDisconnect(currentUserId, socket.id, io);
      }
    });
  });

  return io;
}

function getIO() {
  return ioInstance;
}

// Helper to broadcast a message from HTTP controllers
async function broadcastChatMessage(conversationId, message, recipientId, senderId) {
  if (!ioInstance) return;

  let messageData = message;
  try {
    if (message && message._id) {
      const populated = await Message.findById(message._id)
        .populate('sender', 'name username avatarUrl')
        .populate('recipient', 'name username avatarUrl');
      if (populated) messageData = populated.toObject();
    }
  } catch (err) {
    console.warn('⚠️ broadcastChatMessage populate notice:', err.message);
  }

  if (messageData && messageData.replyTo && !messageData.replyTo.text && !messageData.replyTo.hasCode) {
    messageData.replyTo = null;
  }

  const convIdStr = (conversationId || messageData?.conversation)?._id?.toString() || (conversationId || messageData?.conversation)?.toString();

  const payload = {
    conversationId: convIdStr,
    message: messageData,
  };

  // Real-time broadcast chained across target rooms to prevent sending duplicate packets to a single socket
  const rooms = new Set();
  if (convIdStr) rooms.add(`conv:${convIdStr}`);
  if (recipientId) rooms.add(`user:${recipientId.toString()}`);
  const sndId = senderId || messageData?.sender?._id || messageData?.sender;
  if (sndId) rooms.add(`user:${sndId.toString()}`);

  let broadcaster = ioInstance;
  for (const r of rooms) {
    broadcaster = broadcaster.to(r);
  }
  broadcaster.emit('chat:message', payload);
}

// Helper to broadcast typing indicator
function broadcastTypingStatus(conversationId, userId, isTyping, recipientId) {
  if (!ioInstance) return;
  const convIdStr = conversationId?.toString();
  const payload = {
    conversationId: convIdStr,
    userId: userId?.toString(),
    isTyping: Boolean(isTyping),
  };
  if (convIdStr) {
    ioInstance.to(`conv:${convIdStr}`).emit('chat:typing', payload);
  }
  if (recipientId) {
    ioInstance.to(`user:${recipientId.toString()}`).emit('chat:typing', payload);
  }
}

// Helper to broadcast notification in real-time to a user across all active devices
async function broadcastNotification(recipientId, notificationDoc) {
  if (!ioInstance || !recipientId) return;
  try {
    const rIdStr = recipientId.toString();
    const unreadCount = await Notification.countDocuments({
      recipient: recipientId,
      read: false,
    });

    let notifObj = notificationDoc?.toObject ? notificationDoc.toObject() : { ...notificationDoc };

    // Ensure sender details are populated for immediate UI toast display
    if (notifObj && (!notifObj.sender?.name || !notifObj.sender?.username)) {
      if (notifObj._id) {
        const fullDoc = await Notification.findById(notifObj._id)
          .populate('sender', 'name username avatarUrl role')
          .populate({ path: 'post', select: 'content codeSnippet tags isAnnouncement' })
          .populate('typingChallenge')
          .lean();
        if (fullDoc) notifObj = fullDoc;
      }
    }

    ioInstance.to(`user:${rIdStr}`).emit('notification:new', {
      notification: notifObj,
      unreadCount,
    });
  } catch (err) {
    console.warn('broadcastNotification error:', err.message);
  }
}

// Helper to broadcast emoji reaction updates to chat rooms & participants
function broadcastMessageReaction(conversationId, messageId, reactions, action, participantIds = []) {
  if (!ioInstance) return;
  const convIdStr = conversationId?.toString();
  const msgIdStr = messageId?.toString();
  const payload = {
    conversationId: convIdStr,
    messageId: msgIdStr,
    reactions,
    action,
  };

  const rooms = new Set();
  if (convIdStr) rooms.add(`conv:${convIdStr}`);
  if (Array.isArray(participantIds)) {
    participantIds.forEach((p) => {
      const pId = p?._id || p;
      if (pId) rooms.add(`user:${pId.toString()}`);
    });
  }

  for (const r of rooms) {
    ioInstance.to(r).emit('chat:reaction', payload);
    ioInstance.to(r).emit('chat:message_reacted', payload);
  }
}

// Helper to broadcast message deletion to chat rooms & participants
function broadcastMessageDeleted(conversationId, messageId, participantIds = []) {
  if (!ioInstance) return;
  const convIdStr = conversationId?.toString();
  const msgIdStr = messageId?.toString();
  const payload = {
    conversationId: convIdStr,
    messageId: msgIdStr,
  };

  const rooms = new Set();
  if (convIdStr) rooms.add(`conv:${convIdStr}`);
  if (Array.isArray(participantIds)) {
    participantIds.forEach((p) => {
      const pId = p?._id || p;
      if (pId) rooms.add(`user:${pId.toString()}`);
    });
  }

  for (const r of rooms) {
    ioInstance.to(r).emit('chat:delete', payload);
    ioInstance.to(r).emit('chat:message_deleted', payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastChatMessage,
  broadcastTypingStatus,
  broadcastNotification,
  broadcastMessageReaction,
  broadcastMessageDeleted,
};
