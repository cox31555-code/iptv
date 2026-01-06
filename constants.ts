import { EventCategory } from './types';

export const COLORS = {
  background: '#000000',
  card: '#09090b',
  accent: '#0ea5e9',
  accentHover: '#0284c7',
  text: '#fafafa',
  textDim: '#a1a1aa',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const CATEGORY_ORDER = [
  'Special',
  EventCategory.FOOTBALL,
  EventCategory.NBA,
  EventCategory.NFL,
  EventCategory.OTHER
];

export const MOCK_ADMIN: any = {
  id: '1',
  username: 'admin',
  password: 'password', // For demo purposes
  role: 'Admin'
};

// Ad Management Constants
export const PRIMARY_AD_ZONE = 'ezlzq7hamb';
export const AD_RETRY_BACKOFF = [100, 200, 400]; // ms, capped at 400
export const AD_MAX_RETRIES = 13; // ~5s total with backoff

// Player Interaction Ad Constants
export const PLAYER_AD_ZONE = PRIMARY_AD_ZONE; // Zone for player click ads
export const PLAYER_AD_COOLDOWN = 45000; // 45 seconds between player ad triggers
export const PLAYER_AD_ENABLED = true; // Feature flag to enable/disable player ads

// Zone Types: 'autotag' uses runAutoTag, 'banner' uses runBanner with container ID
export type AdZoneType = 'autotag' | 'banner';

export interface AdZoneConfig {
  zoneId: string;
  type: AdZoneType;
  minHeight?: string; // CSS min-height value
}

// Zone configuration with type information
export const AD_ZONE_CONFIG: Record<string, AdZoneConfig> = {
  'ezlzq7hamb': { zoneId: 'ezlzq7hamb', type: 'autotag', minHeight: '90px' },
  '10766646': { zoneId: '10766646', type: 'banner', minHeight: '90px' },
};

export const AD_SLOT_ZONE_MAP = {
  navbar_banner: PRIMARY_AD_ZONE,
  home_hero_leaderboard: '10766646', // Banner zone - uses runBanner
  home_mid_feed: PRIMARY_AD_ZONE,
  watch_top_leaderboard: '10766646', // Banner zone - uses runBanner
  watch_sidebar_sticky: PRIMARY_AD_ZONE,
  watch_below_sources: PRIMARY_AD_ZONE,
  category_top_banner: PRIMARY_AD_ZONE,
  footer_banner: PRIMARY_AD_ZONE,
} as const;

export type AdSlotKey = keyof typeof AD_SLOT_ZONE_MAP;

// Minimum heights for different slot positions to prevent layout shift
export const AD_SLOT_MIN_HEIGHTS: Record<AdSlotKey, string> = {
  navbar_banner: '50px',
  home_hero_leaderboard: '90px',
  home_mid_feed: '90px',
  watch_top_leaderboard: '90px',
  watch_sidebar_sticky: '250px',
  watch_below_sources: '90px',
  category_top_banner: '90px',
  footer_banner: '100px',
};

export const DEFAULT_SLOT_REFRESH_INTERVAL = 45000; // 45s default
export const AD_SLOT_REFRESH_MAP: Partial<Record<AdSlotKey, number>> = {
  home_mid_feed: 60000,
  watch_sidebar_sticky: 45000,
  watch_top_leaderboard: 45000,
};

// Zone Mapping: Different zones for different page types
export const ZONE_MAPPING = {
  home: PRIMARY_AD_ZONE,        // Home page (/)
  category: PRIMARY_AD_ZONE,    // Category pages (/:categorySlug)
  watch: PRIMARY_AD_ZONE,       // Watch page (/watch/:eventSlug)
  default: PRIMARY_AD_ZONE      // Fallback for other pages
};

// Polling Constants
export const EVENT_POLL_INTERVAL = 60000; // 60s (reduced from 30s)
export const VISIBILITY_CHECK_INTERVAL = 100; // ms
