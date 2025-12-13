
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SportEvent, AdminUser, calculateEventStatus } from './types.ts';
import { INITIAL_EVENTS } from './mockData.ts';

interface AppContextType {
  events: SportEvent[];
  addEvent: (event: SportEvent) => void;
  updateEvent: (event: SportEvent) => void;
  deleteEvent: (id: string) => void;
  admin: AdminUser | null;
  login: (user: AdminUser) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawEvents, setRawEvents] = useState<SportEvent[]>(() => {
    const saved = localStorage.getItem('ajsports_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  // Derived events with automated status
  const events = useMemo(() => {
    return rawEvents.map(event => ({
      ...event,
      status: calculateEventStatus(event.startTime, event.endTime)
    }));
  }, [rawEvents]);

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('ajsports_admin');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('ajsports_events', JSON.stringify(rawEvents));
  }, [rawEvents]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem('ajsports_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('ajsports_admin');
    }
  }, [admin]);

  // Scheduled deletion and status refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setRawEvents(prev => prev.map(event => {
        // Auto-delete if reached deleteAt time
        if (!event.isDeleted && event.deleteAt && new Date(event.deleteAt) <= now) {
          return { ...event, isDeleted: true };
        }
        return event;
      }));
    }, 30000); // Check every 30 seconds for smoother transitions
    return () => clearInterval(interval);
  }, []);

  const addEvent = useCallback((event: SportEvent) => {
    setRawEvents(prev => [event, ...prev]);
  }, []);

  const updateEvent = useCallback((updated: SportEvent) => {
    setRawEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setRawEvents(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
  }, []);

  const login = useCallback((user: AdminUser) => setAdmin(user), []);
  const logout = useCallback(() => setAdmin(null), []);

  return (
    <AppContext.Provider value={{ 
      events, addEvent, updateEvent, deleteEvent, admin, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
