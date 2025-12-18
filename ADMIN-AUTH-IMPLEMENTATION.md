# Admin Authentication Implementation - Cookie-Based Sessions

## ✅ Implementation Complete

This document describes the cookie-based persistent authentication system implemented for the admin panel.

---

## 🎯 Problem Solved

**Before:** Admin authentication was stored in memory only, causing logout on page refresh.

**After:** Admin sessions persist across page refreshes using secure HTTP-only cookies.

---

## 🔧 Backend Changes

### 1. **Cookie-Parser Middleware** (`src/app.ts`)
- Added `cookie-parser` package for parsing cookies
- Configured to run before routes

### 2. **Login Endpoint** (`src/routes/auth.ts`)
- Sets HTTP-only cookie on successful login
- Cookie configuration:
  ```typescript
  {
    httpOnly: true,              // Not accessible via JavaScript
    secure: true (production),   // HTTPS only in production
    sameSite: 'lax',            // CSRF protection
    maxAge: 7 days              // 7-day session
  }
  ```

### 3. **Logout Endpoint** (`src/routes/auth.ts`)
- New `POST /api/auth/logout` endpoint
- Clears the `admin_token` cookie
- Returns success response

### 4. **Auth Middleware** (`src/middleware/auth.ts`)
- Updated to check cookies first, then Authorization header
- Maintains backward compatibility with Bearer tokens
- Validates JWT from either source

### 5. **Admin Validation Endpoint** (`src/routes/admin.ts`)
- New `GET /api/admin/me` endpoint
- Validates session and returns admin info
- Used for session restoration on app load

---

## 🎨 Frontend Changes

### 1. **API Layer** (`api.ts`)
- **Removed:** In-memory token storage
- **Added:** `credentials: 'include'` to all fetch requests (auto-sends cookies)
- **Added:** `validateSession()` function to check auth on mount
- **Updated:** `logout()` to call backend endpoint

### 2. **AppContext** (`AppContext.tsx`)
- **Added:** Session validation on app mount
- Calls `/api/admin/me` to restore admin state
- Updates `loginAdmin()` to validate after login
- Updates `logout()` to be async and call API

### 3. **ProtectedRoute Component** (`admin/components/ProtectedRoute.tsx`)
- New component to guard admin routes
- Checks if user is authenticated
- Redirects to login if not

### 4. **App Routes** (`App.tsx`)
- Wrapped all admin routes with `<ProtectedRoute>`
- Login page remains unprotected

---

## 🔄 Authentication Flow

### **Login Flow:**
```
1. User enters credentials
2. POST /api/auth/login
3. Backend validates & sets HTTP-only cookie
4. Frontend calls /api/admin/me to get admin data
5. Admin state updated in context
6. Navigate to dashboard
```

### **Page Refresh Flow:**
```
1. App loads
2. AppContext calls /api/admin/me on mount
3. Browser auto-sends cookie with request
4. Backend validates JWT from cookie
5. If valid: Returns admin data → Admin state restored
6. If invalid: Returns 401 → Admin state remains null
```

### **Logout Flow:**
```
1. User clicks logout
2. POST /api/auth/logout (with cookie)
3. Backend clears cookie
4. Frontend resets admin state
5. Navigate to login page
```

---

## 🔒 Security Features

✅ **HTTP-only cookies** - Not accessible via JavaScript (XSS protection)
✅ **Secure flag** - HTTPS only in production (MITM protection)
✅ **SameSite: lax** - CSRF protection
✅ **7-day expiry** - Auto logout after inactivity
✅ **JWT validation** - Token verified on every request
✅ **No localStorage** - Tokens never exposed to client JS

---

## 🧪 Testing Checklist

- [ ] Login successfully sets cookie
- [ ] Dashboard accessible after login
- [ ] Page refresh maintains auth state
- [ ] Logout clears cookie and redirects
- [ ] Protected routes redirect when not authenticated
- [ ] Session expires after 7 days
- [ ] Cookie only sent to same domain
- [ ] Cookie marked secure in production

---

## 📝 Files Modified

### Backend:
- `src/app.ts` - Added cookie-parser
- `src/routes/auth.ts` - Cookie-based login & logout
- `src/routes/admin.ts` - New /api/admin/me endpoint
- `src/middleware/auth.ts` - Cookie + header validation

### Frontend:
- `api.ts` - Credentials: include, removed token storage
- `AppContext.tsx` - Session validation on mount
- `App.tsx` - ProtectedRoute wrapper
- `admin/components/ProtectedRoute.tsx` - New component

---

## 🚀 Deployment Notes

1. **Environment Variables:** Ensure `NODE_ENV=production` for secure cookies
2. **CORS:** Verify `credentials: true` in CORS config (already set)
3. **HTTPS:** Required in production for secure cookies
4. **Cookie Domain:** Cookies work across `ajsports.ch` and `api.ajsports.ch`

---

## ✨ Benefits

✅ Admin stays logged in across refreshes
✅ Secure, production-ready authentication
✅ No complex session stores needed
✅ Backward compatible with existing API
✅ Simple, maintainable implementation
