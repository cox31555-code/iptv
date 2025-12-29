import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext.tsx';
import { ToastProvider } from './admin/components/Toast.tsx';
import { ConfirmDialogProvider } from './admin/components/ConfirmDialog.tsx';
import { initViewabilityTracking } from './utils/adViewability.ts';
import { AD_ZONES, AD_RETRY_BACKOFF, AD_MAX_RETRIES, AD_ZONE_DELAY, ZONE_MAPPING } from './constants.ts';
import ProtectedRoute from './admin/components/ProtectedRoute.tsx';

// Lazy load route components for better performance
const Home = lazy(() => import('./pages/Public/Home.tsx'));
const Watch = lazy(() => import('./pages/Public/Watch.tsx'));
const CategoryPage = lazy(() => import('./pages/Public/CategoryPage.tsx'));
const NotFound = lazy(() => import('./pages/Public/NotFound.tsx'));
const Login = lazy(() => import('./pages/Admin/Login.tsx'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard.tsx'));
const EventEditor = lazy(() => import('./pages/Admin/EventEditor.tsx'));
const Settings = lazy(() => import('./pages/Admin/Settings.tsx'));
const Teams = lazy(() => import('./pages/Admin/Teams.tsx'));
const Leagues = lazy(() => import('./pages/Admin/Leagues.tsx'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-[#04C4FC] text-lg">Loading...</div>
  </div>
);

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

  // Determine which zone to use based on current route
  const getZoneForRoute = (pathname: string): string => {
    if (pathname === '/') return ZONE_MAPPING.home;
    if (pathname.startsWith('/watch/')) return ZONE_MAPPING.watch;
    // Category pages match pattern /:categorySlug (single segment, not /watch or /admin)
    if (pathname.match(/^\/[^\/]+$/)) return ZONE_MAPPING.category;
    return ZONE_MAPPING.default;
  };

  const runAllZones = () => {
    if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
      const currentZone = getZoneForRoute(location.pathname);
      try {
        window.aclib.runAutoTag({ zoneId: currentZone });
        console.log(`[AdManager] Running zone ${currentZone} for route ${location.pathname}`);
      } catch (e) {
        console.error(`Ad lib execution error for zone ${currentZone}:`, e);
      }
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
              <Suspense fallback={<LoadingFallback />}>
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
              </Suspense>
            </div>
          </BrowserRouter>
        </ConfirmDialogProvider>
      </ToastProvider>
    </AppProvider>
  );
};

export default App;
