
export enum EventCategory {
  SPECIAL = 'Special',
  FOOTBALL = 'Football',
  NBA = 'NBA'
}

export enum EventStatus {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  ENDED = 'Ended'
}

export interface StreamServer {
  id: string;
  name: string;
  embedUrl: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface SportEvent {
  id: string;
  category: EventCategory;
  league: string;
  teams: string; // Or Title for Special Events
  startTime: string;
  endTime: string;
  status: EventStatus;
  description: string;
  isSpecial: boolean;
  pinPriority: number;
  deleteAt: string | null;
  createdAt: string;
  updatedAt: string;
  servers: StreamServer[];
  isDeleted: boolean;
}

export enum AdminRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor'
}

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
}
