
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  ExternalLink,
  Info,
  Clock,
  Settings,
  Play,
  Image as ImageIcon,
  Upload,
  X,
  Star,
  Layout,
  MapPin
} from 'lucide-react';
import { EventCategory, EventStatus, StreamServer, SportEvent, calculateEventStatus } from '../../types.ts';

const EventEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, addEvent, updateEvent } = useApp();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const teamALogoRef = useRef<HTMLInputElement>(null);
  const teamBLogoRef = useRef<HTMLInputElement>(null);
  const leagueLogoRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<SportEvent>>({
    teams: '',
    league: '',
    category: EventCategory.FOOTBALL,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
    stadium: '',
    description: '',
    imageUrl: '',
    teamALogoUrl: '',
    teamBLogoUrl: '',
    leagueLogoUrl: '',
    isSpecial: false,
    pinPriority: 0,
    deleteAt: null,
    servers: []
  });

  const [newServer, setNewServer] = useState<Partial<StreamServer>>({
    name: '',
    embedUrl: '',
    isActive: true,
    isDefault: false
  });

  const [previewServer, setPreviewServer] = useState<StreamServer | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = events.find(e => e.id === id);
      if (existing) {
        setFormData({
          ...existing,
          startTime: existing.startTime.slice(0, 16),
          endTime: existing.endTime.slice(0, 16),
        });
        const defaultServer = existing.servers.find(s => s.isDefault) || existing.servers[0];
        if (defaultServer) setPreviewServer(defaultServer);
      }
    }
  }, [id, events]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SportEvent) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please choose a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: keyof SportEvent) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = () => {
    const startTime = formData.startTime ? new Date(formData.startTime).toISOString() : new Date().toISOString();
    const endTime = formData.endTime ? new Date(formData.endTime).toISOString() : new Date(Date.now() + 7200000).toISOString();

    const finalData: SportEvent = {
      id: id && id !== 'new' ? id : Math.random().toString(36).substr(2, 9),
      createdAt: (formData as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: (formData as any).isDeleted || false,
      stadium: formData.stadium || '',
      description: formData.description || '', // Keep internal compatibility but hidden from UI
      ...formData,
      startTime,
      endTime,
      status: calculateEventStatus(startTime, endTime),
      servers: formData.servers || [],
    } as SportEvent;

    if (id && id !== 'new') {
      updateEvent(finalData);
    } else {
      addEvent(finalData);
    }
    navigate('/admin');
  };

  const addServer = () => {
    if (!newServer.name || !newServer.embedUrl) return;
    const server: StreamServer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newServer.name,
      embedUrl: newServer.embedUrl,
      isActive: newServer.isActive!,
      isDefault: newServer.isDefault!,
      sortOrder: (formData.servers?.length || 0) + 1
    };
    
    const updatedServers = server.isDefault 
      ? formData.servers?.map(s => ({ ...s, isDefault: false })) || []
      : formData.servers || [];

    setFormData({ ...formData, servers: [...updatedServers, server] });
    setNewServer({ name: '', embedUrl: '', isActive: true, isDefault: false });
    if (!previewServer) setPreviewServer(server);
  };

  const removeServer = (serverId: string) => {
    const updated = formData.servers?.filter(s => s.id !== serverId);
    setFormData({ ...formData, servers: updated });
    if (previewServer?.id === serverId) {
      setPreviewServer(updated && updated.length > 0 ? updated[0] : null);
    }
  };

  const sportCategories = Object.values(EventCategory);

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-20 text-white">
      <header className="sticky top-0 z-10 bg-[#0B0C10]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">{id === 'new' ? 'Create New Event' : 'Edit Event'}</h1>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#04C4FC] text-[#0B0C10] px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-[#04C4FC] mb-4">
              <Info className="w-4 h-4" />
              <h2 className="font-bold uppercase text-xs tracking-widest">General Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Event Title / Teams</label>
                <input 
                  value={formData.teams}
                  onChange={e => setFormData({ ...formData, teams: e.target.value })}
                  placeholder="e.g. Manchester United vs Real Madrid"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#04C4FC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">League Name</label>
                <input 
                  value={formData.league}
                  onChange={e => setFormData({ ...formData, league: e.target.value })}
                  placeholder="e.g. Champions League"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#04C4FC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#04C4FC] focus:outline-none text-white transition-all"
                >
                  {sportCategories.map(c => <option key={c} value={c} className="bg-[#1F2833]">{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Stadium / Venue</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    value={formData.stadium}
                    onChange={e => setFormData({ ...formData, stadium: e.target.value })}
                    placeholder="e.g. Wembley Stadium"
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#04C4FC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Main Cover Image</label>
                <div className="flex gap-4">
                   <div className="flex-1">
                      <input 
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'imageUrl')}
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-[52px] flex items-center justify-center gap-2 bg-[#0B0C10] border border-dashed border-white/20 rounded-xl px-4 hover:border-[#04C4FC]/50 hover:bg-[#04C4FC]/5 transition-all text-sm text-white/40"
                      >
                        <Upload className="w-4 h-4" />
                        {formData.imageUrl ? 'Change Image' : 'Upload Cover Image'}
                      </button>
                   </div>
                   {formData.imageUrl && (
                     <div className="relative group shrink-0">
                        <div className="w-16 h-12 bg-[#0B0C10] rounded-lg border border-white/10 overflow-hidden">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={() => removeImage('imageUrl')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Start Time</label>
                <input 
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#04C4FC] focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">End Time</label>
                <input 
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#04C4FC] focus:outline-none text-white"
                />
              </div>
            </div>
          </section>

          {/* Matchup Assets */}
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-[#04C4FC] mb-4">
              <Layout className="w-4 h-4" />
              <h2 className="font-bold uppercase text-xs tracking-widest">Matchup Assets</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* League Logo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white/30 uppercase">League Logo</label>
                <div className="relative group aspect-square bg-[#0B0C10] rounded-xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                  {formData.leagueLogoUrl ? (
                    <>
                      <img src={formData.leagueLogoUrl} className="w-full h-full object-contain p-4" alt="League" />
                      <button onClick={() => removeImage('leagueLogoUrl')} className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                    </>
                  ) : (
                    <button onClick={() => leagueLogoRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </button>
                  )}
                  <input type="file" ref={leagueLogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'leagueLogoUrl')} />
                </div>
              </div>

              {/* Team A Logo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white/30 uppercase">Team A Logo</label>
                <div className="relative group aspect-square bg-[#0B0C10] rounded-xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                  {formData.teamALogoUrl ? (
                    <>
                      <img src={formData.teamALogoUrl} className="w-full h-full object-contain p-4" alt="Team A" />
                      <button onClick={() => removeImage('teamALogoUrl')} className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                    </>
                  ) : (
                    <button onClick={() => teamALogoRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </button>
                  )}
                  <input type="file" ref={teamALogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'teamALogoUrl')} />
                </div>
              </div>

              {/* Team B Logo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white/30 uppercase">Team B Logo</label>
                <div className="relative group aspect-square bg-[#0B0C10] rounded-xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                  {formData.teamBLogoUrl ? (
                    <>
                      <img src={formData.teamBLogoUrl} className="w-full h-full object-contain p-4" alt="Team B" />
                      <button onClick={() => removeImage('teamBLogoUrl')} className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                    </>
                  ) : (
                    <button onClick={() => teamBLogoRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </button>
                  )}
                  <input type="file" ref={teamBLogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'teamBLogoUrl')} />
                </div>
              </div>
            </div>
          </section>

          {/* Stream Servers */}
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-[#04C4FC] mb-4">
              <Settings className="w-4 h-4" />
              <h2 className="font-bold uppercase text-xs tracking-widest">Stream Servers</h2>
            </div>

            <div className="space-y-4">
              {formData.servers?.map(server => (
                <div key={server.id} className={`flex items-center gap-4 bg-[#0B0C10] p-4 rounded-xl border transition-all ${previewServer?.id === server.id ? 'border-[#04C4FC]/50 shadow-[0_0_15px_rgba(4,196,252,0.1)]' : 'border-white/5'}`}>
                  <GripVertical className="text-white/10 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{server.name}</span>
                      {server.isDefault && <span className="text-[8px] bg-[#04C4FC]/20 text-[#04C4FC] px-1.5 py-0.5 rounded font-bold uppercase">Default</span>}
                    </div>
                    <div className="text-xs text-white/30 truncate max-w-[200px]">{server.embedUrl}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewServer(server)} className={`p-2 rounded-lg ${previewServer?.id === server.id ? 'bg-[#04C4FC] text-[#0B0C10]' : 'bg-white/5 text-white/40'}`}><Play className="w-4 h-4" /></button>
                    <button onClick={() => removeServer(server.id)} className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}

              <div className="bg-[#0B0C10]/40 p-6 rounded-2xl border border-dashed border-white/10 space-y-4">
                <input 
                  placeholder="Server Name"
                  value={newServer.name}
                  onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[#04C4FC]"
                />
                <input 
                  placeholder="Embed URL"
                  value={newServer.embedUrl}
                  onChange={e => setNewServer({ ...newServer, embedUrl: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[#04C4FC]"
                />
                <label className="flex items-center gap-2 text-xs text-white/40">
                  <input type="checkbox" checked={newServer.isDefault} onChange={e => setNewServer({ ...newServer, isDefault: e.target.checked })} /> Default Server
                </label>
                <button onClick={addServer} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-bold"><Plus className="w-4 h-4 inline mr-2" /> Add Server</button>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="font-bold text-sm">Control Panel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Automated Status</label>
                <div className="px-4 py-2 bg-[#0B0C10] rounded-xl text-xs font-bold border border-white/10 text-white/40">
                   {calculateEventStatus(formData.startTime || '', formData.endTime || '')}
                </div>
                <p className="text-[10px] text-white/20 mt-1 italic">Status updates automatically based on match times.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/30 uppercase mb-2">Pin Priority</label>
                <input 
                  type="number"
                  value={formData.pinPriority}
                  onChange={e => setFormData({ ...formData, pinPriority: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0B0C10] rounded-xl border border-white/5">
                <span className="text-xs font-bold text-white/60">Mark as Special</span>
                <input 
                  type="checkbox"
                  checked={formData.isSpecial}
                  onChange={e => setFormData({ ...formData, isSpecial: e.target.checked })}
                  className="w-5 h-5 accent-[#04C4FC]"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <Clock className="w-4 h-4" />
              <h3 className="font-bold text-sm">Auto Delete</h3>
            </div>
            <input 
              type="datetime-local"
              value={formData.deleteAt ? formData.deleteAt.slice(0, 16) : ''}
              onChange={e => setFormData({ ...formData, deleteAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none text-white"
            />
          </section>

          <div className="aspect-video bg-[#0B0C10] rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center relative">
            {previewServer ? (
              <iframe 
                src={previewServer.embedUrl}
                className="w-full h-full border-none"
                allowFullScreen={true}
                title="Admin Preview"
              />
            ) : (
              <div className="p-6 text-center">
                <ExternalLink className="w-8 h-8 text-white/10 mb-2 mx-auto" />
                <p className="text-xs text-white/30 font-medium italic">Add a server to see preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventEditor;
