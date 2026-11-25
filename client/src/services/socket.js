import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentToken = null;
    this.listeners = new Map();
  }

  getSocketServerUrl() {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('pulse518_api_url');
      if (custom) {
        if (custom.includes('clearfeed518.up.railway.app')) {
          localStorage.removeItem('pulse518_api_url');
        } else {
          return custom.replace(/\/api\/?$/, '');
        }
      }
    }
    const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    if (rawUrl && !rawUrl.includes('clearfeed518.up.railway.app')) {
      return rawUrl.replace(/\/api\/?$/, '');
    }
    if (typeof window !== 'undefined') {
      // When accessed on Vite dev server (port 5173), proxy /socket.io through same origin!
      // This guarantees seamless connectivity on mobile browsers without cross-port firewall issues
      if (window.location.port === '5173') {
        return window.location.origin;
      }

      const hostname = window.location.hostname;
      // Local development hosts (localhost, loopback, or local Wi-Fi / LAN IP)
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname.endsWith('.local')
      ) {
        return `http://${hostname}:5180`;
      }
      return 'https://clearfeed-api.onrender.com';
    }
    return 'http://localhost:5180';
  }

  identify(token = null) {
    const t = token || this.currentToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('pulse518_token') : null);
    this.currentToken = t;
    if (this.socket && this.socket.connected && t) {
      this.socket.emit('auth:identify', { token: t });
    }
  }

  connect(explicitToken = null) {
    const token = explicitToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('pulse518_token') : null);

    // If socket exists, has matching token, and is connected or currently establishing connection, reuse it!
    if (this.socket && this.currentToken === token && (this.socket.connected || !this.socket.disconnected)) {
      return this.socket;
    }

    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch {}
      this.socket = null;
      this.isConnected = false;
    }

    this.currentToken = token;
    const serverUrl = this.getSocketServerUrl();

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 25,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    // Re-bind all persistent listeners to the new socket instance
    for (const [event, callbacks] of this.listeners.entries()) {
      for (const cb of callbacks) {
        this.socket.on(event, cb);
      }
    }

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ Socket connected to:', serverUrl);
      if (this.currentToken) {
        this.socket.emit('auth:identify', { token: this.currentToken });
      }
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

  reconnect(token = null) {
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

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.connect();
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
    if (!this.socket || !this.socket.connected) {
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

  cancelCall({ callId, targetUserId, reason = 'cancelled' }) {
    this.emit('call:cancel', { callId, targetUserId, reason });
  }

  rejectCall({ callId, targetUserId, reason = 'declined' }) {
    this.emit('call:reject', { callId, targetUserId, reason });
  }

  endCall({ callId, targetUserId }) {
    this.emit('call:end', { callId, targetUserId });
  }

  sendSignal({ callId, targetUserId, fromUserId, signal }) {
    this.emit('call:signal', { callId, targetUserId, fromUserId, signal });
  }

  // Audio Spaces
  joinSpace({ spaceId, user }) {
    this.emit('spaces:join', { spaceId, user });
    this.emit('space:join', { spaceId, user });
  }

  leaveSpace({ spaceId }) {
    this.emit('spaces:leave', { spaceId });
    this.emit('space:leave', { spaceId });
  }

  requestSpeak({ spaceId }) {
    this.emit('spaces:request_speak', { spaceId });
  }

  cancelRequest({ spaceId }) {
    this.emit('spaces:cancel_request', { spaceId });
  }

  approveSpeak({ spaceId, targetUserId }) {
    this.emit('spaces:approve_speak', { spaceId, targetUserId });
  }

  rejectSpeak({ spaceId, targetUserId }) {
    this.emit('spaces:reject_speak', { spaceId, targetUserId });
  }

  forceMute({ spaceId, targetUserId }) {
    this.emit('spaces:force_mute', { spaceId, targetUserId });
  }

  demoteToListener({ spaceId, targetUserId }) {
    this.emit('spaces:demote_to_listener', { spaceId, targetUserId });
  }

  promoteCoHost({ spaceId, targetUserId }) {
    this.emit('spaces:promote_cohost', { spaceId, targetUserId });
  }

  transferHost({ spaceId, newHostId }) {
    this.emit('spaces:transfer_host', { spaceId, newHostId });
  }

  kickParticipant({ spaceId, targetUserId }) {
    this.emit('spaces:kick_participant', { spaceId, targetUserId });
  }

  raiseHand({ spaceId, raised }) {
    this.emit('spaces:request_speak', { spaceId, raised });
    this.emit('space:raise_hand', { spaceId, raised });
  }

  setRole({ spaceId, targetUserId, role }) {
    this.emit('space:set_role', { spaceId, targetUserId, role });
  }

  toggleSpaceMute({ spaceId, isMuted }) {
    this.emit('spaces:toggle_mute', { spaceId, isMuted });
    this.emit('space:toggle_mute', { spaceId, isMuted });
  }

  sendSpeakingState({ spaceId, isSpeaking }) {
    this.emit('spaces:speaking_state', { spaceId, isSpeaking });
    this.emit('space:speaking_state', { spaceId, isSpeaking });
  }

  sendReaction({ spaceId, emoji, username }) {
    this.emit('spaces:reaction', { spaceId, emoji, username });
    this.emit('space:reaction', { spaceId, emoji, username });
  }

  sendSpaceSignal({ spaceId, targetUserId, signal }) {
    this.emit('spaces:signal', { spaceId, targetUserId, signal });
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
