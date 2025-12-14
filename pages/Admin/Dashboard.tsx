import React, { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  Trash2, 
  Edit3, 
  Activity, 
  Clock, 
  Eye,
  Star,
  Settings as SettingsIcon,
  Search,
  Filter,
  Users,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { EventStatus, SportEvent, EventCategory } from '../../types';
import Logo from '../../components/Logo.tsx';

const Dashboard: React.FC = () => {
  const { admin, events, logout, deleteEvent, addEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  if (!admin) return <Navigate to="/admin/login" />;
  
  const stats = {
    live: events.filter(e => e.status === EventStatus.LIVE).length,
    upcoming: events.filter(e => e.status === EventStatus.UPCOMING).length,
    deletions: events.filter(e => e.deleteAt).length,
  };

  const filteredAndSortedEvents = useMemo(() => {
    return [...events]
      .filter(event => {
        const matchesSearch = 
          event.teams.toLowerCase().includes(searchTerm.toLowerCase()) || 
          event.league.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, searchTerm, categoryFilter]);

  const confirmDelete = (id: string, teams: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete "${teams}"? This will also purge all uploaded images for this event.`)) {
      deleteEvent(id);
    }
  };

  const StatusBadge = ({ status }: { status: EventStatus }) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
      status === EventStatus.LIVE ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
      status === EventStatus.UPCOMING ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
      'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
    }`}>
      {status}
    </span>
  );

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
            <p className="text-sm font-medium text-white">{admin.username}</p>
            <span className="text-[10px] bg-[#04C4FC]/10 text-[#04C4FC] px-1.5 py-0.5 rounded font-black uppercase">{admin.role}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-[#04C4FC] text-[#0B0C10] rounded-xl font-bold transition-all">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/teams" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Users className="w-4 h-4" /> Teams
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <SettingsIcon className="w-4 h-4" /> Settings
          </Link>
          <div className="h-px bg-white/5 my-4 mx-2" />
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all w-full text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">Dashboard</h1>
            <p className="text-white/40 text-sm font-medium">Manage your active streams and coverage</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/events/new" className="flex items-center justify-center gap-2 bg-[#04C4FC] text-[#0B0C10] px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(4,196,252,0.2)] w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          <StatCard icon={<Activity className="text-green-500" />} label="Live Streams" value={stats.live} />
          <StatCard icon={<Clock className="text-blue-400" />} label="Upcoming" value={stats.upcoming} />
          <StatCard icon={<Trash2 className="text-red-400" />} label="Scheduled Cleanup" value={stats.deletions} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#04C4FC] transition-colors" />
            <input 
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1F2833] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#04C4FC] outline-none text-white transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#1F2833] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm focus:ring-1 focus:ring-[#04C4FC] outline-none text-white transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {Object.values(EventCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile List View (Visible on small screens) */}
        <div className="block md:hidden space-y-4">
          {filteredAndSortedEvents.length === 0 ? (
            <div className="py-20 text-center bg-[#1F2833] rounded-2xl border border-white/5 text-zinc-600 font-bold uppercase tracking-widest text-xs">
              No events found.
            </div>
          ) : filteredAndSortedEvents.map(event => (
            <div key={event.id} className="bg-[#1F2833] rounded-2xl border border-white/5 p-5 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white leading-tight">{event.teams}</h3>
                    {event.isSpecial && <Star className="w-3 h-3 text-yellow-500 fill-current shrink-0" />}
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase">{event.league}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
              
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-xs font-medium">
                  {new Date(event.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link 
                  to={`/admin/events/edit/${event.id}`} 
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors border border-white/5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest">Edit</span>
                </Link>
                <button 
                  onClick={() => confirmDelete(event.id, event.teams)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-colors border border-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (Visible on md and up) */}
        <div className="hidden md:block bg-[#1F2833] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0C10]/50 text-white/30 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-5">Event Detail</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Kickoff</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                      No events found.
                    </td>
                  </tr>
                ) : filteredAndSortedEvents.map(event => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-white group-hover:text-[#04C4FC] transition-colors">{event.teams}</div>
                        {event.isSpecial && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      </div>
                      <div className="text-[10px] text-white/30 font-bold uppercase">{event.league}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white/50">
                      {new Date(event.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link to={`/admin/events/edit/${event.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => confirmDelete(event.id, event.teams)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500/50 hover:text-red-500">
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
  <div className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]">
    <div className="p-4 bg-[#0B0C10] rounded-2xl border border-white/5">
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
    </div>
    <div>
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

export default Dashboard;