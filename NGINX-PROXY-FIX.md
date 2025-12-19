# Nginx Proxy Configuration Fix for Adcash

## Problem
The nginx configuration was missing the proxy rules to forward `/api/*` requests to the backend server on port 3000. This caused all API requests to return the frontend's 404 HTML page instead of the backend responses.

## Solution
Updated `nginx.conf` to include proxy configuration for API routes.

## Deployment Instructions

### For Docker/Container Deployments

If you're using Docker or a container platform (like Coolify), you need to:

1. **Rebuild the frontend container** with the new nginx.conf:
   ```bash
   cd /path/to/iptv
   docker build -t ajsports-frontend .
   ```

2. **Restart the container** or redeploy on your platform

3. **Verify the configuration** is loaded:
   ```bash
   docker exec <container-name> nginx -t
   ```

### For Direct nginx Deployments

If nginx is running directly on your server:

1. **Copy the updated nginx.conf** to your nginx directory:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/ajsports
   sudo ln -sf /etc/nginx/sites-available/ajsports /etc/nginx/sites-enabled/ajsports
   ```

2. **Test the configuration**:
   ```bash
   sudo nginx -t
   ```

3. **Reload nginx** (without downtime):
   ```bash
   sudo nginx -s reload
   # OR
   sudo systemctl reload nginx
   ```

### For Coolify or Similar Platforms

1. **Push the changes** to your git repository:
   ```bash
   git add nginx.conf
   git commit -m "Add nginx proxy configuration for API routes"
   git push origin main
   ```

2. **Redeploy** your application in Coolify dashboard

3. **Wait for deployment** to complete

## Verification Steps

After deploying, verify the fix works:

### 1. Test the API Endpoint Directly
Open in browser:
```
https://ajsports.ch/api/analytics/core.js
```

**Expected:** JavaScript code (the Adcash script)
**Previously:** HTML 404 page

### 2. Check Other API Endpoints
```
https://ajsports.ch/api/events
https://ajsports.ch/api/teams
```

Should all return JSON data, not HTML.

### 3. Check Adcash in Console

1. Open your site: `https://ajsports.ch`
2. Open DevTools (F12)
3. Go to Console tab
4. Look for:
   ```
   ✓ Adcash script loaded from: https://ajsports.ch/api/analytics/core.js
   ✓ window.aclib found!
   ✓ Adcash initialized successfully with zone: v73cub7u8a
   ```

### 4. Verify Ads Display

- Visit any page on your site
- Ads should now load on mobile and desktop
- Check Network tab - `/api/analytics/core.js` should return status 200

## What Changed

### Before:
```nginx
location / {
    try_files $uri $uri/ /index.html;  # Everything returned index.html
}
```

### After:
```nginx
# API proxy - forward to backend
location /api/ {
    proxy_pass http://localhost:3000;
    # ... proxy headers ...
}

# Static files
location / {
    try_files $uri $uri/ /index.html;
}
```

## Troubleshooting

### Issue: Still getting HTML instead of JavaScript

**Check:**
1. Is the backend running on port 3000?
   ```bash
   netstat -tlnp | grep 3000
   ```

2. Can nginx reach the backend?
   ```bash
   curl http://localhost:3000/api/analytics/core.js
   ```

3. Is nginx using the new configuration?
   ```bash
   sudo nginx -t
   sudo nginx -s reload
   ```

### Issue: 502 Bad Gateway

**Cause:** Backend is not running or not accessible

**Fix:**
1. Start the backend server
2. Verify it's listening on port 3000
3. Check backend logs for errors

### Issue: CORS Errors

**Cause:** Backend CORS not configured for your domain

**Fix:** Check `ajsports-backend1/src/app.ts` CORS configuration:
```typescript
const corsOrigins = [
  'https://ajsports.ch',
  // ... your domains
];
```

## Summary

This fix adds the missing nginx proxy configuration that:
- ✅ Routes `/api/*` requests to backend (port 3000)
- ✅ Forwards proper headers (Host, X-Real-IP, etc.)
- ✅ Enables Adcash script to load correctly
- ✅ Makes all API endpoints work properly

**After deployment, Adcash ads should load successfully on both mobile and desktop!**

---

**Last Updated:** December 19, 2025
**Status:** Ready for deployment
