import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl, LOCAL_DEV_ORIGIN } from '../api/client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.connectPromise = null;
    this.currentToken = null;
    this.currentServerUrl = null;
    this.listeners = new Map();
  }

  async getSocketServerUrl() {
    try {
      const apiUrl = await getBaseUrl();
      if (apiUrl) {
        return apiUrl.replace(/\/api\/?$/, '');
      }
    } catch {}
    if (__DEV__) {
      return LOCAL_DEV_ORIGIN;
    }
    return 'https://clearfeed518.up.railway.app';
  }

  async connect(explicitToken = null) {
    const token = explicitToken !== null ? explicitToken : (await AsyncStorage.getItem('token'));
    const serverUrl = await this.getSocketServerUrl();

    // If already connected with the exact same token and to the same server URL, reuse current socket
    if (this.socket && this.isConnected && this.currentToken === token && this.currentServerUrl === serverUrl) {
      return this.socket;
    }

    // If currently in the process of connecting with the same parameters, return the ongoing promise
    if (this.isConnecting && this.currentToken === token && this.currentServerUrl === serverUrl && this.connectPromise) {
      return this.connectPromise;
    }

    this.isConnecting = true;
    this.currentToken = token;
    this.currentServerUrl = serverUrl;

    this.connectPromise = (async () => {
      if (this.socket) {
        try {
          this.socket.disconnect();
        } catch {}
        this.socket = null;
        this.isConnected = false;
      }

      const socket = io(serverUrl, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 30,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket = socket;

      // Re-bind all persistent listeners to the new socket instance
      for (const [event, callbacks] of this.listeners.entries()) {
        for (const cb of callbacks) {
          socket.on(event, cb);
        }
      }

      socket.on('connect', () => {
        this.isConnected = true;
        this.isConnecting = false;
        console.log('⚡ Socket.IO connected to:', serverUrl, `(id: ${socket.id})`);
        if (this.currentToken) {
          socket.emit('auth:identify', { token: this.currentToken });
        }
        if (this.currentConversationId) {
          socket.emit('chat:join', { conversationId: this.currentConversationId });
        }
      });

      socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this.isConnecting = false;
        console.log('🔌 Socket.IO disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        this.isConnecting = false;
        console.log('🔌 Socket.IO connection notice:', error.message);
      });

      return socket;
    })();

    return this.connectPromise;
  }

  async reconnect(token = null) {
    this.disconnect();
    return this.connect(token);
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch {}
      this.socket = null;
      this.isConnected = false;
      this.currentToken = null;
    }
  }

  // Event listener with unsubscription callback and persistent registration
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.connect().catch(() => {});
    }

    return () => {
      this.off(event, callback);
    };
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data, callback) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data, callback);
    } else {
      this.connect().then((sock) => {
        if (sock && sock.connected) {
          sock.emit(event, data, callback);
        }
      });
    }
  }

  // ------------------------------------------
  // Chat Room & Messaging Helpers
  // ------------------------------------------
  joinConversation(conversationId) {
    this.currentConversationId = conversationId;
    this.emit('chat:join', { conversationId });
  }

  leaveConversation(conversationId) {
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
    this.emit('chat:leave', { conversationId });
  }

  sendTypingStatus(conversationId, recipientId, isTyping) {
    this.emit('chat:typing', { conversationId, recipientId, isTyping });
  }

  sendChatMessage(data, callback) {
    this.emit('chat:send_message', data, callback);
  }

  markMessagesAsRead(conversationId, messageIds) {
    this.emit('chat:mark_read', { conversationId, messageIds });
  }

  // ------------------------------------------
  // 1-on-1 Audio Call Signaling Helpers
  // ------------------------------------------
  initiateCall({ callId, targetUserId, callerInfo, callType = 'audio' }) {
    this.emit('call:initiate', { callId, targetUserId, callerInfo, callType });
  }

  acceptCall({ callId, targetUserId }) {
    this.emit('call:accept', { callId, targetUserId });
  }

  rejectCall({ callId, targetUserId, reason = 'declined' }) {
    this.emit('call:reject', { callId, targetUserId, reason });
  }

  endCall({ callId, targetUserId }) {
    this.emit('call:end', { callId, targetUserId });
  }

  sendCallSignal({ callId, targetUserId, signal }) {
    this.emit('call:signal', { callId, targetUserId, signal });
  }

  // ------------------------------------------
  // Group Call Signaling Helpers
  // ------------------------------------------
  joinGroupCall({ roomId, user }) {
    this.emit('group-call:join', { roomId, user });
  }

  sendGroupCallSignal({ roomId, targetUserId, signal }) {
    this.emit('group-call:signal', { roomId, targetUserId, signal });
  }

  toggleGroupCallMute({ roomId, isMuted }) {
    this.emit('group-call:toggle_mute', { roomId, isMuted });
  }

  leaveGroupCall({ roomId }) {
    this.emit('group-call:leave', { roomId });
  }

  // ------------------------------------------
  // Twitter Spaces Signaling Helpers
  // ------------------------------------------
  joinSpace({ spaceId, user }) {
    this.emit('space:join', { spaceId, user });
  }

  leaveSpace({ spaceId }) {
    this.emit('space:leave', { spaceId });
  }

  raiseHand({ spaceId, raised }) {
    this.emit('space:raise_hand', { spaceId, raised });
  }

  setSpaceRole({ spaceId, targetUserId, role }) {
    this.emit('space:set_role', { spaceId, targetUserId, role });
  }

  toggleSpaceMute({ spaceId, isMuted }) {
    this.emit('space:toggle_mute', { spaceId, isMuted });
  }

  sendSpaceReaction({ spaceId, emoji, username }) {
    this.emit('space:reaction', { spaceId, emoji, username });
  }
}

export const socketService = new SocketService();
export default socketService;
