/**
 * HTML Sanitization Utility for Embed Proxies
 * 
 * This module provides functions to sanitize third-party embed HTML by removing
 * malicious elements such as sandbox detection scripts, inline event handlers,
 * and other fingerprinting patterns while preserving video/media player functionality.
 */

import * as cheerio from 'cheerio';

/**
 * Patterns that indicate sandbox detection or fingerprinting scripts
 */
const MALICIOUS_PATTERNS = [
  'sandDetect',
  'sandbox',
  'fingerprint',
  'browserfingerprint',
  'devicefingerprint',
  'canvasfingerprint',
  'webglfingerprint',
  'audioprint',
] as const;

/**
 * Inline event handlers that may call window functions
 */
const EVENT_HANDLERS = [
  'onerror',
  'onload',
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onmouseenter',
  'onmouseleave',
  'onkeydown',
  'onkeyup',
  'onkeypress',
  'onfocus',
  'onblur',
  'onchange',
  'onsubmit',
  'onreset',
  'oninput',
  'onselect',
  'ontouchstart',
  'ontouchend',
  'ontouchmove',
  'oncontextmenu',
] as const;

/**
 * Tags that should preserve their event handlers (media-related)
 */
const PRESERVE_EVENT_TAGS = ['video', 'audio', 'source', 'track', 'iframe', 'embed'] as const;

/**
 * Checks if a string contains any malicious patterns
 */
function containsMaliciousPattern(text: string): boolean {
  const lowerText = text.toLowerCase();
  return MALICIOUS_PATTERNS.some(pattern => lowerText.includes(pattern.toLowerCase()));
}

/**
 * Checks if an event handler attribute value calls window functions
 */
function callsWindowFunction(handlerValue: string): boolean {
  const lowerValue = handlerValue.toLowerCase();
  return lowerValue.includes('window.') || 
         lowerValue.includes('parent.') ||
         lowerValue.includes('top.') ||
         lowerValue.includes('self.');
}

/**
 * Removes all <object> elements with onerror attributes (common sandbox detection)
 */
function removeMaliciousObjects($: cheerio.CheerioAPI): void {
  $('object[onerror]').each((_, element) => {
    const $element = $(element);
    const onerror = $element.attr('onerror') || '';
    
    // Check if it's a sandbox detection object
    if (containsMaliciousPattern(onerror) || 
        $element.attr('id')?.toLowerCase().includes('sand')) {
      $element.remove();
    }
  });
}

/**
 * Removes <script> tags that reference malicious patterns
 */
function removeMaliciousScripts($: cheerio.CheerioAPI): void {
  $('script').each((_, element) => {
    const $element = $(element);
    const src = $element.attr('src') || '';
    const content = $element.html() || '';
    
    // Check if script source or content contains malicious patterns
    if (containsMaliciousPattern(src) || containsMaliciousPattern(content)) {
      $element.remove();
    }
  });
}

/**
 * Strips inline event handlers that call window functions from non-media elements
 */
function stripMaliciousEventHandlers($: cheerio.CheerioAPI): void {
  const allElements = $('*').not(PRESERVE_EVENT_TAGS.join(','));
  
  allElements.each((_, element) => {
    const $element = $(element);
    
    EVENT_HANDLERS.forEach(handler => {
      const handlerValue = $element.attr(handler);
      if (handlerValue && callsWindowFunction(handlerValue)) {
        $element.removeAttr(handler);
      }
    });
  });
}

/**
 * Removes meta tags that may be used for fingerprinting or tracking
 */
function removeTrackingMetaTags($: cheerio.CheerioAPI): void {
  $('meta').each((_, element) => {
    const $element = $(element);
    const name = ($element.attr('name') || $element.attr('http-equiv') || '').toLowerCase();
    const content = ($element.attr('content') || '').toLowerCase();
    
    // Remove meta tags used for fingerprinting
    if (name.includes('fingerprint') || 
        name.includes('tracking') ||
        name.includes('analytics') ||
        content.includes('fingerprint')) {
      $element.remove();
    }
  });
}

/**
 * Injects a Content Security Policy meta tag to prevent further script injections
 */
function injectCSPMetaTag($: cheerio.CheerioAPI): void {
  // Check if CSP meta tag already exists
  if ($('meta[http-equiv="Content-Security-Policy"]').length > 0) {
    return;
  }
  
  const cspContent = [
    "default-src 'self' * data: blob:;",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *;",
    "style-src 'self' 'unsafe-inline' *;",
    "img-src 'self' * data: blob:;",
    "font-src 'self' * data:;",
    "connect-src 'self' *;",
    "media-src 'self' * blob:;",
    "object-src 'self' *;",
    "frame-src 'self' *;",
    "child-src 'self' *;",
  ].join(' ');
  
  const cspTag = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
  
  // Insert CSP meta tag as first element in head
  const $head = $('head');
  if ($head.length > 0) {
    $head.prepend(cspTag);
  } else {
    $('html').prepend(`<head>${cspTag}</head>`);
  }
}

/**
 * Sanitizes embed HTML by removing malicious elements and preserving media functionality
 * 
 * This function performs the following sanitization steps:
 * 1. Removes <object> elements with onerror attributes (sandbox detection)
 * 2. Removes <script> tags containing sandbox/fingerprinting patterns
 * 3. Strips inline event handlers that call window.* functions from non-media elements
 * 4. Removes tracking/fingerprinting meta tags
 * 5. Injects a Content Security Policy meta tag
 * 
 * @param html - The raw HTML content to sanitize
 * @returns The sanitized HTML string
 * 
 * @example
 * ```typescript
 * const rawHtml = `
 *   <html>
 *     <object id="sandDetect" data="data:application/pdf;base64,aG9t" 
 *       onerror="window.sandDetect()"></object>
 *     <script src="https://malicious.com/sandbox.js"></script>
 *     <video src="stream.mp4"></video>
 *   </html>
 * `;
 * const sanitized = sanitizeEmbedHtml(rawHtml);
 * // Returns HTML without the malicious object and script, but with the video intact
 * ```
 */
export function sanitizeEmbedHtml(html: string): string {
  // Load HTML into cheerio
  const $ = cheerio.load(html, {
    decodeEntities: false,
    xmlMode: false,
  });
  
  // Apply sanitization steps
  removeMaliciousObjects($);
  removeMaliciousScripts($);
  stripMaliciousEventHandlers($);
  removeTrackingMetaTags($);
  injectCSPMetaTag($);
  
  // Return the sanitized HTML
  return $.html();
}

/**
 * Extracts and returns statistics about the sanitization process
 * Useful for logging and debugging
 * 
 * @param originalHtml - The original HTML before sanitization
 * @param sanitizedHtml - The HTML after sanitization
 * @returns Statistics about what was removed
 */
export function getSanitizationStats(
  originalHtml: string,
  sanitizedHtml: string
): {
  originalSize: number;
  sanitizedSize: number;
  sizeReduction: number;
  sizeReductionPercentage: number;
} {
  const originalSize = originalHtml.length;
  const sanitizedSize = sanitizedHtml.length;
  const sizeReduction = originalSize - sanitizedSize;
  const sizeReductionPercentage = originalSize > 0 
    ? (sizeReduction / originalSize) * 100 
    : 0;
  
  return {
    originalSize,
    sanitizedSize,
    sizeReduction,
    sizeReductionPercentage,
  };
}
