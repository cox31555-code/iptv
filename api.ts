import { SportEvent, Team, League, AdminUser } from './types';

const API_BASE_URL = 'https://api.ajsports.ch';

// Token storage (in memory)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// ============ EVENTS ============

export const getEvents = async (): Promise<SportEvent[]> => {
  const response = await fetch(`${API_BASE_URL}/api/events`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch events');
  return result.data;
};

export const getEventById = async (id: string): Promise<SportEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch event');
  return result.data;
};

export const createEvent = async (event: SportEvent): Promise<SportEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to create event');
  return result.data;
};

export const updateEvent = async (id: string, event: Partial<SportEvent>): Promise<SportEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to update event');
  return result.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete event');
};

// ============ TEAMS ============

export const getTeams = async (): Promise<Team[]> => {
  const response = await fetch(`${API_BASE_URL}/api/teams`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch teams');
  return result.data;
};

export const getTeamById = async (id: string): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${id}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch team');
  return result.data;
};

export const createTeam = async (team: Team): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/api/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(team),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to create team');
  return result.data;
};

export const updateTeam = async (id: string, team: Partial<Team>): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(team),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to update team');
  return result.data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete team');
};

// ============ LEAGUES ============

export const getLeagues = async (): Promise<League[]> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch leagues');
  return result.data;
};

export const getLeagueById = async (id: string): Promise<League> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${id}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch league');
  return result.data;
};

export const createLeague = async (league: League): Promise<League> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(league),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to create league');
  return result.data;
};

export const updateLeague = async (id: string, league: Partial<League>): Promise<League> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(league),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to update league');
  return result.data;
};

export const deleteLeague = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/leagues/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete league');
};

// ============ AUTH ============

export interface LoginResponse {
  token: string;
  expiresIn: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Login failed');
  
  // Store the token
  setAuthToken(result.data.token);
  return result.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to change password');
};

export const logout = () => {
  setAuthToken(null);
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

  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/upload/cover-image`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to upload image');
  return result.data;
};

export const deleteCoverImage = async (filename: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/upload/cover-image`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ filename }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete image');
};

export const getFullImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL}${url}`;
};

// ============ COVER GENERATION ============

export const getEventCoverUrl = (eventId: string): string => {
  return `${API_BASE_URL}/api/events/${eventId}/cover.png`;
};
