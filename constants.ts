
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
  EventCategory.OTHER
];

export const MOCK_ADMIN: any = {
  id: '1',
  username: 'admin',
  password: 'password', // For demo purposes
  role: 'Admin'
};

// Ad Management Constants
export const AD_ZONES = ['tqblxpksrg'];
export const AD_RETRY_BACKOFF = [100, 200, 400]; // ms, capped at 400
export const AD_MAX_RETRIES = 13; // ~5s total with backoff
export const AD_ZONE_DELAY = 150; // ms between zone refreshes

// Polling Constants
export const EVENT_POLL_INTERVAL = 60000; // 60s (reduced from 30s)
export const VISIBILITY_CHECK_INTERVAL = 100; // ms
