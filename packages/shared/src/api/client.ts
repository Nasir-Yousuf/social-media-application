import type { ApiResponse, CursorPaginatedResponse } from '../contracts/apiResponse.js';
import type { ApiClientConfig, RequestOptions, HttpMethod, TokenStorageAdapter } from './types.js';
import { MemoryStorageAdapter } from './adapters.js';

interface QueuedRequest {
  resolve: (token: string | null) => void;
  reject: (err: Error) => void;
}

export class ClearfeedApiClient {
  private baseUrl: string;
  private storageAdapter: TokenStorageAdapter;
  private timeoutMs: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private defaultHeaders: Record<string, string>;
  private onTokenExpired?: () => Promise<string | null>;
  private onAuthFailure?: () => void;

  private isRefreshing = false;
  private refreshQueue: QueuedRequest[] = [];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.storageAdapter = config.storageAdapter || new MemoryStorageAdapter();
    this.timeoutMs = config.timeoutMs || 15000;
    this.maxRetries = config.maxRetries !== undefined ? config.maxRetries : 3;
    this.retryDelayMs = config.retryDelayMs || 500;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(config.headers || {}),
    };
    this.onTokenExpired = config.onTokenExpired;
    this.onAuthFailure = config.onAuthFailure;
  }

  /**
   * Updates base URL dynamically (e.g. switching environments or custom domain)
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Helper to retrieve current bearer token
   */
  public async getToken(): Promise<string | null> {
    return this.storageAdapter.getToken();
  }

  /**
   * Helper to set auth tokens
   */
  public async setTokens(token: string, refreshToken?: string): Promise<void> {
    await this.storageAdapter.setToken(token);
    if (refreshToken && this.storageAdapter.setRefreshToken) {
      await this.storageAdapter.setRefreshToken(refreshToken);
    }
  }

  /**
   * Helper to wipe stored tokens
   */
  public async clearTokens(): Promise<void> {
    await this.storageAdapter.clearTokens();
  }

  /**
   * Build complete query URL with search params
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  /**
   * Token refresh queue management
   */
  private async handleTokenRefresh(): Promise<string | null> {
    if (!this.onTokenExpired) {
      return null;
    }

    if (this.isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.onTokenExpired();
      if (newToken) {
        await this.storageAdapter.setToken(newToken);
      }
      this.refreshQueue.forEach((q) => q.resolve(newToken));
      return newToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Token refresh failed');
      this.refreshQueue.forEach((q) => q.reject(error));
      await this.clearTokens();
      if (this.onAuthFailure) {
        this.onAuthFailure();
      }
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshQueue = [];
    }
  }

  /**
   * Sleep helper with jitter for exponential backoff
   */
  private delay(ms: number): Promise<void> {
    const jitter = Math.random() * 100;
    return new Promise((resolve) => setTimeout(resolve, ms + jitter));
  }

  /**
   * Core HTTP request execution
   */
  private async executeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      params,
      headers = {},
      skipAuth = false,
      skipRetry = false,
      timeoutMs = this.timeoutMs,
      signal,
    } = options;

    const url = this.buildUrl(endpoint, params);
    const isGet = method === 'GET';
    const canRetry = isGet && !skipRetry && this.maxRetries > 0;
    const maxAttempts = canRetry ? this.maxRetries + 1 : 1;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this.delay(backoff);
        }

        // Setup abort controller for request timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

        let combinedSignal = abortController.signal;
        if (signal) {
          signal.addEventListener('abort', () => abortController.abort());
        }

        // Inject authorization header if available
        const requestHeaders: Record<string, string> = {
          ...this.defaultHeaders,
          ...headers,
        };

        if (!skipAuth) {
          const token = await this.getToken();
          if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
          }
        }

        const fetchOptions: RequestInit = {
          method,
          headers: requestHeaders,
          signal: combinedSignal,
        };

        if (body !== undefined && method !== 'GET') {
          fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        let response: Response;
        try {
          response = await fetch(url, fetchOptions);
        } finally {
          clearTimeout(timeoutId);
        }

        // Handle 401 Unauthorized for authenticated requests
        if (response.status === 401 && !skipAuth && this.onTokenExpired) {
          const refreshedToken = await this.handleTokenRefresh();
          if (refreshedToken) {
            // Retry the single request once with the refreshed token
            requestHeaders['Authorization'] = `Bearer ${refreshedToken}`;
            const retryRes = await fetch(url, { ...fetchOptions, headers: requestHeaders });
            return await this.parseResponse<T>(retryRes);
          }
        }

        // Retry on server errors (500, 502, 503, 504) for idempotent GET requests
        if (canRetry && (response.status >= 500 && response.status <= 504) && attempt < maxAttempts - 1) {
          continue;
        }

        return await this.parseResponse<T>(response);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Retry on network errors for GET requests
        if (canRetry && attempt < maxAttempts - 1) {
          continue;
        }
        break;
      }
    }

    throw lastError || new Error(`Request to ${endpoint} failed after ${maxAttempts} attempts`);
  }

  /**
   * Parses JSON responses and standardizes errors
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    let payload: any;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch (_) {
        payload = null;
      }
    } else {
      payload = await response.text();
    }

    if (!response.ok) {
      const status = response.status;
      const errorMsg =
        payload?.error?.message ||
        payload?.message ||
        `HTTP Error ${status}: ${response.statusText}`;

      const err: any = new Error(errorMsg);
      err.status = status;
      err.code = payload?.error?.code || payload?.code || 'API_ERROR';
      err.details = payload?.error?.details || payload?.details || null;
      err.payload = payload;
      throw err;
    }

    return payload as T;
  }

  // --- Public HTTP Methods ---

  public async get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<ApiResponse<T>>('GET', endpoint, undefined, options);
  }

  public async getPaginated<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<CursorPaginatedResponse<T>> {
    return this.executeRequest<CursorPaginatedResponse<T>>('GET', endpoint, undefined, options);
  }

  public async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<ApiResponse<T>>('POST', endpoint, body, options);
  }

  public async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<ApiResponse<T>>('PUT', endpoint, body, options);
  }

  public async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<ApiResponse<T>>('PATCH', endpoint, body, options);
  }

  public async delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<ApiResponse<T>>('DELETE', endpoint, undefined, options);
  }
}
