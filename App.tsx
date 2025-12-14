
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext.tsx';
import Home from './pages/Public/Home.tsx';
import Watch from './pages/Public/Watch.tsx';
import CategoryPage from './pages/Public/CategoryPage.tsx';
import Login from './pages/Admin/Login.tsx';
import Dashboard from './pages/Admin/Dashboard.tsx';
import EventEditor from './pages/Admin/EventEditor.tsx';
import Settings from './pages/Admin/Settings.tsx';

/**
 * AdManager handles the injection of the advertisement script.
 * It monitors the current route and only runs the ad code if the user is not
 * in the admin panel.
 */
const AdManager: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // If we are on an admin page, do not inject the ad code.
    if (isAdminPage) {
      // Clean up if it exists
      const existingScript = document.getElementById('aclib-script-loader');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      return;
    }

    // Check if script already exists to avoid duplicates
    if (document.getElementById('aclib-script-loader')) return;

    const script = document.createElement('script');
    script.id = 'aclib-script-loader'; 
    script.type = 'text/javascript';
    script.src = '//acscdn.com/script/aclib.js';
    script.async = true;
    
    // Execution script for the auto-tagging
    const execScript = document.createElement('script');
    execScript.type = 'text/javascript';
    execScript.innerHTML = `
      (function() {
        var retryCount = 0;
        var checkAclib = setInterval(function() {
          retryCount++;
          // Ensure window.aclib exists and has the runAutoTag method.
          // We check for the function specifically to avoid TypeErrors.
          if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
            try {
              window.aclib.runAutoTag({ zoneId: 'tqblxpksrg' });
              clearInterval(checkAclib);
            } catch (e) {
              console.error('Ad lib execution error:', e);
            }
          }
          if (retryCount > 50) clearInterval(checkAclib); // Stop after 5 seconds
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

    // Cleanup logic
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
            {/* Admin Routes (Keep these first to avoid matching category slugs) */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/events/new" element={<EventEditor />} />
            <Route path="/admin/events/edit/:id" element={<EventEditor />} />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            
            {/* Category slugs: football, nba, special, other-sports */}
            <Route path="/:categorySlug" element={<CategoryPage />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
