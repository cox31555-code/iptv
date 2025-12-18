# Adblock Bypass Testing Guide

## Quick Start

### 1. Start the Backend Server
```bash
cd ../ajsports-backend1
npm run dev
```

The backend should start on `http://localhost:3000` (or your configured port).

### 2. Start the Frontend
```bash
cd iptv
npm run dev
```

The frontend should start on `http://localhost:5173`.

### 3. Test the Analytics Endpoint Directly

Open your browser and navigate to:
```
http://localhost:3000/api/analytics/core.js
```

**Expected Result:**
- You should see JavaScript code (the obfuscated Adcash script)
- Look for `coreLib` instead of `aclib` in the code
- The script should be properly formatted JavaScript

### 4. Test the Frontend Integration

1. Open your browser to `http://localhost:5173`
2. Open Developer Tools (F12)
3. Go to the **Console** tab

**Expected Console Messages:**
```
Analytics system initialized successfully
```

**If you see warnings:**
```
Primary endpoint failed, trying fallback...
All endpoints failed to load analytics
Analytics library not loaded
```
This means there's an issue with the endpoints or backend connection.

### 5. Verify Script Loading in Network Tab

1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Reload the page
4. Look for a request to `core.js`

**Expected:**
- Status: `200 OK`
- Type: `javascript`
- URL: `http://localhost:3000/api/analytics/core.js?t=<timestamp>`
- Response contains obfuscated JavaScript code

### 6. Verify Window Object

In the console, type:
```javascript
window.coreLib
```

**Expected Result:**
- Should return an object with functions (not `undefined`)
- If you see `undefined`, the script didn't load properly

### 7. Test with Adblocker

**Install uBlock Origin or AdBlock Plus**

1. Install the browser extension
2. Reload your website
3. Check if the analytics script still loads

**Success Criteria:**
- ✅ Script loads despite adblocker
- ✅ Console shows "Analytics system initialized successfully"
- ✅ No blocked requests in Network tab
- ✅ `window.coreLib` exists

**If blocked:**
- Check if the adblocker is blocking your domain (unlikely)
- Try the advanced strategies in ADBLOCK-BYPASS.md
- Check browser console for specific error messages

## Testing Different Scenarios

### Scenario 1: Test Backend Proxy Only
```bash
curl http://localhost:3000/api/analytics/core.js
```
Should return JavaScript code with `coreLib`.

### Scenario 2: Test Alternative Endpoint
```bash
curl http://localhost:3000/api/analytics/metrics.js
```
Should either return the script or redirect to `/api/analytics/core.js`.

### Scenario 3: Test Cache
1. Make first request to `/api/analytics/core.js`
2. Check backend logs - should fetch from Adcash CDN
3. Make second request within 1 hour
4. Check backend logs - should serve from cache

### Scenario 4: Test Production URLs

Before deploying, update `index.html` endpoints if needed:
```javascript
endpoints: [
  'https://ajsports.ch/api/analytics/core.js',  // Your production URL
  'http://localhost:3000/api/analytics/core.js'
]
```

## Common Issues and Solutions

### Issue 1: "Failed to fetch" Error
**Problem:** Backend is not running or CORS issue

**Solution:**
- Ensure backend is running on port 3000
- Check CORS configuration in `app.ts`
- Verify `http://localhost:5173` is in CORS origins

### Issue 2: "Analytics library not loaded"
**Problem:** Script loaded but library didn't initialize

**Solution:**
- Check if obfuscation broke the script
- Verify the original Adcash script works
- Check browser console for JavaScript errors

### Issue 3: Script Returns 404
**Problem:** Route not registered

**Solution:**
- Verify `analyticsRouter` is imported in `app.ts`
- Check route is registered: `app.use('/api/analytics', analyticsRouter)`
- Restart backend server

### Issue 4: Still Being Blocked
**Problem:** Adblocker is using advanced detection

**Solution:**
- Try base64 encoding (see ADBLOCK-BYPASS.md)
- Change endpoint name from `/api/analytics/` to something else
- Add more obfuscation patterns
- Consider serving from subdomain

### Issue 5: CORS Error in Production
**Problem:** Production domain not in CORS whitelist

**Solution:**
Add your production domain to `app.ts`:
```typescript
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'https://ajsports.ch',
  'https://www.ajsports.ch',  // Add if needed
  'http://localhost:5173'
];
```

## Performance Testing

### Test Cache Performance
```bash
# First request (cache miss)
time curl http://localhost:3000/api/analytics/core.js > /dev/null

# Second request (cache hit)
time curl http://localhost:3000/api/analytics/core.js > /dev/null
```

Cache hit should be significantly faster (~50ms vs ~500ms).

### Test Script Load Time
1. Open Developer Tools
2. Go to Network tab
3. Reload page
4. Find `core.js` request
5. Check timing breakdown

**Target Times:**
- DNS Lookup: < 50ms
- Initial Connection: < 100ms
- Waiting (TTFB): < 200ms (cached) or < 600ms (uncached)
- Content Download: < 100ms

## Production Deployment Checklist

- [ ] Backend server is deployed and accessible
- [ ] CORS includes production domain
- [ ] Frontend endpoints updated to production URLs
- [ ] Test with production domain
- [ ] Test with multiple adblockers:
  - [ ] uBlock Origin
  - [ ] AdBlock Plus
  - [ ] AdGuard
  - [ ] Brave Browser
- [ ] Verify ads are displaying correctly
- [ ] Check browser console for errors
- [ ] Monitor backend logs for proxy errors
- [ ] Test on multiple browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test on mobile devices
- [ ] Verify analytics reporting in Adcash dashboard

## Monitoring in Production

### Backend Logs to Watch
```
Error proxying analytics script: [error details]
```

### Frontend Console to Monitor
```
Analytics system initialized successfully  ✅ Good
Primary endpoint failed, trying fallback...  ⚠️ Warning
All endpoints failed to load analytics  ❌ Critical
```

### Key Metrics
- **Script Load Success Rate:** Should be > 95%
- **Average Load Time:** Should be < 300ms
- **Cache Hit Rate:** Should be > 80% (after initial requests)
- **Adblocker Bypass Rate:** Target > 70%

## Advanced Testing

### Test with Different Adblockers
1. **uBlock Origin** - Most aggressive
2. **AdBlock Plus** - Moderate
3. **Brave Browser** - Built-in blocking
4. **AdGuard** - DNS-level blocking
5. **Pi-hole** - Network-level blocking

### Stress Test the Proxy
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test 1000 requests with 10 concurrent
ab -n 1000 -c 10 http://localhost:3000/api/analytics/core.js
```

**Expected:**
- No failed requests
- Average response time < 100ms (with cache)

## Success Criteria

Your implementation is successful if:

✅ Script loads from your domain  
✅ Obfuscation is applied (coreLib instead of aclib)  
✅ Works with popular adblockers enabled  
✅ No console errors  
✅ Ads display correctly  
✅ Fast load times (< 300ms)  
✅ Cache working properly  
✅ Fallback mechanism works  

## Getting Help

If issues persist:
1. Check ADBLOCK-BYPASS.md for advanced strategies
2. Review backend logs for specific errors
3. Test the original Adcash script to ensure zone ID is valid
4. Contact Adcash support if the zone itself has issues

---

**Last Updated:** December 2025
