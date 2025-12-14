
export enum EventCategory {
  FOOTBALL = 'Football',
  NBA = 'NBA',
  NFL = 'NFL',
  DARTS = 'Darts',
  MOTORSPORTS = 'Motorsports',
  BOXING = 'Boxing',
  UFC = 'UFC',
  CRICKET = 'Cricket',
  HOCKEY = 'Hockey',
  OTHER = 'Other Sports'
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
  status: EventStatus; // This will now be treated as a derived property in UI
  stadium: string;
  description: string;
  imageUrl: string;
  teamALogoUrl?: string;
  teamBLogoUrl?: string;
  leagueLogoUrl?: string;
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

/**
 * Derives the event status based on current time
 */
export const calculateEventStatus = (startTime: string, endTime: string): EventStatus => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return EventStatus.UPCOMING;
  if (now >= start && now < end) return EventStatus.LIVE;
  return EventStatus.ENDED;
};
