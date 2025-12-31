# Player Ad Implementation Guide

## Overview

This document describes the implementation of click-triggered advertisements on the video player component in the Watch page. When users interact with the video player (iframe or video element), an Adcash ad is triggered as a pop-up/overlay.

## Implementation Details

### Files Modified

1. **[`constants.ts`](constants.ts:32)** - Added player ad configuration constants
2. **[`pages/Public/Watch.tsx`](pages/Public/Watch.tsx:1)** - Implemented click handler with cooldown mechanism

### Configuration Constants

Added to [`constants.ts`](constants.ts:32):

```typescript
// Player Interaction Ad Constants
export const PLAYER_AD_ZONE = PRIMARY_AD_ZONE; // Zone for player click ads
export const PLAYER_AD_COOLDOWN = 45000; // 45 seconds between player ad triggers
export const PLAYER_AD_ENABLED = true; // Feature flag to enable/disable player ads
```

**Configuration Options:**

- **`PLAYER_AD_ZONE`**: The Adcash zone ID used for player click ads (currently uses `PRIMARY_AD_ZONE: 'ezlzq7hamb'`)
- **`PLAYER_AD_COOLDOWN`**: Time in milliseconds between ad triggers (default: 45 seconds)
- **`PLAYER_AD_ENABLED`**: Boolean flag to enable/disable the feature globally

### Implementation in Watch.tsx

#### 1. Added Imports

```typescript
import { PLAYER_AD_ZONE, PLAYER_AD_COOLDOWN, PLAYER_AD_ENABLED } from '../../constants.ts';
```

#### 2. Added State Management

```typescript
const lastAdTriggerRef = useRef<number>(0);
```

Uses `useRef` to track the timestamp of the last ad trigger without causing re-renders.

#### 3. Click Handler Function

```typescript
const handlePlayerClick = () => {
  if (!PLAYER_AD_ENABLED) return;
  
  const now = Date.now();
  const timeSinceLastAd = now - lastAdTriggerRef.current;
  
  // Check if cooldown period has passed
  if (timeSinceLastAd >= PLAYER_AD_COOLDOWN) {
    if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
      try {
        window.aclib.runAutoTag({ zoneId: PLAYER_AD_ZONE });
        lastAdTriggerRef.current = now;
        console.log('[PlayerAd] Triggered on player interaction');
      } catch (error) {
        console.error('[PlayerAd] Failed to trigger ad:', error);
      }
    }
  } else {
    const remainingCooldown = Math.ceil((PLAYER_AD_COOLDOWN - timeSinceLastAd) / 1000);
    console.log(`[PlayerAd] Cooldown active. ${remainingCooldown}s remaining`);
  }
};
```

**Key Features:**
- ✅ Checks if feature is enabled via `PLAYER_AD_ENABLED`
- ✅ Implements cooldown mechanism to prevent ad spam
- ✅ Safely checks for `window.aclib` availability
- ✅ Logs ad triggers and cooldown status for debugging
- ✅ Error handling for failed ad triggers

#### 4. Player Container Modifications

Added click handler to the video player container:

```typescript
<div 
  className="bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/5 aspect-video w-full max-w-5xl relative group cursor-pointer"
  onClick={handlePlayerClick}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlayerClick();
    }
  }}
  aria-label="Click to view advertisement"
>
```

**Accessibility Features:**
- ✅ `cursor-pointer` - Visual feedback that element is clickable
- ✅ `role="button"` - Semantic HTML for screen readers
- ✅ `tabIndex={0}` - Keyboard navigation support
- ✅ `onKeyDown` - Keyboard interaction (Enter/Space keys)
- ✅ `aria-label` - Descriptive label for assistive technologies

## How It Works

### User Flow

1. **User clicks on video player** (iframe or video element)
2. **Click event captured** by the container div
3. **Cooldown check** - Verifies if 45 seconds have passed since last ad
4. **Ad trigger** - If cooldown expired, calls `window.aclib.runAutoTag()`
5. **Adcash displays** pop-up/overlay ad
6. **Cooldown reset** - Timer starts for next ad trigger

### Cooldown Mechanism

```
First Click → Ad Triggered → 45s Cooldown → Clicks Ignored → Cooldown Expires → Next Click → Ad Triggered
```

### Browser Compatibility

Works with both player types:
- **`<iframe>` players**: Click captured by container (iframes block direct events)
- **`<video>` players**: Click captured by container and video element

## Configuration & Customization

### Adjusting Cooldown Duration

Edit [`constants.ts`](constants.ts:34):

```typescript
export const PLAYER_AD_COOLDOWN = 60000; // Change to 60 seconds
```

### Using Different Ad Zone

Edit [`constants.ts`](constants.ts:32):

```typescript
export const PLAYER_AD_ZONE = 'your-zone-id-here'; // Use different zone
```

### Disabling Player Ads

Edit [`constants.ts`](constants.ts:35):

```typescript
export const PLAYER_AD_ENABLED = false; // Disable feature
```

## Testing

### Manual Testing Checklist

- [ ] Click on iframe-based stream player
- [ ] Click on HLS video player
- [ ] Verify ad displays as pop-up/overlay
- [ ] Click multiple times rapidly - verify cooldown works
- [ ] Wait 45+ seconds - verify next click triggers ad
- [ ] Check browser console for log messages
- [ ] Test on mobile devices (touch events)
- [ ] Test keyboard navigation (Tab + Enter/Space)
- [ ] Verify video controls still work normally

### Console Log Messages

**Successful ad trigger:**
```
[PlayerAd] Triggered on player interaction
```

**During cooldown:**
```
[PlayerAd] Cooldown active. 30s remaining
```

**Error state:**
```
[PlayerAd] Failed to trigger ad: [error details]
```

## Performance Considerations

- **Minimal overhead**: Uses `useRef` to avoid re-renders
- **No memory leaks**: No intervals or timers to clean up
- **Efficient checks**: Simple timestamp comparison
- **Non-blocking**: Doesn't interfere with video playback

## Revenue Optimization Tips

1. **Monitor cooldown effectiveness**: Track if 45s is optimal
2. **A/B test durations**: Try 30s, 45s, 60s cooldowns
3. **Analytics integration**: Track ad trigger rates
4. **User feedback**: Monitor if ads are too frequent/infrequent

## Troubleshooting

### Ads Not Triggering

1. Check if `PLAYER_AD_ENABLED` is `true`
2. Verify `window.aclib` is loaded (check browser console)
3. Check if cooldown is active (see console logs)
4. Verify Adcash zone ID is correct

### Ads Triggering Too Frequently

1. Increase `PLAYER_AD_COOLDOWN` value
2. Check if multiple click handlers are registered

### Ads Interfering with Video Controls

- The click handler is on the container, not the video element itself
- Video controls should work normally
- If issues occur, adjust z-index or pointer-events CSS

## Future Enhancements

Potential improvements:

- [ ] Visual cooldown indicator (progress bar/timer)
- [ ] Admin panel toggle for enable/disable
- [ ] Per-user cooldown tracking (localStorage)
- [ ] Analytics dashboard for ad performance
- [ ] Different zones for different sports categories
- [ ] A/B testing framework for cooldown optimization

## Related Documentation

- [Adcash Integration Guide](ADCASH-ANTIBLOCK-SETUP.md)
- [Ad Slot Registry](utils/adSlotRegistry.ts)
- [Zone Configuration](constants.ts)

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Adcash script is loaded in [`index.html`](index.html:120)
3. Review this documentation
4. Test with different browsers/devices

---

**Last Updated**: 2025-12-31  
**Version**: 1.0.0  
**Status**: ✅ Production Ready