/**
 * Embed Proxy Router
 * 
 * This module provides an Express router that proxies third-party sports stream embeds,
 * sanitizes the HTML to remove malicious elements, and serves the cleaned content.
 * 
 * Features:
 * - Domain allowlist validation
 * - Rate limiting (30 requests per minute per IP)
 * - In-memory caching (30 seconds TTL)
 * - HTML sanitization using cheerio
 * - Proper error handling and logging
 */

import express, { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import { isAllowedUrl, checkDomainRateLimit, extractDomain, UrlRejectionReason } from '../config/embedAllowlist';
import { sanitizeEmbedHtml, getSanitizationStats } from '../utils/sanitizeEmbed';

// Create Express router
const router = express.Router();

// Initialize in-memory cache with 30 second TTL
const embedCache = new NodeCache({
  stdTTL: 30, // 30 seconds
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Performance optimization
});

// Configure rate limiter: 30 requests per minute per IP
const embedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request): string => {
    return req.ip || 'unknown';
  },
});

/**
 * Mapping of rejection reasons to HTTP status codes and log levels
 */
const REJECTION_ERROR_MAP: Record<UrlRejectionReason, { status: number; logLevel: 'warn' | 'error' }> = {
  MALFORMED_URL: { status: 400, logLevel: 'warn' },
  INVALID_PROTOCOL: { status: 400, logLevel: 'warn' },
  PRIVATE_NETWORK: { status: 403, logLevel: 'error' },
  RAW_IP_ADDRESS: { status: 403, logLevel: 'error' },
  MALICIOUS_TLD: { status: 403, logLevel: 'error' },
  BLOCKED_PATTERN: { status: 403, logLevel: 'error' },
};

/**
 * Validates the URL parameter from the request
 */
function validateUrlParam(urlParam: string | undefined): { valid: boolean; url?: string; rejectionReason?: UrlRejectionReason; errorMessage?: string } {
  if (!urlParam) {
    return {
      valid: false,
      rejectionReason: 'MALFORMED_URL',
      errorMessage: 'Missing URL parameter',
    };
  }
  
  try {
    // Decode the URL parameter
    const decodedUrl = decodeURIComponent(urlParam);
    
    // Validate URL format and security rules
    const validationResult = isAllowedUrl(decodedUrl);
    
    if (!validationResult.allowed) {
      const rejectedResult = validationResult as { allowed: false; reason: UrlRejectionReason; message: string };
      return {
        valid: false,
        rejectionReason: rejectedResult.reason,
        errorMessage: rejectedResult.message,
      };
    }
    
    return {
      valid: true,
      url: decodedUrl,
    };
  } catch (error) {
    return {
      valid: false,
      rejectionReason: 'MALFORMED_URL',
      errorMessage: 'Invalid URL format',
    };
  }
}

/**
 * Generates a cache key for the given URL
 */
function generateCacheKey(url: string): string {
  return `embed:${url}`;
}

/**
 * Fetches HTML from the target URL with proper headers
 */
async function fetchEmbedHtml(url: string): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000, // 10 second timeout
      maxRedirects: 5,
      validateStatus: (status: number) => status < 500, // Accept all responses except 5xx
    });
    
    if (response.status !== 200) {
      return {
        success: false,
        error: `Target server returned status ${response.status}`,
      };
    }
    
    return {
      success: true,
      html: response.data,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      return {
        success: false,
        error: `Target server error: ${axiosError.response.status}`,
      };
    } else if (axiosError.request) {
      return {
        success: false,
        error: 'No response from target server',
      };
    } else {
      return {
        success: false,
        error: axiosError.message || 'Unknown error fetching embed',
      };
    }
  }
}

/**
 * GET /api/proxy/embed?url=<encoded_url>
 * 
 * Proxies and sanitizes third-party embed HTML.
 * 
 * Query Parameters:
 * - url: URL-encoded target embed URL (required)
 * 
 * Response:
 * - 200: Sanitized HTML with Content-Type: text/html
 * - 400: Bad request (missing or malformed URL, invalid protocol)
 * - 403: Forbidden (private network, raw IP, malicious TLD, blocked pattern)
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Internal server error
 * 
 * Example:
 * GET /api/proxy/embed?url=https%3A%2F%2Fpooembed.eu%2Fembed-noads%2Fpremierleague%2F2026-02-27%2Fwol-avl
 */
