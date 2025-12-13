
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext.tsx';
import Home from './pages/Public/Home.tsx';
import Watch from './pages/Public/Watch.tsx';
import CategoryPage from './pages/Public/CategoryPage.tsx';
import Login from './pages/Admin/Login.tsx';
import Dashboard from './pages/Admin/Dashboard.tsx';
import EventEditor from './pages/Admin/EventEditor.tsx';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="bg-[#0B0C10] text-[#E6E6E6] min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/events/new" element={<EventEditor />} />
            <Route path="/admin/events/edit/:id" element={<EventEditor />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
