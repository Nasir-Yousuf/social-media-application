import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  getSocketServerUrl() {
    const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    if (rawUrl) {
      return rawUrl.replace(/\/api\/?$/, '');
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://clearfeed518.up.railway.app';
    }
    return 'http://localhost:5180';
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = this.getSocketServerUrl();
    const token = localStorage.getItem('pulse518_token');

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 25,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ Socket connected to:', serverUrl);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.log('🔌 Socket connection notice:', error.message);
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

  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    if (this.socket) {
      this.socket.on(event, callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  emit(event, data, callback) {
    if (!this.socket) {
      this.connect();
    }
    if (this.socket) {
      this.socket.emit(event, data, callback);
    }
  }

  // 1-on-1 Audio Calls
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

  sendSignal({ callId, targetUserId, signal }) {
    this.emit('call:signal', { callId, targetUserId, signal });
  }

  // Audio Spaces
  joinSpace({ spaceId, user }) {
    this.emit('space:join', { spaceId, user });
  }

  leaveSpace({ spaceId }) {
    this.emit('space:leave', { spaceId });
  }

  raiseHand({ spaceId, raised }) {
    this.emit('space:raise_hand', { spaceId, raised });
  }

  setRole({ spaceId, targetUserId, role }) {
    this.emit('space:set_role', { spaceId, targetUserId, role });
  }

  toggleSpaceMute({ spaceId, isMuted }) {
    this.emit('space:toggle_mute', { spaceId, isMuted });
  }

  sendSpeakingState({ spaceId, isSpeaking }) {
    this.emit('space:speaking_state', { spaceId, isSpeaking });
  }

  sendReaction({ spaceId, emoji, username }) {
    this.emit('space:reaction', { spaceId, emoji, username });
  }

  sendSpaceSignal({ spaceId, targetUserId, signal }) {
    this.emit('space:signal', { spaceId, targetUserId, signal });
  }

  // Group Voice Calls
  inviteToGroupCall({ roomId, roomName, targetUserIds, caller }) {
    this.emit('group-call:invite', { roomId, roomName, targetUserIds, caller });
  }

  joinGroupCall({ roomId, user }) {
    this.emit('group-call:join', { roomId, user });
  }

  sendGroupCallSignal({ roomId, targetUserId, signal }) {
    this.emit('group-call:signal', { roomId, targetUserId, signal });
  }

  toggleGroupCallMute({ roomId, isMuted }) {
    this.emit('group-call:toggle_mute', { roomId, isMuted });
  }

  sendGroupCallSpeaking({ roomId, isSpeaking }) {
    this.emit('group-call:speaking', { roomId, isSpeaking });
  }

  leaveGroupCall({ roomId }) {
    this.emit('group-call:leave', { roomId });
  }
}

export const socketService = new SocketService();
export default socketService;
