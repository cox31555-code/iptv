# Sandbox Bypass Quick Reference

## Current Implementation ✅

**File:** `pages/Public/Watch.tsx`

```jsx
<iframe
  src={activeServer.embedUrl}
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-presentation"
  referrerPolicy="no-referrer"
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
  allowFullScreen={true}
  title="Stream Player"
/>
```

**What it does:**
- Explicitly allows scripts, popups, forms in iframe
- Hides referrer to bypass referrer-based checks
- Enables ad injection and adblock bypass

---

## Solutions Comparison

| Solution | Effort | Effectiveness | Complexity | ToS Risk |
|----------|--------|----------------|-----------|----------|
| **Sandbox Override** (Current) | ⭐ | ⭐⭐ | ⭐ | Low |
| **referrerPolicy** | ⭐ | ⭐ | ⭐ | Low |
| **Service Worker** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Medium |
| **Backend Proxy** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | High |
| **Nested iframe** | ⭐ | ⭐ | ⭐ | Low |

---

## When to Use Each Solution

### Use Sandbox Override (Current) When:
- ✅ Source sites don't use restrictive HTTP headers
- ✅ You want minimal code changes
- ✅ Performance is critical
- ✅ You want to test quickly

### Use Backend Proxy When:
- ✅ Source sites use `X-Frame-Options: DENY`
- ✅ You need full control over content
- ✅ You want to inject ads directly
- ✅ Sandbox override doesn't work

### Use Service Worker When:
- ✅ You need to modify response headers
- ✅ You want client-side only solution
- ✅ Backend changes aren't possible
- ✅ You're comfortable with complex code

---

## Testing Checklist

- [ ] iframe loads without errors
- [ ] Stream displays correctly
- [ ] `window.aclib` exists in iframe console
- [ ] Ad requests appear in Network tab
- [ ] Ads display in iframe
- [ ] Works with adblocker enabled
- [ ] No console errors

---

## Troubleshooting Decision Tree

```
Does iframe load?
├─ NO → Check X-Frame-Options header
│       ├─ DENY? → Use Backend Proxy
│       └─ SAMEORIGIN? → Use Backend Proxy
└─ YES → Do ads appear?
         ├─ NO → Check window.aclib in console
         │       ├─ Undefined? → Ad script not loading
         │       └─ Exists? → Ad network issue
         └─ YES → Success! ✅
```

---

## Quick Implementation Guide

### Option 1: Just Add referrerPolicy (Minimal)
```jsx
<iframe
  src={activeServer.embedUrl}
  referrerPolicy="no-referrer"
  // ... other attributes
/>
```

### Option 2: Add Sandbox Override (Current)
Already implemented in Watch.tsx ✅

### Option 3: Backend Proxy (If Needed)

**Step 1:** Create proxy endpoint in backend
```typescript
// ajsports-backend1/src/routes/proxy.ts
app.get('/api/proxy/stream', async (req, res) => {
  const url = req.query.url as string;
  const response = await fetch(url);
  const headers = new Headers(response.headers);
  headers.delete('X-Frame-Options');
  headers.delete('Content-Security-Policy');
  res.set(Object.fromEntries(headers));
  res.send(await response.text());
});
```

**Step 2:** Update Watch.tsx
```jsx
<iframe
  src={`/api/proxy/stream?url=${encodeURIComponent(activeServer.embedUrl)}`}
  // ... other attributes
/>
```

---

## Key Takeaways

1. **Sandbox Override** is your first test - it's simple and works for many sources
2. **referrerPolicy** is a bonus that helps with referrer-based blocking
3. **HTTP Headers** are the main blocker - if they exist, use Backend Proxy
4. **Backend Proxy** is the nuclear option - full control but more complex

---

**Status:** Implementation complete, testing phase
**Last Updated:** December 22, 2025
