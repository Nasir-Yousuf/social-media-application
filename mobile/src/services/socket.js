import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl } from '../api/client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  async getSocketServerUrl() {
    try {
      const apiUrl = await getBaseUrl();
      // Remove trailing /api or /api/
      return apiUrl.replace(/\/api\/?$/, '');
    } catch {
      return 'http://192.168.0.246:5180';
    }
  }

  async connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = await this.getSocketServerUrl();
    const token = await AsyncStorage.getItem('token');

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ Socket.IO connected successfully to:', serverUrl);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.log('🔌 Socket.IO connection status:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listener with unsubscription callback
  on(event, callback) {
    if (!this.socket) {
      this.connect().then((sock) => sock && sock.on(event, callback));
    } else {
      this.socket.on(event, callback);
    }

    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  off(event, callback) {
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
    this.emit('chat:join', { conversationId });
  }

  leaveConversation(conversationId) {
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
