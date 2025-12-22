# Safe Area Support for iPhone Notch & Dynamic Island

This document explains how the app now handles iPhone notches (iPhone X-13) and Dynamic Islands (iPhone 14 Pro+).

## What Changed

### 1. HTML Viewport Meta Tag (`index.html`)
- Added `viewport-fit=cover` to allow content to extend into the notch/Dynamic Island area
- This enables the app to use the full screen width on notched devices

### 2. CSS Safe Area Variables (`index.html`)
Added CSS custom properties that automatically detect safe area insets:
```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0);
  --safe-area-inset-left: env(safe-area-inset-left, 0);
  --safe-area-inset-right: env(safe-area-inset-right, 0);
}
```

### 3. Safe Area Utility Classes (`index.html`)
New CSS classes for easy safe area padding:
- `pt-safe` - Top padding with safe area inset
- `pb-safe` - Bottom padding with safe area inset
- `pl-safe` - Left padding with safe area inset
- `pr-safe` - Right padding with safe area inset
- `px-safe` - Horizontal padding with safe area insets

## How to Use

### For Fixed/Sticky Elements (like Navbar)
Add `pt-safe` to ensure content doesn't get hidden behind the notch:
```jsx
<nav className="fixed top-0 left-0 right-0 pt-safe">
  {/* Navigation content */}
</nav>
```

### For Side-Aware Components
Use `px-safe` to add horizontal padding on devices with side notches:
```jsx
<div className="px-safe">
  {/* Content stays within safe area on sides */}
</div>
```

### For Bottom Content
Use `pb-safe` for content near the bottom (e.g., on devices with home indicators):
```jsx
<footer className="pb-safe">
  {/* Footer content */}
</footer>
```

## Behavior

- **On notched devices**: Safe area insets are automatically applied based on device orientation and notch position
- **On regular devices**: Safe area insets default to 0, so padding classes have minimal effect (1rem minimum)
- **Responsive**: Safe area values update automatically when device orientation changes

## Current Implementation

The Navbar component has been updated with:
- `pt-safe` on the fixed nav element to prevent content from being hidden behind the notch
- `px-safe` on the mobile menu to respect side safe areas

## Future Enhancements

Consider adding `pb-safe` to:
- Footer component
- Bottom navigation (if added)
- Modal dialogs with bottom actions

Consider adding `px-safe` to:
- Main content containers
- Modals and overlays
- Any full-width components
