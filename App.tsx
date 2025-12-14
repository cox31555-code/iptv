import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

const AdManager: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminPage) {
      const existingScript = document.getElementById('aclib-script-loader');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      return;
    }

    if (document.getElementById('aclib-script-loader')) return;

    const script = document.createElement('script');
    script.id = 'aclib-script-loader'; 
    script.type = 'text/javascript';
    script.src = '//acscdn.com/script/aclib.js';
    script.async = true;
    
    const execScript = document.createElement('script');
    execScript.type = 'text/javascript';
    execScript.innerHTML = `
      (function() {
        var retryCount = 0;
        var checkAclib = setInterval(function() {
          retryCount++;
          if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
            try {
              window.aclib.runAutoTag({ zoneId: 'tqblxpksrg' });
              clearInterval(checkAclib);
            } catch (e) {
              console.error('Ad lib execution error:', e);
            }
          }
          if (retryCount > 50) clearInterval(checkAclib);
        }, 100);
      })();
    `;

    document.head.appendChild(script);

    script.onload = () => {
      document.head.appendChild(execScript);
    };

    script.onerror = () => {
      console.warn('Advertisement script failed to load. Ad-blocker might be active.');
    };

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (execScript.parentNode) execScript.parentNode.removeChild(execScript);
    };
  }, [isAdminPage]);

  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
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
      </HashRouter>
    </AppProvider>
  );
};

export default App;