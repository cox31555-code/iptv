
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SportEvent, AdminUser } from './types.ts';
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
  const [events, setEvents] = useState<SportEvent[]>(() => {
    const saved = localStorage.getItem('ajsports_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('ajsports_admin');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('ajsports_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem('ajsports_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('ajsports_admin');
    }
  }, [admin]);

  // Scheduled deletion logic runner
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setEvents(prev => prev.map(event => {
        if (!event.isDeleted && event.deleteAt && new Date(event.deleteAt) <= now) {
          return { ...event, isDeleted: true };
        }
        return event;
      }));
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const addEvent = useCallback((event: SportEvent) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  const updateEvent = useCallback((updated: SportEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
  }, []);

  const login = useCallback((user: AdminUser) => setAdmin(user), []);
  const logout = useCallback(() => setAdmin(null), []);

  return (
    <AppContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, admin, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
