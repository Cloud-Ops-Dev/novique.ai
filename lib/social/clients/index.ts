/**
 * Social Media API Clients - Index
 *
 * Exports all platform clients and shared utilities.
 */

// Export types
export type { SocialClient, OAuthTokenResponse, SocialPostMetrics } from './base';

// Export error classes
export {
  SocialAPIError,
  RateLimitError,
  AuthenticationError,
  TokenExpiredError,
  ContentPolicyError,
} from './base';

// Export utilities
export {
  withRetry,
  sleep,
  calculateBackoff,
  fetchWithTimeout,
  handleAPIResponse,
  parseRateLimitHeaders,
  generateOAuthState,
  generatePKCE,
  buildURL,
  isTokenExpired,
  calculateTokenExpiration,
  truncateText,
  extractHashtags,
  countCharacters,
} from './base';

// Export platform clients
export { twitterClient, createThread, splitIntoTweets } from './twitter';
export {
  linkedinClient,
  getAdministeredOrganizations,
  postToOrganization,
} from './linkedin';
export {
  instagramClient,
  getInstagramAccounts,
  getPageAccessToken,
} from './instagram';

// Import clients for factory
import { twitterClient } from './twitter';
import { linkedinClient } from './linkedin';
import { instagramClient } from './instagram';
import type { SocialPlatform, SocialClient } from '../types';

/**
 * Get the appropriate client for a platform
 */
export function getClient(platform: SocialPlatform): SocialClient {
  switch (platform) {
    case 'twitter':
      return twitterClient;
    case 'linkedin':
      return linkedinClient;
    case 'instagram':
      return instagramClient;
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Get all available clients
 */
export function getAllClients(): Record<SocialPlatform, SocialClient> {
  return {
    twitter: twitterClient,
    linkedin: linkedinClient,
    instagram: instagramClient,
  };
}
