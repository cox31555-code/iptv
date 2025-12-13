
import { EventCategory } from './types';

export const COLORS = {
  background: '#0B0C10',
  card: '#1F2833',
  accent: '#04C4FC',
  text: '#E6E6E6',
  textDim: '#9BA4B4',
};

export const CATEGORY_ORDER = [
  EventCategory.SPECIAL,
  EventCategory.FOOTBALL,
  EventCategory.NBA
];

export const MOCK_ADMIN: any = {
  id: '1',
  username: 'admin',
  password: 'password', // For demo purposes
  role: 'Admin'
};
