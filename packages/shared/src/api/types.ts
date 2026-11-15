import type { ApiResponse, CursorPaginatedResponse } from '../contracts/apiResponse.js';

/**
 * Pluggable Token Storage Adapter interface
 * Supports Web (localStorage/sessionStorage), Android (SecureStore/AsyncStorage), and Windows (Tauri Credential Vault).
 */
export interface TokenStorageAdapter {
  getToken(): Promise<string | null> | string | null;
  setToken(token: string): Promise<void> | void;
  getRefreshToken?(): Promise<string | null> | string | null;
  setRefreshToken?(refreshToken: string): Promise<void> | void;
  clearTokens(): Promise<void> | void;
}

/**
 * Options for configuring ClearfeedApiClient
 */
export interface ApiClientConfig {
  baseUrl: string;
  storageAdapter?: TokenStorageAdapter;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  headers?: Record<string, string>;
  onTokenExpired?: () => Promise<string | null>;
  onAuthFailure?: () => void;
}

/**
 * Request options passed to API calls
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  skipRetry?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
