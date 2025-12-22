import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext.tsx';
import { ToastProvider } from './admin/components/Toast.tsx';
import { ConfirmDialogProvider } from './admin/components/ConfirmDialog.tsx';
import { initViewabilityTracking } from './utils/adViewability.ts';
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
  const zones = ['v73cub7u8a', 'tqblxpksrg', '9fxj8efkpr'];
  const adRefreshIntervals = new Map<string, NodeJS.Timeout>();

  useEffect(() => {
    if (isAdminPage) return;

    const runAllZones = () => {
      if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
        zones.forEach((zoneId, index) => {
          setTimeout(() => {
            try {
              window.aclib.runAutoTag({ zoneId });
            } catch (e) {
              console.error(`Ad lib execution error for zone ${zoneId}:`, e);
            }
          }, index * 150);
        });
        return true;
      }
      return false;
    };

    if (!runAllZones()) {
      let retryCount = 0;
      const checkAclib = setInterval(() => {
        retryCount++;
        if (runAllZones() || retryCount > 50) {
          clearInterval(checkAclib);
        }
      }, 100);

      return () => clearInterval(checkAclib);
    }
  }, [isAdminPage, location.pathname]);

  useEffect(() => {
    if (isAdminPage) return;

    const refreshAds = () => {
      if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
        zones.forEach((zoneId, index) => {
          setTimeout(() => {
            try {
              window.aclib.runAutoTag({ zoneId });
            } catch (e) {
              console.error(`Ad refresh error for zone ${zoneId}:`, e);
            }
          }, index * 150);
        });
      }
    };

    const refreshInterval = setInterval(refreshAds, 45000);
    return () => clearInterval(refreshInterval);
  }, [isAdminPage, location.pathname]);

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
