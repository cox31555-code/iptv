import React, { useState, useRef } from 'react';
import { useApp } from '../../AppContext.tsx';
import { Navigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Activity, 
  Settings as SettingsIcon,
  Eye,
  LogOut,
  ArrowLeft,
  Upload,
  X,
  Users,
  Search,
  Tag
} from 'lucide-react';
import { Team } from '../../types.ts';
import Logo from '../../components/Logo.tsx';

const Teams: React.FC = () => {
  const { admin, teams, addTeam, deleteTeam, logout } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', logoUrl: '', keywords: '' });
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!admin) return <Navigate to="/admin/login" />;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Logo is too large. Please choose a file smaller than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTeam(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.logoUrl) return;

    addTeam({
      id: Math.random().toString(36).substr(2, 9),
      name: newTeam.name.trim(),
      logoUrl: newTeam.logoUrl,
      keywords: newTeam.keywords.trim()
    });
    setNewTeam({ name: '', logoUrl: '', keywords: '' });
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.keywords && t.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col md:flex-row font-sans text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1F2833] border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10">
          <Link to="/" className="block">
            <Logo className="h-12" />
          </Link>
          <div className="mt-4 p-3 bg-[#0B0C10] rounded-xl">
            <p className="text-xs text-white/40 mb-1 uppercase font-bold">Team Database</p>
            <p className="text-sm font-medium text-white">{admin.username}</p>
            <span className="text-[10px] bg-[#04C4FC]/10 text-[#04C4FC] px-1.5 py-0.5 rounded font-black uppercase">{admin.role}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/teams" className="flex items-center gap-3 px-4 py-3 bg-[#04C4FC] text-[#0B0C10] rounded-xl font-bold transition-all">
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

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">Teams Library</h1>
            <p className="text-white/40 text-sm font-medium">Create and manage teams for faster event creation</p>
          </div>
          <Link 
            to="/admin" 
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Team Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAddTeam} className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl sticky top-8">
              <h2 className="font-black text-[10px] uppercase tracking-[0.25em] text-sky-400 border-b border-white/5 pb-3">Register New Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Team Name</label>
                  <input 
                    required
                    value={newTeam.name}
                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="e.g. Liverpool FC"
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Keywords / Nicknames
                  </label>
                  <input 
                    value={newTeam.keywords}
                    onChange={e => setNewTeam({ ...newTeam, keywords: e.target.value })}
                    placeholder="e.g. Gunners, The Reds"
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Team Logo</label>
                  <div className="relative group aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-sky-500/30">
                    {newTeam.logoUrl ? (
                      <>
                        <img src={newTeam.logoUrl} className="w-full h-full object-contain p-6" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => setNewTeam({ ...newTeam, logoUrl: '' })}
                          className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 text-white shadow-xl active:scale-90"
                        >
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current?.click()} 
                        className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-all"
                      >
                        <Upload className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Logo</span>
                      </button>
                    )}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!newTeam.name || !newTeam.logoUrl}
                className="w-full flex items-center justify-center gap-2 bg-[#04C4FC] text-[#0B0C10] py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100"
              >
                <Plus className="w-4 h-4" /> Register Team
              </button>
            </form>
          </div>

          {/* Teams Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="Lookup teams in library..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#1F2833] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTeams.map(team => (
                <div key={team.id} className="group relative bg-[#1F2833] rounded-2xl border border-white/5 p-4 flex flex-col items-center text-center space-y-3 transition-all hover:border-sky-500/40 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-[#0B0C10] rounded-xl flex items-center justify-center p-2 mb-2">
                    <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="w-full min-h-[40px]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white truncate w-full px-2">{team.name}</h3>
                    {team.keywords && (
                      <p className="text-[8px] text-sky-500/60 font-bold uppercase truncate px-2 mt-1">{team.keywords}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => { if(confirm(`Delete ${team.name}?`)) deleteTeam(team.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {filteredTeams.length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-700 font-black uppercase tracking-[0.3em] text-[10px]">
                  {searchTerm ? 'No results for your query' : 'No teams registered yet'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Teams;