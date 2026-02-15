import { SportEvent, Team, League, AdminUser } from './types';
import { createRequestKey } from './utils/eventHelpers';

const API_BASE_URL = 'https://api.ajsports.ch';

// In-flight request deduplication cache
const inFlightRequests = new Map<string, Promise<any>>();

// Helper to get headers with proper content type
const getHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

// Helper to get fetch options with credentials for cookie-based auth
const getFetchOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    credentials: 'include', // Always send cookies
  };
};

// Deduplicate in-flight GET requests only
const fetchWithDedup = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const method = options.method || 'GET';
  
  // Only deduplicate GET requests
  if (method === 'GET') {
    const key = createRequestKey(url, method);
    
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key)!;
    }
    
    const promise = fetch(url, options).finally(() => {
      inFlightRequests.delete(key);
    });
    
    inFlightRequests.set(key, promise);
    return promise;
  }
  
  return fetch(url, options);
};

// ============ EVENTS ============

export const getEvents = async (): Promise<SportEvent[]> => {
  const response = await fetch(`${API_BASE_URL}/api/events`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch events');
  return result.data;
};

export const getEventById = async (id: string): Promise<SportEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch event');
  return result.data;
};

export const createEvent = async (event: SportEvent): Promise<SportEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(event),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to create event');
  return result.data;
};

export const updateEvent = async (id: string, event: Partial<SportEvent>): Promise<SportEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, getFetchOptions({
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(event),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to update event');
  return result.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, getFetchOptions({
    method: 'DELETE',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete event');
};

// ============ TEAMS ============

export const getTeams = async (): Promise<Team[]> => {
  const response = await fetch(`${API_BASE_URL}/api/teams`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch teams');
  return result.data;
};

export const getTeamById = async (id: string): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${id}`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch team');
  return result.data;
};

export const createTeam = async (team: Team): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/api/teams`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(team),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to create team');
  return result.data;
};

export const updateTeam = async (id: string, team: Partial<Team>): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${id}`, getFetchOptions({
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(team),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to update team');
  return result.data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${id}`, getFetchOptions({
    method: 'DELETE',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete team');
};

// ============ LEAGUES ============

export const getLeagues = async (): Promise<League[]> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch leagues');
  return result.data;
};

export const getLeagueById = async (id: string): Promise<League> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${id}`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch league');
  return result.data;
};

export const createLeague = async (league: League): Promise<League> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(league),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to create league');
  return result.data;
};

export const updateLeague = async (id: string, league: Partial<League>): Promise<League> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${id}`, getFetchOptions({
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(league),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to update league');
  return result.data;
};

export const deleteLeague = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${id}`, getFetchOptions({
    method: 'DELETE',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete league');
};

export const uploadLeagueBackground = async (leagueId: string, file: File): Promise<{ backgroundImageUrl: string }> => {
  const formData = new FormData();
  formData.append('background', file);

  const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}/background`, getFetchOptions({
    method: 'POST',
    body: formData,
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to upload league background');
  return result.data;
};

export const deleteLeagueBackground = async (leagueId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}/background`, getFetchOptions({
    method: 'DELETE',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete league background');
};

export const uploadLeagueLogo = async (leagueId: string, file: File): Promise<{ logoUrl: string }> => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}/logo`, getFetchOptions({
    method: 'POST',
    body: formData,
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to upload league logo');
  return result.data;
};

export const deleteLeagueLogo = async (leagueId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}/logo`, getFetchOptions({
    method: 'DELETE',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete league logo');
};

// ============ AUTH ============

export interface LoginResponse {
  token: string;
  expiresIn: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Login failed');
  return result.data;
};

export const validateSession = async (): Promise<AdminUser> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/me`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Session invalid');
  return result.data;
};

export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Logout failed');
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to change password');
};

// ============ UPLOADS ============

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export const uploadCoverImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/upload/cover-image`, getFetchOptions({
    method: 'POST',
    body: formData,
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to upload image');
  return result.data;
};

export const deleteCoverImage = async (filename: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/upload/cover-image`, getFetchOptions({
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ filename }),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete image');
};

export const getFullImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed}`;
};

// ============ COVER GENERATION ============

export const getEventCoverUrl = (eventId: string): string => {
  return `${API_BASE_URL}/api/events/${eventId}/cover.webp`;
};

// ============ SCRAPER ============

export interface ScraperStatus {
  running: boolean;
  lastScrapeTime: string | null;
  lastScrapeResult: {
    success: boolean;
    matchesFound: number;
    eventsCreated: number;
    eventsSkipped: number;
    duration: number;
    error?: string;
  } | null;
}

export const getScraperStatus = async (): Promise<ScraperStatus> => {
  const response = await fetch(`${API_BASE_URL}/api/scraper/status`, getFetchOptions());
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to get scraper status');
  return result.data;
};

export const triggerScrape = async (): Promise<{ startTime: string; status: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/scraper/start`, getFetchOptions({
    method: 'POST',
    headers: getHeaders(),
  }));
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to start scraper');
  return result.data;
};
