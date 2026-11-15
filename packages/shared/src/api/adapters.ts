import type { TokenStorageAdapter } from './types.js';

/**
 * In-memory storage adapter
 * Best suited for unit tests, mock environments, or server-side headless scripts.
 */
export class MemoryStorageAdapter implements TokenStorageAdapter {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(initialToken: string | null = null, initialRefreshToken: string | null = null) {
    this.token = initialToken;
    this.refreshToken = initialRefreshToken;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
  }
}

/**
 * Web browser storage adapter (localStorage / sessionStorage)
 * Safely guards against SSR or non-browser runtime environments.
 */
export class WebStorageAdapter implements TokenStorageAdapter {
  private tokenKey: string;
  private refreshKey: string;
  private useSession: boolean;

  constructor(
    tokenKey = 'clearfeed_token',
    refreshKey = 'clearfeed_refresh_token',
    useSession = false
  ) {
    this.tokenKey = tokenKey;
    this.refreshKey = refreshKey;
    this.useSession = useSession;
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      return this.useSession ? window.sessionStorage : window.localStorage;
    } catch (_) {
      return null;
    }
  }

  getToken(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(this.tokenKey);
    } catch (_) {
      return null;
    }
  }

  setToken(token: string): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      storage.setItem(this.tokenKey, token);
    } catch (_) {}
  }

  getRefreshToken(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(this.refreshKey);
    } catch (_) {
      return null;
    }
  }

  setRefreshToken(refreshToken: string): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      storage.setItem(this.refreshKey, refreshToken);
    } catch (_) {}
  }

  clearTokens(): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      storage.removeItem(this.tokenKey);
      storage.removeItem(this.refreshKey);
    } catch (_) {}
  }
}

/**
 * Custom asynchronous adapter
 * Specifically bridges:
 * 1. Android: expo-secure-store (EncryptedSharedPreferences/Keystore) or @react-native-async-storage/async-storage
 * 2. Windows Desktop: Tauri Credential Vault / Store plugin
 */
export interface CustomStorageHandlers {
  getToken: () => Promise<string | null> | string | null;
  setToken: (token: string) => Promise<void> | void;
  getRefreshToken?: () => Promise<string | null> | string | null;
  setRefreshToken?: (refreshToken: string) => Promise<void> | void;
  clearTokens: () => Promise<void> | void;
}

export class CustomStorageAdapter implements TokenStorageAdapter {
  private handlers: CustomStorageHandlers;

  constructor(handlers: CustomStorageHandlers) {
    this.handlers = handlers;
  }

  async getToken(): Promise<string | null> {
    return this.handlers.getToken();
  }

  async setToken(token: string): Promise<void> {
    await this.handlers.setToken(token);
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.handlers.getRefreshToken) {
      return this.handlers.getRefreshToken();
    }
    return null;
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    if (this.handlers.setRefreshToken) {
      await this.handlers.setRefreshToken(refreshToken);
    }
  }

  async clearTokens(): Promise<void> {
    await this.handlers.clearTokens();
  }
}
