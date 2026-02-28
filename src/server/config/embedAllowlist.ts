/**
 * Domain Allowlist Configuration
 * 
 * This module defines the trusted embed domains that are permitted to be proxied
 * through the embed proxy middleware. URLs must match one of these domains to be
 * allowed for proxying.
 */

export const ALLOWED_EMBED_DOMAINS: readonly string[] = [
  'pooembed.eu',
  'streamembed.com',
  'embedsport.com',
  'sportembed.net',
  'streamhub.io',
  'liveembed.tv',
  'sportstream.xyz',
] as const;

/**
 * Validates whether a URL's domain is in the allowlist.
 * 
 * @param url - The URL to validate
 * @returns true if the domain is allowed, false otherwise
 * 
 * @example
 * ```typescript
 * isAllowedDomain('https://pooembed.eu/embed-noads/premierleague/2026-02-27/wol-avl')
 * // Returns: true
 * 
 * isAllowedDomain('https://malicious-site.com/embed')
 * // Returns: false
 * ```
 */
export function isAllowedDomain(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check if hostname exactly matches an allowed domain
    if (ALLOWED_EMBED_DOMAINS.includes(hostname)) {
      return true;
    }
    
    // Check if hostname is a subdomain of an allowed domain
    for (const allowedDomain of ALLOWED_EMBED_DOMAINS) {
      if (hostname === allowedDomain || hostname.endsWith(`.${allowedDomain}`)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

/**
 * Extracts the domain from a URL for logging/debugging purposes.
 * 
 * @param url - The URL to extract domain from
 * @returns The domain or 'invalid-url' if parsing fails
 */
export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return 'invalid-url';
  }
}
