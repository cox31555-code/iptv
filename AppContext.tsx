import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SportEvent, AdminUser, calculateEventStatus, Team } from './types';
import * as api from './api';

interface AppContextType {
  events: SportEvent[];
  teams: Team[];
  loading: boolean;
  error: string | null;
  addEvent: (event: SportEvent) => Promise<void>;
  updateEvent: (event: SportEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTeam: (team: Team) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  admin: AdminUser | null;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawEvents, setRawEvents] = useState<SportEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Calculate status for all events
  const events = useMemo(() => {
    return rawEvents.map(event => ({
      ...event,
      status: calculateEventStatus(event.startTime, event.endTime)
    }));
  }, [rawEvents]);

  // Fetch events from API
  const refreshEvents = useCallback(async () => {
    try {
      const data = await api.getEvents();
      setRawEvents(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message);
    }
  }, []);

  // Fetch teams from API
  const refreshTeams = useCallback(async () => {
    try {
      const data = await api.getTeams();
      setTeams(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError(err.message);
    }
  }, []);

  // Validate admin session on mount
  useEffect(() => {
    const validateAdminSession = async () => {
      try {
        const adminData = await api.validateSession();
        setAdmin(adminData);
      } catch (err) {
        // Session invalid or not logged in - this is fine
        setAdmin(null);
      } finally {
        setSessionChecked(true);
      }
    };
    validateAdminSession();
  }, []);

  // Initial data fetch - only fetch events for public pages
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await refreshEvents(); // Teams will be loaded separately when admin logs in
      setLoading(false);
    };
    fetchData();
  }, [refreshEvents]);

  // Lazy load teams when admin is authenticated
  useEffect(() => {
    if (admin && sessionChecked) {
      refreshTeams();
    }
  }, [admin, sessionChecked, refreshTeams]);

  // Periodically refresh events to update status
  // OPTIMIZED: Reduced frequency to 60s and pause when tab is hidden
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      interval = setInterval(() => {
        // Only refresh if document is visible (tab is active)
        if (document.visibilityState === 'visible') {
          refreshEvents();
        }
      }, 60000); // Refresh every 60 seconds (reduced from 30s)
    };
    
    // Handle visibility changes - refresh immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshEvents(); // Immediate refresh when user returns
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshEvents]);

  // Event CRUD operations
  const addEvent = useCallback(async (event: SportEvent) => {
    await api.createEvent(event);
    await refreshEvents();
  }, [refreshEvents]);

  const updateEvent = useCallback(async (updated: SportEvent) => {
    await api.updateEvent(updated.id, updated);
    await refreshEvents();
  }, [refreshEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    await api.deleteEvent(id);
    await refreshEvents();
  }, [refreshEvents]);

  // Team CRUD operations
  const addTeam = useCallback(async (team: Team) => {
    await api.createTeam(team);
    await refreshTeams();
  }, [refreshTeams]);

  const updateTeam = useCallback(async (updated: Team) => {
    await api.updateTeam(updated.id, updated);
    await refreshTeams();
  }, [refreshTeams]);

  const deleteTeam = useCallback(async (id: string) => {
    await api.deleteTeam(id);
    await refreshTeams();
  }, [refreshTeams]);

  // Auth operations
  const loginAdmin = useCallback(async (username: string, password: string) => {
    await api.login(username, password);
    // Validate session after login to get admin data
    const adminData = await api.validateSession();
    setAdmin(adminData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    await api.changePassword(oldPassword, newPassword);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    events, 
    teams, 
    loading,
    error,
    addEvent, 
    updateEvent, 
    deleteEvent, 
    addTeam, 
    updateTeam, 
    deleteTeam,
    admin, 
    loginAdmin,
    logout,
    changePassword,
    refreshEvents,
    refreshTeams
  }), [
    events, 
    teams, 
    loading,
    error,
    addEvent, 
    updateEvent, 
    deleteEvent, 
    addTeam, 
    updateTeam, 
    deleteTeam,
    admin, 
    loginAdmin,
    logout,
    changePassword,
    refreshEvents,
    refreshTeams
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
