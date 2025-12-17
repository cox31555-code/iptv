import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext.tsx';
import Home from './pages/Public/Home.tsx';
import Watch from './pages/Public/Watch.tsx';
import CategoryPage from './pages/Public/CategoryPage.tsx';
import NotFound from './pages/Public/NotFound.tsx';
import Login from './pages/Admin/Login.tsx';
import Dashboard from './pages/Admin/Dashboard.tsx';
import EventEditor from './pages/Admin/EventEditor.tsx';
import Settings from './pages/Admin/Settings.tsx';
import Teams from './pages/Admin/Teams.tsx';

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

  useEffect(() => {
    // Don't run ads on admin pages
    if (isAdminPage) {
      return;
    }

    // Run the ad tag on public pages
    const runAdTag = () => {
      if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
        try {
          window.aclib.runAutoTag({ zoneId: 'v73cub7u8a' });
        } catch (e) {
          console.error('Ad lib execution error:', e);
        }
        return true;
      }
      return false;
    };

    // Try immediately, if not ready, retry with interval
    if (!runAdTag()) {
      let retryCount = 0;
      const checkAclib = setInterval(() => {
        retryCount++;
        if (runAdTag() || retryCount > 50) {
          clearInterval(checkAclib);
        }
      }, 100);

      return () => clearInterval(checkAclib);
    }
  }, [isAdminPage, location.pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="bg-[#0B0C10] text-[#E6E6E6] min-h-screen">
          <AdManager />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/teams" element={<Teams />} />
            <Route path="/admin/events/new" element={<EventEditor />} />
            <Route path="/admin/events/edit/:id" element={<EventEditor />} />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/watch/:eventSlug" element={<Watch />} />
            <Route path="/:categorySlug" element={<CategoryPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
