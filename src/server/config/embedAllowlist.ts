/**
 * Dynamic URL Validation Configuration
 *
 * This module provides dynamic rules-based validation for embed URLs instead of
 * a static domain allowlist. URLs are validated against security rules to prevent
 * access to internal networks, malicious domains, and unsafe protocols.
 */

/**
 * Blocked patterns for additional security filtering
 * These patterns can be extended as needed
 */
export const BLOCKED_PATTERNS: RegExp[] = [
  // Add additional patterns here for future extensibility
];

/**
 * In-memory rate limit tracker for per-domain request limiting
 * Key: hostname, Value: { count: number, resetTime: number }
 */
const domainRateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Maximum requests allowed per unique hostname per 60 seconds
 */
const DOMAIN_RATE_LIMIT = 10;
const DOMAIN_RATE_WINDOW_MS = 60 * 1000; // 60 seconds

/**
 * Result type for URL validation
 */
export type UrlValidationResult =
  | { allowed: true }
  | { allowed: false; reason: UrlRejectionReason; message: string };

/**
 * Reasons for URL rejection
 */
export type UrlRejectionReason =
  | 'MALFORMED_URL'       // URL constructor throws
  | 'INVALID_PROTOCOL'    // not http/https
  | 'PRIVATE_NETWORK'     // internal IP range / localhost
  | 'RAW_IP_ADDRESS'      // bare IPv4 or IPv6 hostname
  | 'MALICIOUS_TLD'        // .onion or single-label hostname
  | 'BLOCKED_PATTERN';     // matches BLOCKED_PATTERNS regex list

/**
 * Checks if a hostname is a private/internal network address
 *
 * @param hostname - The hostname to check
 * @returns true if the hostname is a private/internal network address
 */
function isPrivateNetwork(hostname: string): boolean {
  // Check for localhost variants
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }

  // Check for 127.x.x.x (loopback)
  if (/^127\.\d+\.\d+\.\d+$/.test(hostname)) {
    return true;
  }

  // Check for 10.x.x.x (private network)
  if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) {
    return true;
  }

  // Check for 192.168.x.x (private network)
  if (/^192\.168\.\d+\.\d+$/.test(hostname)) {
    return true;
  }

  // Check for 172.16.x.x - 172.31.x.x (private network)
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)) {
    return true;
  }

  // Check for 169.254.x.x (AWS/cloud metadata endpoint)
  if (/^169\.254\.\d+\.\d+$/.test(hostname)) {
    return true;
  }

  // Check for 0.0.0.0
  if (hostname === '0.0.0.0') {
    return true;
  }

  // Check for IPv6 loopback
  if (hostname === '::1') {
    return true;
  }

  return false;
}

/**
 * Checks if a hostname is a raw IP address (IPv4 or IPv6)
 *
 * @param hostname - The hostname to check
 * @returns true if the hostname is a raw IP address
 */
function isRawIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified - catches most common formats)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
}

/**
 * Checks if a hostname is a single-label hostname (no TLD)
 *
 * @param hostname - The hostname to check
 * @returns true if the hostname has no TLD
 */
function isSingleLabelHostname(hostname: string): boolean {
  return !hostname.includes('.');
}

/**
 * Validates a URL against security rules
 *
 * @param url - The URL to validate
 * @returns UrlValidationResult indicating whether the URL is allowed or rejected with reason
 *
 * @example
 * ```typescript
 * isAllowedUrl('https://pooembed.eu/embed-noads/premierleague/2026-02-27/wol-avl')
 * // Returns: { allowed: true }
 *
 * isAllowedUrl('http://localhost:8080/embed')
 * // Returns: { allowed: false, reason: 'PRIVATE_NETWORK', message: 'Access to private networks is not allowed' }
 *
 * isAllowedUrl('ftp://example.com/file')
 * // Returns: { allowed: false, reason: 'INVALID_PROTOCOL', message: 'Only HTTP and HTTPS protocols are allowed' }
 *
 * isAllowedUrl('https://192.168.1.1/embed')
 * // Returns: { allowed: false, reason: 'PRIVATE_NETWORK', message: 'Access to private networks is not allowed' }
 *
 * isAllowedUrl('https://example.onion/embed')
 * // Returns: { allowed: false, reason: 'MALICIOUS_TLD', message: 'Malicious or blocked top-level domain' }
 * ```
 */
