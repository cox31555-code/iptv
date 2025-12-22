# iframe Sandbox Bypass Implementation Guide

## Overview

This document describes the sandbox bypass techniques implemented to allow adblock injection and script execution in third-party iframes on watch pages.

## Problem Statement

Third-party streaming sources use sandbox restrictions to prevent:
- Script injection
- Ad injection
- Cross-origin communication
- Popup blocking

These restrictions prevent monetization via adblock integration.

## Solution Implemented: Sandbox Attribute Override

### What Changed

**File:** `pages/Public/Watch.tsx`

Added two attributes to the iframe element:

```jsx
<iframe
  src={activeServer.embedUrl}
  className="w-full h-full border-none"
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
  allowFullScreen={true}
  title="Stream Player"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-presentation"
  referrerPolicy="no-referrer"
/>
```

### Key Attributes

1. **sandbox** - Explicitly defines allowed capabilities:
   - `allow-same-origin` - Allows same-origin requests
   - `allow-scripts` - Allows JavaScript execution
   - `allow-popups` - Allows popup windows
   - `allow-forms` - Allows form submission
   - `allow-pointer-lock` - Allows pointer lock API
   - `allow-presentation` - Allows presentation API

2. **referrerPolicy="no-referrer"** - Hides referrer information:
   - Prevents referrer-based blocking
   - Improves privacy
   - May bypass some referrer checks

### How It Works

When you explicitly set the `sandbox` attribute on an iframe, you're defining what the iframe CAN do, not what it can't. This overrides any default restrictions and allows:
- Script execution within the iframe
- Ad injection via JavaScript
- Popup windows for ad networks
- Form submissions

## Why This Works

1. **Client-side Control** - You define the sandbox rules, not the source site
2. **Explicit Permissions** - The iframe gets exactly what you allow
3. **Referrer Hiding** - Removes one detection vector for ad blockers
4. **Standards Compliant** - Uses standard HTML5 sandbox attributes

## Limitations

This approach has one critical limitation:

**HTTP Headers Override iframe Attributes**

If the source website sends HTTP headers like:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Frame-Options: SAMEORIGIN`

These headers will override your iframe sandbox attributes and prevent embedding entirely.

### Testing for Header Restrictions

Check browser DevTools → Network tab:
1. Find the iframe request
2. Look at Response Headers
3. If you see `X-Frame-Options: DENY`, the source blocks embedding
4. If you see `Content-Security-Policy`, it may restrict scripts

## Alternative Solutions (If Sandbox Override Doesn't Work)

### Solution 1: Service Worker Interception (Advanced)

Intercept iframe requests and modify response headers:

```javascript
// In a service worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('stream-source.com')) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const newResponse = response.clone();
        // Remove restrictive headers
        const headers = new Headers(newResponse.headers);
        headers.delete('X-Frame-Options');
        headers.delete('Content-Security-Policy');
        return new Response(newResponse.body, {
          status: newResponse.status,
          statusText: newResponse.statusText,
          headers: headers
        });
      })
    );
  }
});
```

**Pros:**
- Can modify HTTP headers
- Works even with header-based restrictions

**Cons:**
- Complex implementation
- May violate source site ToS
- Browser compatibility issues

### Solution 2: Backend Proxy (Most Effective)

Create a backend endpoint that proxies iframe content:

```typescript
// In ajsports-backend1/src/routes/proxy.ts
app.get('/api/proxy/stream', async (req, res) => {
  const sourceUrl = req.query.url as string;
  
  try {
    const response = await fetch(sourceUrl);
    let content = await response.text();
    
    // Strip restrictive headers
    const headers = new Headers(response.headers);
    headers.delete('X-Frame-Options');
    headers.delete('Content-Security-Policy');
    
    // Inject ad script
    content = content.replace(
      '</body>',
      '<script src="/lib-1b_48s7z.js"></script></body>'
    );
    
    res.set(headers);
    res.send(content);
  } catch (error) {
    res.status(500).send('Proxy error');
  }
});
```

Then update Watch.tsx:

```jsx
<iframe
  src={`/api/proxy/stream?url=${encodeURIComponent(activeServer.embedUrl)}`}
  // ... other attributes
