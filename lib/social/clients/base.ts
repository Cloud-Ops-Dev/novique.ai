/**
 * Base utilities for social media API clients
 *
 * Provides shared functionality like rate limiting, retry logic, and error handling.
 */

import type {
  SocialPlatform,
  SocialClient,
  OAuthTokenResponse,
  SocialPostMetrics,
} from '../types';

// =====================================================
// ERROR CLASSES
// =====================================================

/**
 * Base error for social media API operations
 */
export class SocialAPIError extends Error {
  constructor(
    message: string,
    public platform: SocialPlatform,
    public code: string,
    public statusCode?: number,
    public platformError?: unknown
  ) {
    super(message);
    this.name = 'SocialAPIError';
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends SocialAPIError {
  constructor(
    platform: SocialPlatform,
    public resetAt: Date,
    public remaining: number = 0
  ) {
    super(
      `Rate limit exceeded for ${platform}. Resets at ${resetAt.toISOString()}`,
      platform,
      'RATE_LIMIT_EXCEEDED'
    );
    this.name = 'RateLimitError';
  }
}

/**
 * OAuth/authentication error
 */
export class AuthenticationError extends SocialAPIError {
  constructor(platform: SocialPlatform, message: string) {
    super(message, platform, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Token expired error - needs refresh
 */
export class TokenExpiredError extends SocialAPIError {
  constructor(platform: SocialPlatform) {
    super(
      `Access token expired for ${platform}`,
      platform,
      'TOKEN_EXPIRED',
      401
    );
    this.name = 'TokenExpiredError';
  }
}

/**
 * Content policy violation error
 */
export class ContentPolicyError extends SocialAPIError {
  constructor(platform: SocialPlatform, details: string) {
    super(
      `Content policy violation on ${platform}: ${details}`,
      platform,
      'CONTENT_POLICY_VIOLATION',
      403
    );
    this.name = 'ContentPolicyError';
  }
}

// =====================================================
// RETRY UTILITIES
// =====================================================

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  platform: SocialPlatform,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry authentication errors
      if (error instanceof AuthenticationError) {
        throw error;
      }

      // Don't retry content policy errors
      if (error instanceof ContentPolicyError) {
        throw error;
      }

      // Handle rate limits specially
      if (error instanceof RateLimitError) {
        const waitTime = error.resetAt.getTime() - Date.now();
        if (waitTime > 0 && waitTime < opts.maxDelayMs) {
          console.log(
            `[${platform}] Rate limited, waiting ${waitTime}ms until reset`
          );
          await sleep(waitTime);
          continue;
        }
        throw error;
      }

      // Check if we should retry based on status code
      if (error instanceof SocialAPIError && error.statusCode) {
        if (!opts.retryableStatuses.includes(error.statusCode)) {
          throw error;
        }
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= opts.maxRetries) {
        throw error;
      }

      // Calculate backoff and wait
      const delay = calculateBackoff(attempt, opts.baseDelayMs, opts.maxDelayMs);
      console.log(
        `[${platform}] Request failed, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${opts.maxRetries})`
      );
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed with no error');
}

// =====================================================
// HTTP UTILITIES
// =====================================================

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse rate limit headers from response
 */
export function parseRateLimitHeaders(
  response: Response,
  platform: SocialPlatform
): { remaining: number; resetAt: Date } | null {
  let remaining: number | null = null;
  let resetAt: Date | null = null;

  switch (platform) {
    case 'twitter':
      remaining = parseInt(
        response.headers.get('x-rate-limit-remaining') || '',
        10
      );
      const resetTimestamp = response.headers.get('x-rate-limit-reset');
      if (resetTimestamp) {
        resetAt = new Date(parseInt(resetTimestamp, 10) * 1000);
      }
      break;

    case 'linkedin':
      // LinkedIn uses different headers
      remaining = parseInt(
        response.headers.get('x-li-ratelimit-remaining') || '',
        10
      );
      const resetMs = response.headers.get('x-li-ratelimit-reset');
      if (resetMs) {
        resetAt = new Date(parseInt(resetMs, 10));
      }
      break;

    case 'instagram':
      // Instagram/Meta uses standard headers
      remaining = parseInt(
        response.headers.get('x-app-usage-remaining') || '',
        10
      );
      // Instagram doesn't provide exact reset time, estimate 1 hour
      if (remaining !== null && remaining <= 0) {
        resetAt = new Date(Date.now() + 3600000);
      }
      break;
  }

  if (remaining !== null && !isNaN(remaining) && resetAt) {
    return { remaining, resetAt };
  }

  return null;
}

/**
 * Handle API response and throw appropriate errors
 */
export async function handleAPIResponse<T>(
  response: Response,
  platform: SocialPlatform
): Promise<T> {
  // Check rate limits
  const rateLimit = parseRateLimitHeaders(response, platform);
  if (response.status === 429 || (rateLimit && rateLimit.remaining <= 0)) {
    throw new RateLimitError(
      platform,
      rateLimit?.resetAt || new Date(Date.now() + 900000), // Default 15 min
      rateLimit?.remaining || 0
    );
  }

  // Parse response body
  let body: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  // Handle success
  if (response.ok) {
    return body as T;
  }

  // Handle errors
  const errorMessage =
    typeof body === 'object' && body !== null
      ? JSON.stringify(body)
      : String(body);

  switch (response.status) {
    case 401:
      throw new AuthenticationError(platform, `Unauthorized: ${errorMessage}`);
    case 403:
      // Check if it's a content policy issue
      if (
        errorMessage.toLowerCase().includes('policy') ||
        errorMessage.toLowerCase().includes('violation')
      ) {
        throw new ContentPolicyError(platform, errorMessage);
      }
      throw new SocialAPIError(
        `Forbidden: ${errorMessage}`,
        platform,
        'FORBIDDEN',
        403,
        body
      );
    case 404:
      throw new SocialAPIError(
        `Not found: ${errorMessage}`,
        platform,
        'NOT_FOUND',
        404,
        body
      );
    default:
      throw new SocialAPIError(
        `API error (${response.status}): ${errorMessage}`,
        platform,
        'API_ERROR',
        response.status,
        body
      );
  }
}

// =====================================================
// OAUTH UTILITIES
// =====================================================

/**
 * Generate a random state string for OAuth
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  // Generate code verifier (43-128 characters)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  // Generate code challenge (S256)
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const codeChallenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { codeVerifier, codeChallenge };
}

/**
 * Build URL with query parameters
 */
export function buildURL(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Parse URL-encoded form data
 */
export function parseFormData(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  const params = new URLSearchParams(data);
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// =====================================================
// TOKEN MANAGEMENT
// =====================================================

/**
 * Check if a token is expired or about to expire
 */
export function isTokenExpired(
  expiresAt: string | Date | null,
  bufferSeconds: number = 300
): boolean {
  if (!expiresAt) return false;

  const expirationTime =
    expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const bufferTime = bufferSeconds * 1000;

  return Date.now() >= expirationTime.getTime() - bufferTime;
}

/**
 * Calculate token expiration date from expires_in seconds
 */
export function calculateTokenExpiration(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000);
}

// =====================================================
// CONTENT UTILITIES
// =====================================================

/**
 * Truncate text to a maximum length, preserving word boundaries
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;

  const truncateAt = maxLength - suffix.length;
  const truncated = text.substring(0, truncateAt);

  // Try to break at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > truncateAt * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u0080-\uFFFF]+/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Count characters (accounting for URLs as shortened)
 */
export function countCharacters(
  text: string,
  urlLength: number = 23
): number {
  // Twitter counts URLs as 23 characters regardless of actual length
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  const textWithoutUrls = text.replace(urlRegex, '');

  return textWithoutUrls.length + urls.length * urlLength;
}

// =====================================================
// EXPORTS
// =====================================================

export type { SocialClient, OAuthTokenResponse, SocialPostMetrics };