export function isAllowedUrl(url: string): UrlValidationResult {
  try {
    // Parse the URL - this will throw if invalid
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Rule 1: Protocol Check - Allow only http: and https:
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        allowed: false,
        reason: 'INVALID_PROTOCOL',
        message: 'Only HTTP and HTTPS protocols are allowed',
      };
    }

    // Optional: Log warning for plain HTTP (not required by spec)
    if (parsedUrl.protocol === 'http:') {
      // console.warn(`[URL Validation] Using plain HTTP for: ${hostname}`);
    }

    // Rule 2: Private/Internal Network Block
    if (isPrivateNetwork(hostname)) {
      return {
        allowed: false,
        reason: 'PRIVATE_NETWORK',
        message: 'Access to private networks is not allowed',
      };
    }

    // Rule 3: Raw IP Block
    if (isRawIpAddress(hostname)) {
      return {
        allowed: false,
        reason: 'RAW_IP_ADDRESS',
        message: 'Raw IP addresses are not allowed',
      };
    }

    // Rule 4: Onion / Malicious TLD Block
    // Reject .onion domains
    if (hostname.endsWith('.onion')) {
      return {
        allowed: false,
        reason: 'MALICIOUS_TLD',
        message: 'Malicious or blocked top-level domain',
      };
    }

    // Reject single-label hostnames (no TLD)
    if (isSingleLabelHostname(hostname)) {
      return {
        allowed: false,
        reason: 'MALICIOUS_TLD',
        message: 'Invalid domain name (missing top-level domain)',
      };
    }

    // Rule 5: Required Patterns
    // Hostname must contain at least one dot (already checked above)
    if (!hostname.includes('.')) {
      return {
        allowed: false,
        reason: 'MALICIOUS_TLD',
        message: 'Invalid domain name (missing top-level domain)',
      };
    }

    // Check against additional blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(url)) {
        return {
          allowed: false,
          reason: 'BLOCKED_PATTERN',
          message: 'URL matches blocked pattern',
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    // Invalid URL format - URL constructor threw
    return {
      allowed: false,
      reason: 'MALFORMED_URL',
      message: 'Invalid URL format',
    };
  }
}

/**
 * Checks if a domain has exceeded its rate limit
 *
 * @param hostname - The hostname to check
 * @returns true if the request is allowed (under limit), false if limit exceeded
 *
 * @example
 * ```typescript
 * // First 10 requests return true
 * checkDomainRateLimit('example.com'); // true
 *
 * // 11th request within 60 seconds returns false
 * checkDomainRateLimit('example.com'); // false
 * ```
 */
export function checkDomainRateLimit(hostname: string): boolean {
  const now = Date.now();
  const normalizedHostname = hostname.toLowerCase();

  const existing = domainRateLimitMap.get(normalizedHostname);

  if (!existing) {
    // First request for this domain
    domainRateLimitMap.set(normalizedHostname, {
      count: 1,
      resetTime: now + DOMAIN_RATE_WINDOW_MS,
    });

    // Schedule cleanup after window expires
    setTimeout(() => {
      domainRateLimitMap.delete(normalizedHostname);
    }, DOMAIN_RATE_WINDOW_MS);

    return true;
  }

  // Check if the time window has expired
  if (now > existing.resetTime) {
    // Window expired, reset counter
    domainRateLimitMap.set(normalizedHostname, {
      count: 1,
      resetTime: now + DOMAIN_RATE_WINDOW_MS,
    });

    // Schedule cleanup after new window expires
    setTimeout(() => {
      domainRateLimitMap.delete(normalizedHostname);
    }, DOMAIN_RATE_WINDOW_MS);

    return true;
  }

  // Check if limit exceeded
  if (existing.count >= DOMAIN_RATE_LIMIT) {
    return false;
  }

  // Increment counter
  existing.count++;
  return true;
}

/**
 * Extracts the domain from a URL for logging/debugging purposes
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
