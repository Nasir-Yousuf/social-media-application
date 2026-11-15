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

    if (this.socket && this.isConnected && this.currentToken === token) {
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

  // Spaces Live Audio Rooms
  public joinSpace(data: { spaceId: string; user?: any }): void {
    this.emit('spaces:join', data);
    this.emit('space:join', data);
  }

  public leaveSpace(data: { spaceId: string }): void {
    this.emit('spaces:leave', data);
    this.emit('space:leave', data);
  }

  public raiseHand(data: { spaceId: string; raised: boolean }): void {
    this.emit('spaces:request_speak', data);
    this.emit('space:raise_hand', data);
  }

  public setRole(data: { spaceId: string; targetUserId: string; role: string }): void {
    this.emit('space:set_role', data);
  }

  public toggleSpaceMute(data: { spaceId: string; isMuted: boolean }): void {
    this.emit('spaces:toggle_mute', data);
    this.emit('space:toggle_mute', data);
  }

  public sendSpeakingState(data: { spaceId: string; isSpeaking: boolean }): void {
    this.emit('spaces:speaking_state', data);
    this.emit('space:speaking_state', data);
  }

  public sendReaction(data: { spaceId: string; emoji: string; username?: string }): void {
    this.emit('spaces:reaction', data);
    this.emit('space:reaction', data);
  }

  public sendSpaceSignal(data: { spaceId: string; targetUserId: string; signal: any }): void {
    this.emit('spaces:signal', data);
    this.emit('space:signal', data);
  }
}

export const socketService = new DesktopSocketService();
export default socketService;
