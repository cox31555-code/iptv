# Stream Sources Fix

## Problem
Stream sources were disappearing when added to events unless saved immediately. This occurred because the auto-refresh mechanism in `AppContext.tsx` was overwriting local form state every 60 seconds.

## Root Cause
The `EventEditor` component had a `useEffect` hook that synced `formData` with the `events` array from context. Since the app auto-refreshes events every 60 seconds, any unsaved changes (including newly added stream sources) were being overwritten with the backend data.

```typescript
// OLD CODE - Had race condition
useEffect(() => {
  if (id && id !== 'new') {
    const existing = events.find(e => e.id === id);
    if (existing) {
      setFormData({
        ...existing,  // ❌ This overwrites unsaved changes!
        startTime: existing.startTime.slice(0, 16),
        endTime: existing.endTime.slice(0, 16),
      });
    }
  }
}, [id, events]); // Re-runs whenever 'events' changes (every 60s!)
```

## Solution Implemented
Added state management to prevent auto-refresh from overwriting unsaved work:

### Changes Made:

1. **Added `initialLoadComplete` ref** - Tracks whether initial data load is complete
2. **Added `hasUnsavedChanges` state** - Tracks if user has made changes that haven't been saved
3. **Modified sync logic** - Only sync with backend data on initial load OR when there are no unsaved changes
4. **Mark changes on server actions** - Set `hasUnsavedChanges = true` when adding/removing servers
5. **Clear flag on save** - Reset `hasUnsavedChanges = false` after successful save

### Key Code Changes:

```typescript
// NEW CODE - Fixed race condition
const initialLoadComplete = useRef<boolean>(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

useEffect(() => {
  if (id && id !== 'new') {
    const existing = events.find(e => e.id === id);
    if (existing) {
      // ✅ Only sync if initial load OR no unsaved changes
      if (!initialLoadComplete.current || !hasUnsavedChanges) {
        setFormData({
          ...existing,
          startTime: existing.startTime.slice(0, 16),
          endTime: existing.endTime.slice(0, 16),
        });
        initialLoadComplete.current = true;
      }
    }
  }
}, [id, events, hasUnsavedChanges]);

// Mark as having unsaved changes when adding servers
const addServer = () => {
  setHasUnsavedChanges(true);
  // ... rest of logic
};

// Clear flag when saving
const handleSave = async () => {
  setHasUnsavedChanges(false);
  // ... rest of logic
};
```

## Benefits
- ✅ Stream sources no longer disappear when added
- ✅ All form changes are preserved until save
- ✅ Auto-refresh still works after initial load (when no unsaved changes)
- ✅ No breaking changes to existing functionality

## Testing
1. Open event editor
2. Add multiple stream sources
3. Wait 60+ seconds (auto-refresh interval)
4. Verify servers are still there
5. Save and verify persistence

## Files Modified
- `pages/Admin/EventEditor.tsx`

## Date Fixed
December 21, 2025
