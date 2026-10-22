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
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
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
          const user = await User.findById(userId).select('name username avatarUrl role status');
          if (user) {
            socket.user = user;
            socket.userId = user._id.toString();
          }
        }
      }
      next();
    } catch (err) {
      // Connect without authenticated user if token expired or invalid
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (userId && socket.user) {
      // Join personal room for direct routing
      socket.join(`user:${userId}`);

      // Track online presence
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, {
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            username: socket.user.username,
            avatarUrl: socket.user.avatarUrl,
          },
          socketIds: new Set(),
        });
        // Broadcast user online status
        io.emit('presence:user_online', {
          userId,
          user: onlineUsers.get(userId).user,
        });
      }

      onlineUsers.get(userId).socketIds.add(socket.id);

      // Send initial online users list to connecting client
      const onlineList = Array.from(onlineUsers.entries()).map(([uId, data]) => ({
        userId: uId,
        user: data.user,
      }));
      socket.emit('presence:online_users', onlineList);
    }

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

        // Real-time broadcast to both participants
        io.to(`user:${targetRecipientId}`).emit('chat:message', {
          conversationId: conv._id.toString(),
          message: messageData,
        });

        io.to(`user:${userId}`).emit('chat:message', {
          conversationId: conv._id.toString(),
          message: messageData,
        });

        io.to(`conv:${conv._id}`).emit('chat:message', {
          conversationId: conv._id.toString(),
          message: messageData,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: messageData });
        }
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
    socket.on('call:initiate', ({ callId, targetUserId, callerInfo, callType = 'audio' }) => {
      if (!userId || !targetUserId) return;

      const callData = {
        callId,
        caller: callerInfo || {
          _id: userId,
          name: socket.user?.name || 'User',
          username: socket.user?.username || 'user',
          avatarUrl: socket.user?.avatarUrl,
        },
        targetUserId,
        callType,
        status: 'calling',
        createdAt: new Date(),
      };

      activeCalls.set(callId, callData);

      // Check if target user has active sockets
      const targetIsOnline = onlineUsers.has(targetUserId);

      if (!targetIsOnline) {
        socket.emit('call:user_offline', { callId, targetUserId });
        activeCalls.delete(callId);
        return;
      }

      // Notify caller that call is ringing
      socket.emit('call:ringing', { callId, targetUserId });

      // Notify target recipient of incoming call
      io.to(`user:${targetUserId}`).emit('call:incoming', {
        callId,
        caller: callData.caller,
        callType,
      });
    });

    // Accept Call
    socket.on('call:accept', ({ callId, targetUserId }) => {
      const call = activeCalls.get(callId);
      if (call) {
        call.status = 'connected';
        call.connectedAt = new Date();
      }

      io.to(`user:${targetUserId}`).emit('call:accepted', {
        callId,
        responder: {
          _id: userId,
          name: socket.user?.name,
          username: socket.user?.username,
          avatarUrl: socket.user?.avatarUrl,
        },
      });
    });

    // Reject / Decline Call
    socket.on('call:reject', ({ callId, targetUserId, reason = 'declined' }) => {
      activeCalls.delete(callId);
      io.to(`user:${targetUserId}`).emit('call:rejected', {
        callId,
        reason,
      });
    });

    // End / Hangup Call
    socket.on('call:end', ({ callId, targetUserId }) => {
      activeCalls.delete(callId);
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit('call:ended', {
          callId,
          endedBy: userId,
        });
      }
    });

    // WebRTC Signaling Relay (SDP Offer, SDP Answer, ICE Candidates)
    socket.on('call:signal', ({ callId, targetUserId, signal }) => {
      if (!targetUserId || !signal) return;
      io.to(`user:${targetUserId}`).emit('call:signal', {
        callId,
        fromUserId: userId,
        signal,
      });
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
      if (userId && onlineUsers.has(userId)) {
        const userEntry = onlineUsers.get(userId);
        userEntry.socketIds.delete(socket.id);

        if (userEntry.socketIds.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast offline status
          io.emit('presence:user_offline', { userId });
        }
      }

      // Cleanup any active calls this socket was engaged in
      for (const [callId, call] of activeCalls.entries()) {
        if (call.caller?._id?.toString() === userId || call.targetUserId === userId) {
          const otherUserId =
            call.caller?._id?.toString() === userId ? call.targetUserId : call.caller?._id?.toString();
          if (otherUserId) {
            io.to(`user:${otherUserId}`).emit('call:ended', {
              callId,
              reason: 'disconnected',
            });
          }
          activeCalls.delete(callId);
        }
      }

      // Cleanup group calls
      for (const [roomId, room] of groupCallRooms.entries()) {
        if (room.has(userId)) {
          room.delete(userId);
          io.to(`group-call:${roomId}`).emit('group-call:user_left', {
            roomId,
            userId,
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
          if (space.host._id === userId) {
            activeSpacesMap.delete(spaceId);
            io.to(`space:${spaceId}`).emit('space:ended', { spaceId });
            io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
          } else if (space.speakers.has(userId) || space.listeners.has(userId)) {
            space.speakers.delete(userId);
            space.listeners.delete(userId);
            space.handRaised.delete(userId);
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
function broadcastChatMessage(conversationId, message, recipientId) {
  if (!ioInstance) return;
  if (recipientId) {
    ioInstance.to(`user:${recipientId}`).emit('chat:message', {
      conversationId: conversationId.toString(),
      message,
    });
  }
  ioInstance.to(`conv:${conversationId}`).emit('chat:message', {
    conversationId: conversationId.toString(),
    message,
  });
}

module.exports = {
  initSocket,
  getIO,
  broadcastChatMessage,
};
