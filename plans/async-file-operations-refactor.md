# Async File Operations Refactoring Plan

## Problem Statement

The server is bottlenecking because [`coverService.ts`](G:/Github Proj/AJSPORTS/ajsports-backend1/src/services/coverService.ts) and [`covers.ts`](G:/Github Proj/AJSPORTS/ajsports-backend1/src/routes/covers.ts) are using synchronous file operations (`fs.readFileSync`, `fs.existsSync`, `fs.writeFileSync`, `fs.unlinkSync`) on the main thread. This blocks the Event Loop under load.

## Current Synchronous Operations Identified

### In `coverService.ts`:

| Line | Operation | Method |
|------|-----------|--------|
| 35 | Check cache dir exists | `fs.existsSync(CACHE_DIR)` |
| 36 | Create cache dir | `fs.mkdirSync(CACHE_DIR, { recursive: true })` |
| 61 | Check cache file exists | `fs.existsSync(cachePath)` |
| 61 | Check metadata file exists | `fs.existsSync(metadataPath)` |
| 66 | Read metadata file | `fs.readFileSync(metadataPath, 'utf-8')` |
| 102 | Write metadata file | `fs.writeFileSync(metadataPath, JSON.stringify(metadata))` |
| 112 | Check cache file exists | `fs.existsSync(cachePath)` |
| 113 | Delete cache file | `fs.unlinkSync(cachePath)` |
| 115 | Check metadata file exists | `fs.existsSync(metadataPath)` |
| 116 | Delete metadata file | `fs.unlinkSync(metadataPath)` |
| 135 | Check upload file exists | `fs.existsSync(diskPath)` |
| 138 | Read upload file | `fs.readFileSync(diskPath)` |
| 294 | Read cached cover | `fs.readFileSync(this.getCachePath(event.id))` |
| 437 | Write cover to cache | `fs.writeFileSync(this.getCachePath(event.id), webpBuffer)` |

### In `covers.ts`:

| Line | Operation | Method |
|------|-----------|--------|
| 38 | Check cache file exists | `fs.existsSync(cachePath)` |
| 38 | Check metadata file exists | `fs.existsSync(metadataPath)` |

## Refactoring Plan

### File 1: `coverService.ts`

#### 1. Update Imports (Line 1)
```typescript
// Change from:
import * as fs from 'fs';

// To:
import { promises as fs } from 'fs';
import * as fsSync from 'fs'; // Only if needed for createReadStream
```

#### 2. Convert `ensureCacheDir()` to async (Lines 34-38)
```typescript
static async ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}
```

#### 3. Convert `isCacheValid()` to async (Lines 57-81)
```typescript
static async isCacheValid(event: SportEvent, league: League | null): Promise<boolean> {
  const cachePath = this.getCachePath(event.id);
  const metadataPath = this.getMetadataPath(event.id);

  try {
    // Check existence asynchronously
    await Promise.all([
      fs.access(cachePath),
      fs.access(metadataPath)
    ]);

    const data = await fs.readFile(metadataPath, 'utf-8');
    const metadata: CacheMetadata = JSON.parse(data);
    
    const normalize = (val: string | null | undefined) => (val || '').trim();

    if (normalize(metadata.teamALogoUrl) !== normalize(event.teamALogoUrl)) return false;
    if (normalize(metadata.teamBLogoUrl) !== normalize(event.teamBLogoUrl)) return false;
    if (normalize(metadata.backgroundImageUrl) !== normalize(league?.backgroundImageUrl)) return false;
    if (normalize(metadata.coverImageUrl) !== normalize(event.coverImageUrl)) return false;
    
    return true;
  } catch {
    return false;
  }
}
```

#### 4. Convert `saveCacheMetadata()` to async (Lines 93-103)
```typescript
static async saveCacheMetadata(event: SportEvent, league: League | null): Promise<void> {
  const metadataPath = this.getMetadataPath(event.id);
  const metadata: CacheMetadata = {
    teamALogoUrl: event.teamALogoUrl,
    teamBLogoUrl: event.teamBLogoUrl,
    backgroundImageUrl: league?.backgroundImageUrl,
    coverImageUrl: event.coverImageUrl || undefined,
    generatedAt: new Date().toISOString()
  };
  await fs.writeFile(metadataPath, JSON.stringify(metadata));
}
```

