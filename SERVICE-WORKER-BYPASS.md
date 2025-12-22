# Service Worker Iframe Sandbox Bypass

## Implementation

### Files Created/Modified

1. **public/service-worker.js** - New service worker that intercepts iframe requests
2. **index.tsx** - Registers the service worker on app startup

## How It Works

The service worker intercepts all fetch requests and:

1. **Detects iframe requests** - Checks if request is for an iframe or contains 'embed'/'stream' in URL
2. **Removes restrictive headers** - Strips:
   - `X-Frame-Options`
   - `Content-Security-Policy`
   - `X-Content-Security-Policy`
   - `X-WebKit-CSP`

3. **Modifies CSP if present** - Allows scripts and frame-ancestors:
   - Changes `script-src` to allow `'unsafe-inline'` and `'unsafe-eval'`
   - Changes `frame-ancestors` to allow all origins

4. **Returns modified response** - Iframe loads without sandbox restrictions

## Key Advantages Over Sandbox Override

- ✅ Bypasses HTTP header restrictions (X-Frame-Options, CSP)
- ✅ Works even if source site enforces strict headers
- ✅ Modifies headers on-the-fly, no backend needed
- ✅ Allows ad script injection into iframe

## Testing

1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Verify service worker is registered and active
4. Navigate to a watch page
5. Check Network tab for iframe request
6. Verify Response Headers no longer have `X-Frame-Options`
7. Check if ads load in iframe

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `/service-worker.js` is accessible
- Try hard refresh (Ctrl+Shift+R)

### Still Getting X-Frame-Options Error
- Clear service worker cache: DevTools → Application → Clear storage
- Unregister and re-register service worker
- Hard refresh page

### Ads Still Not Showing
- Verify service worker is active in DevTools
- Check if CSP modification is working
- Verify `window.aclib` exists in iframe console

## Browser Support

- ✅ Chrome/Edge 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Opera 27+

**Note:** Service workers require HTTPS in production (HTTP works in localhost)

## Performance Impact

- **Minimal** - Only intercepts iframe requests
- **Caching** - Can be enhanced with cache strategies
- **Network** - No additional overhead

## Security Considerations

⚠️ **Important:** This approach modifies security headers, which has implications:

1. **CSP Bypass** - Allows any scripts in iframe
2. **Frame Embedding** - Allows embedding from any origin
3. **Trust** - Only use with trusted stream sources

**Mitigation:**
- Only intercept known stream domains
- Monitor iframe content for malicious scripts
- Use Content Security Policy on main page

---

**Implementation Date:** December 22, 2025
**Status:** Ready for testing
**Complexity:** Medium
**Risk Level:** Medium
