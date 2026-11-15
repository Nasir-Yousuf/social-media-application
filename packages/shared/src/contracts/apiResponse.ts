/**
 * Standardized API Response Contracts for Clearfeed
 * Shared across Web, Android, and Windows Desktop clients.
 */

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  total?: number;
  page?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiErrorPayload;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
  timestamp: string;
}

export interface CursorPaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: CursorPaginationMeta;
  message?: string;
  timestamp: string;
}

export function createCursorPaginatedResponse<T>(
  data: T[],
  pagination: CursorPaginationMeta,
  message?: string
): CursorPaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    ...(message ? { message } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    ...(message ? { message } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      ...(details !== undefined ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };
}
