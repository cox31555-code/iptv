
import { SportEvent, EventCategory, EventStatus } from './types';

export const INITIAL_EVENTS: SportEvent[] = [
  {
    id: 'e1',
    category: EventCategory.FOOTBALL,
    league: 'Premier League',
    teams: 'Arsenal vs Liverpool',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    status: EventStatus.LIVE,
    description: 'A massive clash at the Emirates Stadium.',
    isSpecial: false,
    pinPriority: 10,
    deleteAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    servers: [
      { id: 's1', name: 'Server 1', embedUrl: 'https://player.vimeo.com/video/76979871?h=8272103f6e', sortOrder: 1, isDefault: true, isActive: true },
      { id: 's2', name: 'Server 2', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', sortOrder: 2, isDefault: false, isActive: true },
      { id: 's3', name: 'HD Backup', embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', sortOrder: 3, isDefault: false, isActive: true },
    ]
  },
  {
    id: 'e2',
    category: EventCategory.NBA,
    league: 'NBA',
    teams: 'Lakers vs Warriors',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 10800000).toISOString(),
    status: EventStatus.UPCOMING,
    description: 'LeBron vs Curry in a high stakes matchup.',
    isSpecial: false,
    pinPriority: 5,
    deleteAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    servers: [
      { id: 's4', name: 'Main', embedUrl: 'https://player.vimeo.com/video/76979871?h=8272103f6e', sortOrder: 1, isDefault: true, isActive: true },
    ]
  },
  {
    id: 'e3',
    category: EventCategory.SPECIAL,
    league: 'UFC 300',
    teams: 'Pereira vs Hill',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 18000000).toISOString(),
    status: EventStatus.LIVE,
    description: 'The biggest card in UFC history.',
    isSpecial: true,
    pinPriority: 20,
    deleteAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    servers: [
      { id: 's5', name: 'Server 1', embedUrl: 'https://player.vimeo.com/video/76979871?h=8272103f6e', sortOrder: 1, isDefault: true, isActive: true },
    ]
  }
];