router.get('/embed', embedRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate URL parameter
    const validation = validateUrlParam(req.query.url as string);
    
    if (!validation.valid) {
      const rejectionReason = validation.rejectionReason!;
      const errorConfig = REJECTION_ERROR_MAP[rejectionReason];
      
      // Log the rejection with appropriate log level
      const hostname = extractDomain(req.query.url as string) || 'unknown';
      if (errorConfig.logLevel === 'warn') {
        console.warn(`[EmbedProxy] URL validation warning: ${rejectionReason} - ${hostname}`);
      } else {
        console.error(`[EmbedProxy] URL validation error: ${rejectionReason} - ${hostname}`);
      }
      
      // Send error response with appropriate status code
      res.status(errorConfig.status).json({
        error: validation.errorMessage,
        code: rejectionReason,
      });
      return;
    }
    
    const targetUrl = validation.url!;
    
    // Check per-domain rate limit
    const { hostname } = new URL(targetUrl);
    if (!checkDomainRateLimit(hostname)) {
      res.status(429).json({ error: 'Target domain rate limit exceeded' });
      return;
    }
    
    // Check cache first
    const cacheKey = generateCacheKey(targetUrl);
    const cachedHtml = embedCache.get<string>(cacheKey);
    
    if (cachedHtml) {
      console.log(`[EmbedProxy] Cache hit for: ${extractDomain(targetUrl)}`);
      res.set('X-Cache', 'HIT');
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(cachedHtml);
      return;
    }
    
    console.log(`[EmbedProxy] Cache miss for: ${extractDomain(targetUrl)}`);
    
    // Fetch HTML from target URL
    const fetchResult = await fetchEmbedHtml(targetUrl);
    
    if (!fetchResult.success || !fetchResult.html) {
      res.status(500).json({
        error: 'Failed to fetch embed',
        message: fetchResult.error || 'Unknown error',
      });
      return;
    }
    
    // Sanitize the HTML
    const sanitizedHtml = sanitizeEmbedHtml(fetchResult.html);
    
    // Get sanitization stats for logging
    const stats = getSanitizationStats(fetchResult.html, sanitizedHtml);
    console.log(`[EmbedProxy] Sanitized ${extractDomain(targetUrl)}: ` +
      `Removed ${stats.sizeReduction} bytes (${stats.sizeReductionPercentage.toFixed(2)}%)`);
    
    // Cache the sanitized HTML
    embedCache.set(cacheKey, sanitizedHtml);
    
    // Send response
    res.set('X-Cache', 'MISS');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=30');
    res.send(sanitizedHtml);
  } catch (error) {
    console.error('[EmbedProxy] Unexpected error:', error);
    next(error);
  }
});

/**
 * GET /api/proxy/embed/cache/stats
 * 
 * Returns cache statistics (for monitoring/debugging)
 * 
 * Response:
 * {
 *   keys: number,
 *   hits: number,
 *   misses: number,
 *   ksize: number,
 *   vsize: number
 * }
 */
router.get('/embed/cache/stats', (req: Request, res: Response): void => {
  const stats = embedCache.getStats();
  res.json({
    keys: stats.keys,
    hits: stats.hits,
    misses: stats.misses,
    ksize: stats.ksize,
    vsize: stats.vsize,
  });
});

/**
 * DELETE /api/proxy/embed/cache
 * 
 * Clears the embed cache (for administrative purposes)
 * 
 * Response:
 * {
 *   success: true,
 *   message: 'Cache cleared'
 * }
 */
router.delete('/embed/cache', (req: Request, res: Response): void => {
  embedCache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared',
  });
});

/**
 * Health check endpoint
 * 
 * GET /api/proxy/health
 */
router.get('/health', (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    cache: embedCache.getStats(),
  });
});

// Export the router as a named export
export { router as embedProxyRouter };
