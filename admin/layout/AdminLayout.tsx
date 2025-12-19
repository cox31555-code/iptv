import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../AppContext';
import { 
  Activity, 
  LogOut, 
  Settings as SettingsIcon,
  ArrowLeft,
  AlertTriangle,
  Trophy,
  Users
} from 'lucide-react';
import Logo from '../../components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/**
 * AdminLayout - Unified layout for all admin pages
 * Provides consistent sidebar navigation and page structure
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, description, action }) => {
  const { admin, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Activity },
    { path: '/admin/teams', label: 'Teams', icon: Users },
    { path: '/admin/leagues', label: 'Leagues', icon: Trophy },
    { path: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col md:flex-row font-sans text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1F2833] border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10">
          <Link to="/" className="block">
            <Logo className="h-12" />
          </Link>
          <div className="mt-4 p-3 bg-[#0B0C10] rounded-xl">
            <p className="text-xs text-white/40 mb-1 uppercase font-bold">Logged in as</p>
            <p className="text-sm font-medium text-white">{admin?.username}</p>
            <span className="text-[10px] bg-[#04C4FC]/10 text-[#04C4FC] px-1.5 py-0.5 rounded font-black uppercase">
              {admin?.role}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-xs ${
                isActive(path)
                  ? 'bg-[#04C4FC] text-[#0B0C10] font-bold'
                  : 'text-white/50 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
          
          <div className="pt-4 pb-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-4">Development</p>
            <Link 
              to="/this-page-does-not-exist" 
              className="flex items-center gap-3 px-4 py-3 text-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5 rounded-xl font-medium transition-all text-xs border border-dashed border-orange-500/10"
            >
              <AlertTriangle className="w-4 h-4" /> Test 404 Page
            </Link>
          </div>

          <div className="h-px bg-white/5 my-4 mx-2" />
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all w-full text-left text-xs"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
              {title}
            </h1>
            <p className="text-white/40 text-sm font-medium">{description}</p>
          </div>
          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