#### 5. Convert `invalidateCache()` to async (Lines 108-118)
```typescript
static async invalidateCache(eventId: string): Promise<void> {
  const cachePath = this.getCachePath(eventId);
  const metadataPath = this.getMetadataPath(eventId);
  
  await Promise.allSettled([
    fs.unlink(cachePath),
    fs.unlink(metadataPath)
  ]);
}
```

#### 6. Convert `fetchImageBuffer()` file operations to async (Lines 123-149)
```typescript
// In the local uploads section (lines 133-139):
if (url.startsWith('/uploads/')) {
  const diskPath = url.replace('/uploads/', '/data/uploads/');
  console.log(`[fetchImageBuffer] Loading from disk: ${diskPath}`);
  try {
    return await fs.readFile(diskPath);
  } catch {
    throw new Error(`File not found on disk: ${diskPath}`);
  }
}
```

#### 7. Update `generateCover()` method (Lines 279-442)
- Line 282: Change `this.ensureCacheDir()` to `await this.ensureCacheDir()`
- Line 292: Change `this.isCacheValid(event, league)` to `await this.isCacheValid(event, league)`
- Line 294: Change `fs.readFileSync(...)` to `await fs.readFile(...)`
- Line 437: Change `fs.writeFileSync(...)` to `await fs.writeFile(...)`
- Line 438: Change `this.saveCacheMetadata(...)` to `await this.saveCacheMetadata(...)`

### File 2: `covers.ts`

#### 1. Update Imports (Line 4)
```typescript
// Remove:
import * as fs from 'fs';

// The route no longer needs direct fs access since isCacheValid handles it
```

#### 2. Update Route Handler (Lines 38-55)
```typescript
// Remove the synchronous existence checks (line 38):
// OLD: if (fs.existsSync(cachePath) && fs.existsSync(metadataPath)) {

// NEW: Just call the async isCacheValid directly
try {
  const league = event.leagueId ? await CoverService.getLeagueForValidation(event.leagueId) : null;
  
  if (await CoverService.isCacheValid(event, league)) {
    // Serve from disk cache - FAST PATH
    return res.sendFile(cachePath, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
} catch (validationErr) {
  console.warn(`[Cover Route] Cache validation failed for ${eventId}, will regenerate`);
}
```

## Impact Analysis

### Methods That Change Signature

| Method | Old Signature | New Signature |
|--------|---------------|---------------|
| `ensureCacheDir` | `static ensureCacheDir(): void` | `static async ensureCacheDir(): Promise<void>` |
| `isCacheValid` | `static isCacheValid(...): boolean` | `static async isCacheValid(...): Promise<boolean>` |
| `saveCacheMetadata` | `static saveCacheMetadata(...): void` | `static async saveCacheMetadata(...): Promise<void>` |
| `invalidateCache` | `static invalidateCache(...): void` | `static async invalidateCache(...): Promise<void>` |

### Callers That Need Updates

1. **`generateCover()`** - Internal calls to `ensureCacheDir`, `isCacheValid`, `saveCacheMetadata` need `await`
2. **`covers.ts` route** - Call to `isCacheValid` needs `await`
3. **Any other code calling `invalidateCache()`** - Needs to be checked and updated

## Testing Considerations

After refactoring:
1. Test cover generation for new events (cache miss path)
2. Test cover serving for existing events (cache hit path)
3. Test cache invalidation when event is updated
4. Load test to verify Event Loop is no longer blocked
5. Verify error handling still works correctly

## Files to Modify

1. `G:/Github Proj/AJSPORTS/ajsports-backend1/src/services/coverService.ts`
2. `G:/Github Proj/AJSPORTS/ajsports-backend1/src/routes/covers.ts`
