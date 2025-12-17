import { SportEvent, Team, AdminUser } from './types';

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
