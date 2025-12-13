
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
