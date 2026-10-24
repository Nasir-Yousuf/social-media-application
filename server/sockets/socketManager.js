const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

let ioInstance = null;

// Track online users: userId -> { user: Object, socketIds: Set<string> }
const onlineUsers = new Map();

// Track active 1-on-1 calls: callId -> { caller, recipient, callType, status, createdAt }
const activeCalls = new Map();

// Track group call rooms: roomId -> Map<userId, { user: Object, isMuted: boolean, joinedAt: Date }>
const groupCallRooms = new Map();

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Reflect requesting origin to allow cross-origin socket connections from Vercel deployments
        callback(null, true);
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
          socket.userId = userId.toString();
          try {
            const user = await User.findById(userId).select('name username avatarUrl role status');
            if (user) {
              socket.user = user;
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

    // Check for any pending incoming calls waiting for this user ('calling' state -> transition to 'ringing')
    for (const [callId, call] of activeCalls.entries()) {
      const isTarget =
        call.targetUserId === uId ||
        (uname && call.targetUserId === uname) ||
        call.targetId === uId ||
        (uname && call.targetUsername === uname);

      if (isTarget && call.status === 'calling') {
        call.status = 'ringing';
        // Notify caller that call is now ringing
        const callerId = call.caller?._id || call.caller;
        if (callerId) {
          ioInstance?.to(`user:${callerId}`).emit('call:ringing', {
            callId: call.callId,
            targetUserId: uId,
          });
        }
        // Ring recipient who just came online
        socket.emit('call:incoming', {
          callId: call.callId,
          caller: call.caller,
          callType: call.callType,
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
    socket.on('auth:identify', async ({ token, userId: clientUserId, username: clientUsername } = {}) => {
      try {
        let uId = clientUserId;
        let uname = clientUsername;

        if (token) {
          const secret = process.env.JWT_SECRET || 'pulse518_super_secret_course_key_2026';
          const decoded = jwt.verify(token, secret);
          uId = (decoded.userId || decoded.id || decoded._id || uId)?.toString();
        }

        if (uId) {
          socket.userId = uId.toString();
          socket.join(`user:${socket.userId}`);
          userId = socket.userId;

          try {
            const user = await User.findById(socket.userId).select('name username avatarUrl role status');
            if (user) {
              registerUser(socket, user);
              return;
            }
          } catch {}

          if (uname) {
            socket.join(`user:${uname.toLowerCase()}`);
          }
        }
      } catch (err) {
        console.warn('Socket auth:identify error:', err.message);
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

    // Join specific conversation room
    socket.on('chat:join', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conv:${conversationId}`);
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
      if (!userId) {
        if (typeof callback === 'function') callback({ error: 'Unauthorized' });
        return;
      }

      try {
        const { conversationId, recipientId, text, codeSnippet } = data;
        const trimmedText = text ? text.trim().slice(0, 1000) : '';
        const hasValidCode = codeSnippet && codeSnippet.code && codeSnippet.code.trim().length > 0;

        if (!trimmedText && !hasValidCode) {
          if (typeof callback === 'function') callback({ error: 'Message cannot be empty.' });
          return;
        }

        let conv = null;
        if (conversationId) {
          conv = await Conversation.findById(conversationId);
        } else if (recipientId) {
          conv = await Conversation.findOne({
            participants: { $all: [userId, recipientId], $size: 2 },
          });
          if (!conv) {
            conv = new Conversation({
              participants: [userId, recipientId],
              unreadCounts: new Map([
                [userId, 0],
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

        const targetRecipientId = conv.participants.find((p) => p.toString() !== userId);
        if (!targetRecipientId) {
          if (typeof callback === 'function') callback({ error: 'Invalid recipient.' });
          return;
        }

        const newMsg = new Message({
          conversation: conv._id,
          sender: userId,
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

        await newMsg.save();

        // Update conversation summary
        conv.lastMessage = {
          text: trimmedText || (hasValidCode ? 'Shared a code snippet' : 'New message'),
          hasCode: Boolean(hasValidCode),
          sender: userId,
          createdAt: new Date(),
        };

        const recipientKey = targetRecipientId.toString();
        const currentUnread = conv.unreadCounts?.get(recipientKey) || 0;
        if (conv.unreadCounts) {
          conv.unreadCounts.set(recipientKey, currentUnread + 1);
        }
        await conv.save();

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'name username avatarUrl')
          .populate('recipient', 'name username avatarUrl');

        const messageData = populatedMsg.toObject();

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
                .sort({ createdAt: 1 })
                .limit(10)
                .populate('sender', 'name username role isAi');

              const senderUser = await User.findById(userId);

              const aiReplyText = await aiService.generateDirectChatReply({
                user: senderUser || { name: 'User' },
                conversation: conv,
                recentMessages: history,
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
              const uKey = userId.toString();
              const curUnread = conv.unreadCounts?.get(uKey) || 0;
              if (conv.unreadCounts) {
                conv.unreadCounts.set(uKey, curUnread + 1);
              }
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

    // Mark messages as read (double blue check mark acknowledgment)
    socket.on('chat:mark_read', async ({ conversationId, messageIds }) => {
      if (!userId || !conversationId) return;

      try {
        await Message.updateMany(
          {
            conversation: conversationId,
            recipient: userId,
            isRead: false,
          },
          { isRead: true }
        );

        // Notify conversation partner that messages have been read
        socket.to(`conv:${conversationId}`).emit('chat:messages_read', {
          conversationId,
          readBy: userId,
          readAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Socket chat:mark_read error:', err);
      }
    });

    // ==========================================
    // 2. 1-ON-1 AUDIO CALL SIGNALING (WebRTC Free Mesh)
    // ==========================================

    // Initiate Call
    socket.on('call:initiate', async ({ callId, targetUserId, callerInfo, callType = 'audio' }) => {
      const effectiveCallerId = (socket.userId || callerInfo?._id || callerInfo?.id || '').toString();
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

      const callerPayload = callerInfo || {
        _id: effectiveCallerId,
        name: socket.user?.name || 'Classmate',
        username: socket.user?.username || 'user',
        avatarUrl: socket.user?.avatarUrl,
      };

      const callData = {
        callId,
        caller: callerPayload,
        targetUserId: normTargetUserId,
        callType,
        status: 'calling',
        createdAt: new Date(),
      };

      // Set timeout for unanswered call (45 seconds)
      const timeoutTimer = setTimeout(() => {
        const pendingCall = activeCalls.get(callId);
        if (pendingCall && pendingCall.status !== 'connected') {
          activeCalls.delete(callId);
          io.to(`user:${effectiveCallerId}`).emit('call:ended', {
            callId,
            reason: 'no_answer',
            message: 'No answer',
          });
          io.to(`user:${normTargetUserId}`).emit('call:ended', {
            callId,
            reason: 'no_answer',
          });
        }
      }, 45000);

      callData.timeoutTimer = timeoutTimer;
      activeCalls.set(callId, callData);

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
        callData.status = 'ringing';
        socket.emit('call:ringing', { callId, targetUserId: targetId });
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
    });

    // Accept Call
    socket.on('call:accept', ({ callId, targetUserId }) => {
      const call = activeCalls.get(callId);
      if (call) {
        if (call.timeoutTimer) {
          clearTimeout(call.timeoutTimer);
          call.timeoutTimer = null;
        }
        call.status = 'connected';
        call.connectedAt = new Date();
      }

      // Join the responder to the call room
      if (callId) {
        socket.join(`call:${callId}`);
      }

      const responderId = (socket.userId || socket.user?._id || '').toString();
      const callerId = call?.caller?._id?.toString() || targetUserId;

      const acceptPayload = {
        callId,
        responder: {
          _id: responderId,
          name: socket.user?.name,
          username: socket.user?.username,
          avatarUrl: socket.user?.avatarUrl,
        },
      };

      if (callerId) {
        io.to(`user:${callerId}`).emit('call:accepted', acceptPayload);
      }
      if (callId) {
        socket.to(`call:${callId}`).emit('call:accepted', acceptPayload);
      }
      console.log(`📞 [Call Accepted] ${callId} by ${responderId} -> caller ${callerId}`);
    });

    // Reject / Decline Call
    socket.on('call:reject', ({ callId, targetUserId, reason = 'declined' }) => {
      const call = activeCalls.get(callId);
      if (call && call.timeoutTimer) {
        clearTimeout(call.timeoutTimer);
      }
      activeCalls.delete(callId);
      if (callId) {
        socket.leave(`call:${callId}`);
      }
      const callerId = call?.caller?._id?.toString() || targetUserId;
      if (callerId) {
        io.to(`user:${callerId}`).emit('call:rejected', {
          callId,
          reason,
        });
      }
      console.log(`📞 [Call Rejected] ${callId} reason: ${reason} -> caller ${callerId}`);
    });

    // End / Hangup Call
    socket.on('call:end', ({ callId, targetUserId }) => {
      const call = activeCalls.get(callId);
      if (call && call.timeoutTimer) {
        clearTimeout(call.timeoutTimer);
      }
      activeCalls.delete(callId);
      if (callId) {
        socket.leave(`call:${callId}`);
      }
      const endedById = (socket.userId || socket.user?._id || '').toString();
      const otherId = targetUserId || (call?.caller?._id?.toString() === endedById ? call?.targetUserId : call?.caller?._id?.toString());
      if (otherId) {
        io.to(`user:${otherId}`).emit('call:ended', {
          callId,
          endedBy: endedById,
        });
      }
      if (callId) {
        socket.to(`call:${callId}`).emit('call:ended', {
          callId,
          endedBy: endedById,
        });
      }
      console.log(`📞 [Call Ended] ${callId} endedBy: ${endedById} -> other ${otherId}`);
    });

    // WebRTC Signaling Relay (SDP Offer, SDP Answer, ICE Candidates)
    socket.on('call:signal', ({ callId, targetUserId, fromUserId, signal }) => {
      if (!signal) return;
      const fromId = (fromUserId || socket.userId || socket.user?._id || '').toString();

      console.log(`📡 [WebRTC Signal] callId: ${callId}, from: ${fromId}, to: ${targetUserId}, type: ${signal?.type}`);

      // 1. Relay through the dedicated call room (excluding sender)
      if (callId) {
        socket.to(`call:${callId}`).emit('call:signal', {
          callId,
          fromUserId: fromId,
          signal,
        });
      }

      // 2. Also relay directly to user's personal room for redundancy
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit('call:signal', {
          callId,
          fromUserId: fromId,
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
    // 4. TWITTER-STYLE LIVE AUDIO SPACES
    // ==========================================
    socket.on('space:join', ({ spaceId, user }) => {
      const finalUserId = userId || user?._id || socket.id;
      const { activeSpacesMap, formatSpace } = require('../controllers/spaceController');
      const space = activeSpacesMap.get(spaceId);
      if (!space) {
        socket.emit('space:error', { message: 'Space not found' });
        return;
      }

      const userInfo = user || {
        _id: finalUserId,
        name: socket.user?.name || 'Visitor',
        username: socket.user?.username || 'visitor',
        avatarUrl: socket.user?.avatarUrl,
      };

      socket.join(`space:${spaceId}`);

      // If user is host or existing speaker, put in speakers map
      if (space.host._id === finalUserId || space.speakers.has(finalUserId)) {
        space.speakers.set(finalUserId, {
          user: userInfo,
          isMuted: false,
          role: space.host._id === finalUserId ? 'host' : 'speaker',
          socketId: socket.id,
        });
      } else {
        space.listeners.set(finalUserId, {
          user: userInfo,
          socketId: socket.id,
        });
      }

      // Broadcast update to space room and globally
      io.to(`space:${spaceId}`).emit('space:state_change', { space: formatSpace(space) });
      io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
    });

    socket.on('space:leave', ({ spaceId }) => {
      const finalUserId = userId || socket.id;
      const { activeSpacesMap, formatSpace } = require('../controllers/spaceController');
      const space = activeSpacesMap.get(spaceId);
      if (!space) return;

      socket.leave(`space:${spaceId}`);

      // If host leaves, end space
      if (space.host._id === finalUserId) {
        activeSpacesMap.delete(spaceId);
        io.to(`space:${spaceId}`).emit('space:ended', { spaceId });
        io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
        return;
      }

      space.speakers.delete(finalUserId);
      space.listeners.delete(finalUserId);
      space.handRaised.delete(finalUserId);

      io.to(`space:${spaceId}`).emit('space:state_change', { space: formatSpace(space) });
      io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
    });

    socket.on('space:raise_hand', ({ spaceId, raised }) => {
      const finalUserId = userId || socket.id;
      const { activeSpacesMap, formatSpace } = require('../controllers/spaceController');
      const space = activeSpacesMap.get(spaceId);
      if (!space) return;

      if (raised) {
        space.handRaised.add(finalUserId);
      } else {
        space.handRaised.delete(finalUserId);
      }

      io.to(`space:${spaceId}`).emit('space:state_change', { space: formatSpace(space) });
    });

    socket.on('space:set_role', ({ spaceId, targetUserId, role }) => {
      const finalUserId = userId || socket.id;
      const { activeSpacesMap, formatSpace } = require('../controllers/spaceController');
      const space = activeSpacesMap.get(spaceId);
      if (!space) return;

      // Only host or admin can change roles
      if (space.host._id !== finalUserId && socket.user?.role !== 'admin') return;

      if (role === 'speaker') {
        const listener = space.listeners.get(targetUserId);
        if (listener) {
          space.listeners.delete(targetUserId);
          space.handRaised.delete(targetUserId);
          space.speakers.set(targetUserId, {
            user: listener.user,
            isMuted: false,
            role: 'speaker',
            socketId: listener.socketId,
          });
        }
      } else if (role === 'listener') {
        const speaker = space.speakers.get(targetUserId);
        if (speaker && space.host._id !== targetUserId) {
          space.speakers.delete(targetUserId);
          space.listeners.set(targetUserId, {
            user: speaker.user,
            socketId: speaker.socketId,
          });
        }
      }

      io.to(`space:${spaceId}`).emit('space:state_change', { space: formatSpace(space) });
    });

    socket.on('space:toggle_mute', ({ spaceId, isMuted }) => {
      const finalUserId = userId || socket.id;
      const { activeSpacesMap, formatSpace } = require('../controllers/spaceController');
      const space = activeSpacesMap.get(spaceId);
      if (!space) return;

      if (space.speakers.has(finalUserId)) {
        space.speakers.get(finalUserId).isMuted = Boolean(isMuted);
        io.to(`space:${spaceId}`).emit('space:state_change', { space: formatSpace(space) });
      }
    });

    socket.on('space:speaking_state', ({ spaceId, isSpeaking }) => {
      const finalUserId = userId || socket.id;
      io.to(`space:${spaceId}`).emit('space:user_speaking', {
        spaceId,
        userId: finalUserId,
        isSpeaking: Boolean(isSpeaking),
      });
    });

    socket.on('space:reaction', ({ spaceId, emoji, username }) => {
      io.to(`space:${spaceId}`).emit('space:reaction', {
        spaceId,
        emoji,
        username: username || socket.user?.name || 'Someone',
      });
    });

    socket.on('space:signal', ({ spaceId, targetUserId, signal }) => {
      const finalUserId = userId || socket.id;
      io.to(`user:${targetUserId}`).emit('space:signal', {
        spaceId,
        fromUserId: finalUserId,
        signal,
      });
    });

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

      // Cleanup any active calls this socket was engaged in ONLY if user has no remaining sockets online
      const hasRemainingSockets = currentUserId && onlineUsers.has(currentUserId) && onlineUsers.get(currentUserId).socketIds.size > 0;
      if (!hasRemainingSockets) {
        for (const [callId, call] of activeCalls.entries()) {
          if (call.caller?._id?.toString() === currentUserId || call.targetUserId === currentUserId || call.targetId === currentUserId) {
            if (call.timeoutTimer) {
              clearTimeout(call.timeoutTimer);
            }
            const otherUserId =
              call.caller?._id?.toString() === currentUserId ? (call.targetId || call.targetUserId) : call.caller?._id?.toString();
            if (otherUserId) {
              io.to(`user:${otherUserId}`).emit('call:ended', {
                callId,
                reason: 'disconnected',
              });
            }
            activeCalls.delete(callId);
          }
        }
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

      // Cleanup Spaces
      try {
        const { activeSpacesMap, formatSpace } = require('../controllers/spaceController');
        for (const [spaceId, space] of activeSpacesMap.entries()) {
          if (space.host._id === currentUserId) {
            activeSpacesMap.delete(spaceId);
            io.to(`space:${spaceId}`).emit('space:ended', { spaceId });
            io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
          } else if (space.speakers.has(currentUserId) || space.listeners.has(currentUserId)) {
            space.speakers.delete(currentUserId);
            space.listeners.delete(currentUserId);
            space.handRaised.delete(currentUserId);
            io.to(`space:${spaceId}`).emit('space:state_change', { space: formatSpace(space) });
            io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
          }
        }
      } catch {}
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

module.exports = {
  initSocket,
  getIO,
  broadcastChatMessage,
  broadcastTypingStatus,
};
