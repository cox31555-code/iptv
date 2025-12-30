# Category Field Fix - Property Mapping Issue

## Issue Identified

The category was being saved correctly to the database as `category_id` (snake_case), but the backend wasn't mapping it to `categoryId` (camelCase) when returning data to the frontend.

### Network Response Before Fix:
```json
{
  "categoryId": null,        // ❌ Frontend expects this
  "category_id": "Football"  // ✅ Database has this
}
```

## Root Cause

SQLite database columns use snake_case (`category_id`), but JavaScript/TypeScript conventions use camelCase (`categoryId`). The backend service wasn't transforming the property names when retrieving data from the database.

## Solution Applied

Updated `ajsports-backend1/src/services/leagueService.ts` to map database column names to JavaScript property names in three methods:

### 1. getAllLeagues()
```typescript
const leagues = (rows || []).map(row => ({
  ...row,
  categoryId: row.category_id,
  category_id: undefined
}));
```

### 2. getLeagueById()
```typescript
const league = {
  ...row,
  categoryId: row.category_id,
  category_id: undefined
};
```

### 3. getLeagueBySlug()
```typescript
const league = {
  ...row,
  categoryId: row.category_id,
  category_id: undefined
};
```

## Expected Result After Fix

Network response should now show:
```json
{
  "id": "...",
  "name": "Liga Portugal",
  "categoryId": "Football",  // ✅ Now populated correctly
  "slug": "liga-portugal",
  "backgroundImageUrl": "...",
  "logoUrl": "..."
}
```

## Testing Instructions

1. **Restart the backend server** (required for changes to take effect):
   ```bash
   cd "g:\Github Proj\AJSPORTS\ajsports-backend1"
   npm start
   ```

2. **Refresh the frontend** in your browser

3. **Verify the fix**:
   - Open browser DevTools → Network tab
   - Navigate to the Leagues admin page
   - Check the `/api/leagues` response
   - Verify `categoryId` is now populated (not null)
   - Verify the category badge appears on league cards

4. **Test editing**:
   - Edit an existing league
   - Verify the category dropdown shows the correct selected value
   - Change the category and save
   - Verify the new category persists

## Files Modified

- ✅ `ajsports-backend1/src/services/leagueService.ts` - Added property mapping
- ✅ `iptv/pages/Admin/Leagues.tsx` - Fixed form reset bug (line 237)

## Status

🔧 **Fix Applied** - Restart backend server to test

---

**Date**: December 30, 2025  
**Issue**: Property name mismatch between database and frontend  
**Resolution**: Added property mapping in backend service layer
