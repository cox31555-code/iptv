import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext.tsx';
import { ToastProvider } from './admin/components/Toast.tsx';
import { ConfirmDialogProvider } from './admin/components/ConfirmDialog.tsx';
import { initViewabilityTracking } from './utils/adViewability.ts';
import { AD_ZONES, AD_RETRY_BACKOFF, AD_MAX_RETRIES, AD_ZONE_DELAY } from './constants.ts';
import Home from './pages/Public/Home.tsx';
import Watch from './pages/Public/Watch.tsx';
import CategoryPage from './pages/Public/CategoryPage.tsx';
import NotFound from './pages/Public/NotFound.tsx';
import Login from './pages/Admin/Login.tsx';
import Dashboard from './pages/Admin/Dashboard.tsx';
import EventEditor from './pages/Admin/EventEditor.tsx';
import Settings from './pages/Admin/Settings.tsx';
import Teams from './pages/Admin/Teams.tsx';
import Leagues from './pages/Admin/Leagues.tsx';
import ProtectedRoute from './admin/components/ProtectedRoute.tsx';

declare global {
  interface Window {
    aclib?: {
      runAutoTag: (options: { zoneId: string }) => void;
    };
  }
}

const AdManager: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const rafIdRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);

  const runAllZones = () => {
    if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
      AD_ZONES.forEach((zoneId, index) => {
        setTimeout(() => {
          try {
            window.aclib.runAutoTag({ zoneId });
          } catch (e) {
            console.error(`Ad lib execution error for zone ${zoneId}:`, e);
          }
        }, index * AD_ZONE_DELAY);
      });
      return true;
    }
    return false;
  };

  // Initial load with bounded backoff retry
  useEffect(() => {
    if (isAdminPage) return;

    if (runAllZones()) {
      retryCountRef.current = 0;
      return;
    }

    retryCountRef.current = 0;
    const checkAclib = setInterval(() => {
      retryCountRef.current++;
      const backoffIndex = Math.min(retryCountRef.current - 1, AD_RETRY_BACKOFF.length - 1);
      const delay = AD_RETRY_BACKOFF[backoffIndex];
      
      if (runAllZones() || retryCountRef.current >= AD_MAX_RETRIES) {
        clearInterval(checkAclib);
      }
    }, AD_RETRY_BACKOFF[0]);

    return () => clearInterval(checkAclib);
  }, [isAdminPage]);

  // Route change ad refresh with rAF coalescing
  useEffect(() => {
    if (isAdminPage) return;

    // Cancel pending rAF if route changes again
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Schedule refresh on next frame
    rafIdRef.current = requestAnimationFrame(() => {
      runAllZones();
      rafIdRef.current = null;
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isAdminPage, location.pathname]);

  // Periodic refresh every 45s
  useEffect(() => {
    if (isAdminPage) return;

    const refreshInterval = setInterval(runAllZones, 45000);
    return () => clearInterval(refreshInterval);
  }, [isAdminPage]);

  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    initViewabilityTracking();
  }, []);

  return (
    <AppProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <BrowserRouter>
            <div className="bg-[#0B0C10] text-[#E6E6E6] min-h-screen">
              <AdManager />
              <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
            <Route path="/admin/leagues" element={<ProtectedRoute><Leagues /></ProtectedRoute>} />
            <Route path="/admin/events/new" element={<ProtectedRoute><EventEditor /></ProtectedRoute>} />
            <Route path="/admin/events/edit/:id" element={<ProtectedRoute><EventEditor /></ProtectedRoute>} />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/watch/:eventSlug" element={<Watch />} />
            <Route path="/:categorySlug" element={<CategoryPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ConfirmDialogProvider>
      </ToastProvider>
    </AppProvider>
  );
};

export default App;
