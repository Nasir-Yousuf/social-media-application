import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from '../api/client';

class DesktopSocketService {
  private socket: Socket | null = null;
  public isConnected = false;
  private currentToken: string | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  public getRawSocket(): Socket | null {
    return this.socket;
  }

  public getSocketServerUrl(): string {
    const apiUrl = getBaseUrl();
    return apiUrl.replace(/\/api\/?$/, '');
  }

  public connect(explicitToken?: string | null): Socket {
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
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    for (const [event, callbacks] of this.listeners.entries()) {
      for (const cb of callbacks) {
        this.socket.on(event, cb);
      }
    }

    this.socket.on('connect', () => {
      this.isConnected = true;
      if (this.currentToken) {
        this.socket?.emit('auth:identify', { token: this.currentToken });
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch {}
      this.socket = null;
      this.isConnected = false;
      this.currentToken = null;
    }
  }

  public on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.connect();
    }

    return () => {
      this.off(event, callback);
    };
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  public emit(event: string, data?: any, callback?: (...args: any[]) => void): void {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    if (this.socket) {
      this.socket.emit(event, data, callback);
    }
  }

  // 1-on-1 Audio Calls
  public initiateCall({ callId, targetUserId, callerInfo, callType = 'audio' }: {
    callId: string;
    targetUserId: string;
    callerInfo: any;
    callType?: string;
  }): void {
    this.emit('call:initiate', { callId, targetUserId, callerInfo, callType });
  }

  public acceptCall({ callId, targetUserId }: { callId: string; targetUserId?: string }): void {
    this.emit('call:accept', { callId, targetUserId });
  }

  public cancelCall({ callId, targetUserId, reason = 'cancelled' }: {
    callId: string;
    targetUserId?: string;
    reason?: string;
  }): void {
    this.emit('call:cancel', { callId, targetUserId, reason });
  }

  public rejectCall({ callId, targetUserId, reason = 'declined' }: {
    callId: string;
    targetUserId?: string;
    reason?: string;
  }): void {
    this.emit('call:reject', { callId, targetUserId, reason });
  }

  public endCall({ callId, targetUserId }: { callId: string; targetUserId?: string }): void {
    this.emit('call:end', { callId, targetUserId });
  }

  public sendSignal({ callId, targetUserId, fromUserId, signal }: {
    callId: string;
    targetUserId?: string;
    fromUserId?: string;
    signal: any;
  }): void {
    this.emit('call:signal', { callId, targetUserId, fromUserId, signal });
  }

  // Group Voice Calls
  public inviteToGroupCall(data: { roomId: string; roomName?: string; targetUserIds: string[]; caller?: any }): void {
    this.emit('group-call:invite', data);
  }

  public joinGroupCall(data: { roomId: string; user?: any }): void {
    this.emit('group-call:join', data);
  }

  public sendGroupCallSignal(data: { roomId: string; targetUserId: string; signal: any }): void {
    this.emit('group-call:signal', data);
  }

  public toggleGroupCallMute(data: { roomId: string; isMuted: boolean }): void {
    this.emit('group-call:toggle_mute', data);
  }

  public sendGroupCallSpeaking(data: { roomId: string; isSpeaking: boolean }): void {
    this.emit('group-call:speaking', data);
  }

  public leaveGroupCall(data: { roomId: string }): void {
    this.emit('group-call:leave', data);
  }

  // Spaces Live Audio Rooms
  public joinSpace(data: { spaceId: string; user?: any }): void {
    this.emit('spaces:join', data);
  }

  public leaveSpace(data: { spaceId: string }): void {
    this.emit('spaces:leave', data);
  }

  public raiseHand(data: { spaceId: string; raised: boolean }): void {
    this.emit('spaces:request_speak', data);
  }

  public setRole(data: { spaceId: string; targetUserId: string; role: string }): void {
    this.emit('space:set_role', data);
  }

  public toggleSpaceMute(data: { spaceId: string; isMuted: boolean }): void {
    this.emit('spaces:toggle_mute', data);
  }

  public sendSpeakingState(data: { spaceId: string; isSpeaking: boolean }): void {
    this.emit('spaces:speaking_state', data);
  }

  public sendReaction(data: { spaceId: string; emoji: string; username?: string }): void {
    this.emit('spaces:reaction', data);
  }

  public sendSpaceSignal(data: { spaceId: string; targetUserId: string; signal: any }): void {
    this.emit('spaces:signal', data);
  }
}

export const socketService = new DesktopSocketService();
export default socketService;
