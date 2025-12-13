
import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  Trash2, 
  Edit3, 
  Activity, 
  Clock, 
  Copy,
  Eye,
  ArrowLeft,
  Star
} from 'lucide-react';
import { EventStatus, SportEvent } from '../../types';
import Logo from '../../components/Logo.tsx';

const Dashboard: React.FC = () => {
  const { admin, events, logout, deleteEvent, addEvent } = useApp();
  const [tab, setTab] = useState<'active' | 'deleted'>('active');

  if (!admin) return <Navigate to="/admin/login" />;

  const filtered = events.filter(e => tab === 'active' ? !e.isDeleted : e.isDeleted);
  
  const stats = {
    live: events.filter(e => !e.isDeleted && e.status === EventStatus.LIVE).length,
    upcoming: events.filter(e => !e.isDeleted && e.status === EventStatus.UPCOMING).length,
    deletions: events.filter(e => !e.isDeleted && e.deleteAt).length,
  };

  const handleDuplicate = (event: SportEvent) => {
    const duplicated = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teams: `${event.teams} (Copy)`,
    };
    addEvent(duplicated);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1F2833] border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10">
          <Link to="/" className="block">
            <Logo className="h-12" />
          </Link>
          <div className="mt-4 p-3 bg-[#0B0C10] rounded-xl">
            <p className="text-xs text-white/40 mb-1 uppercase font-bold">Logged in as</p>
            <p className="text-sm font-medium">{admin.username}</p>
            <span className="text-[10px] bg-[#04C4FC]/10 text-[#04C4FC] px-1.5 py-0.5 rounded">{admin.role}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-[#04C4FC] text-[#0B0C10] rounded-xl font-bold transition-all">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Eye className="w-4 h-4" /> Public View
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all w-full text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>

        <div className="mt-10 p-4 bg-[#0B0C10] rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/30 uppercase font-bold mb-4">Support & Help</p>
          <a href="https://ai.google.dev/gemini-api/docs/billing" className="text-xs text-[#04C4FC] hover:underline" target="_blank" rel="noreferrer">
            API Documentation
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-white/40 text-sm">Real-time status of your streaming platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Website
            </Link>
            <Link to="/admin/events/new" className="flex items-center justify-center gap-2 bg-[#04C4FC] text-[#0B0C10] px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Activity className="text-green-500" />} label="Live Events" value={stats.live} />
          <StatCard icon={<Clock className="text-blue-400" />} label="Upcoming" value={stats.upcoming} />
          <StatCard icon={<Trash2 className="text-red-400" />} label="Pending Deletion" value={stats.deletions} />
        </div>

        {/* Table */}
        <div className="bg-[#1F2833] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => setTab('active')}
                className={`text-sm font-bold pb-2 border-b-2 transition-all ${tab === 'active' ? 'border-[#04C4FC] text-[#04C4FC]' : 'border-transparent text-white/40'}`}
              >
                Active Events
              </button>
              <button 
                onClick={() => setTab('deleted')}
                className={`text-sm font-bold pb-2 border-b-2 transition-all ${tab === 'deleted' ? 'border-red-400 text-red-400' : 'border-transparent text-white/40'}`}
              >
                Soft Deleted
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0C10]/50 text-white/30 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Servers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(event => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-white group-hover:text-[#04C4FC] transition-colors">{event.teams}</div>
                        {/* Wrap Star icon in a span to use title attribute since Lucide icons don't support it directly */}
                        {event.isSpecial && (
                          <span title="Special Event">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/40">{event.league}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        event.status === EventStatus.LIVE ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-white/60">
                      {new Date(event.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-white/60 font-bold text-[10px] uppercase tracking-wider">{event.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {event.servers.map((s, idx) => (
                          <div key={s.id} className={`w-6 h-6 rounded-full border border-[#1F2833] bg-[#04C4FC] flex items-center justify-center text-[8px] font-bold text-[#0B0C10] ${!s.isActive && 'opacity-30'}`} title={s.name}>
                            {idx + 1}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/events/edit/${event.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDuplicate(event)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteEvent(event.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500/60 hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 flex items-center gap-6">
    <div className="p-4 bg-[#0B0C10] rounded-2xl">
      {/* Use any cast to satisfy TypeScript when cloning Lucide icon elements with className */}
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
    </div>
    <div>
      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

export default Dashboard;