/>
```

**Pros:**
- Full control over content
- Can inject ads directly
- Bypasses all header restrictions

**Cons:**
- Requires backend changes
- Performance overhead
- May violate source site ToS
- Bandwidth usage increases

### Solution 3: Nested iframe Wrapper

Wrap the source iframe in a parent iframe without restrictions:

```jsx
<iframe
  sandbox="allow-same-origin allow-scripts"
  srcDoc={`
    <iframe 
      src="${activeServer.embedUrl}" 
      style="width:100%;height:100%;border:none;"
    />
  `}
/>
```

**Pros:**
- No backend required
- Minimal code change

**Cons:**
- Cumulative restrictions (nested sandboxes are more restrictive)
- Usually doesn't help
- Not recommended

## Testing the Implementation

### Step 1: Verify iframe Loads

1. Open browser DevTools (F12)
2. Navigate to a watch page
3. Check Console for errors
4. Verify iframe displays stream

### Step 2: Check Sandbox Attributes

In DevTools → Elements:
```html
<iframe 
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-presentation"
  referrerPolicy="no-referrer"
/>
```

### Step 3: Test Ad Injection

1. Open DevTools → Console
2. Type: `window.aclib` (should exist if ads loaded)
3. Check Network tab for ad requests
4. Verify ads display in iframe

### Step 4: Test with Adblocker

1. Enable uBlock Origin or AdBlock Plus
2. Reload page
3. Verify ads still appear (bypass working)
4. Check console for ad initialization logs

## Performance Impact

- **Minimal** - No additional requests or processing
- **Rendering** - Same as before
- **Network** - No change
- **User Experience** - No noticeable impact

## Security Considerations

⚠️ **Important:** Enabling these sandbox permissions has security implications:

1. **Script Execution** - `allow-scripts` allows any JavaScript in the iframe
2. **Popup Windows** - `allow-popups` allows the iframe to open new windows
3. **Form Submission** - `allow-forms` allows form data submission
4. **Same-Origin** - `allow-same-origin` allows access to your domain's data

**Mitigation:**
- Only enable permissions you actually need
- Monitor iframe content for malicious scripts
- Use Content Security Policy on your main page
- Regularly audit source websites

## Compliance & Legal

⚠️ **Important:** Ensure your implementation complies with:

1. **Source Website ToS** - Check if bypassing sandbox violates their terms
2. **Ad Network ToS** - Verify Adcash allows this implementation
3. **Local Laws** - Check advertising regulations in your jurisdiction
4. **Privacy Laws** - Ensure GDPR/CCPA compliance

## Troubleshooting

### Issue: Ads Still Not Showing

**Possible Causes:**
1. Source site uses HTTP headers to block embedding
2. Ad script not injecting properly
3. Adblocker still blocking ads

**Solutions:**
- Check Network tab for `X-Frame-Options` headers
- Verify `window.aclib` exists in iframe
- Try Solution 2 (Backend Proxy)

### Issue: iframe Doesn't Load

**Possible Causes:**
1. `X-Frame-Options: DENY` header
2. CORS restrictions
3. Invalid URL

**Solutions:**
- Check Response Headers in Network tab
- Verify URL is accessible
- Try Solution 2 (Backend Proxy)

### Issue: Scripts Not Executing

**Possible Causes:**
1. `allow-scripts` not set
2. Content-Security-Policy blocking scripts
3. Script URL blocked by adblocker

**Solutions:**
- Verify `sandbox` attribute includes `allow-scripts`
- Check CSP headers in Network tab
- Try obfuscating script URL

## Next Steps

1. **Test Current Implementation** - Verify sandbox override works with your sources
2. **Monitor Performance** - Check if ads load and display correctly
3. **If Needed, Implement Solution 2** - Backend proxy for more control
4. **Optimize Ad Injection** - Fine-tune which ads show in iframes

## References

- [MDN: iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
- [OWASP: Sandbox](https://owasp.org/www-community/attacks/xss/#defense-option-1-sandboxing)
- [Adcash Documentation](https://www.adcash.com/en/support/)

---

**Last Updated:** December 22, 2025
**Implementation Version:** 1.0
**Status:** Testing Phase
