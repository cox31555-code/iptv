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
  Upload,
  X,
  Layout,
  MapPin
} from 'lucide-react';
import { EventCategory, StreamServer, SportEvent, calculateEventStatus } from '../../types.ts';

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
      stadium: formData.stadium || '',
      description: formData.description || '',
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
  const isIndividualSport = [
    EventCategory.MOTORSPORTS,
    EventCategory.DARTS,
    EventCategory.BOXING,
    EventCategory.UFC
  ].includes(formData.category as EventCategory);

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-20 text-white font-sans">
      <header className="sticky top-0 z-20 bg-[#0B0C10]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tighter uppercase">{id === 'new' ? 'Create Event' : 'Edit Event'}</h1>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#04C4FC] text-[#0B0C10] px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(4,196,252,0.2)]"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Info className="w-4 h-4" />
              <h2 className="font-black uppercase text-[10px] tracking-[0.25em]">General Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Event Title / Teams</label>
                <input 
                  value={formData.teams}
                  onChange={e => setFormData({ ...formData, teams: e.target.value })}
                  placeholder="e.g. Manchester United vs Real Madrid"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">League Name</label>
                <input 
                  value={formData.league}
                  onChange={e => setFormData({ ...formData, league: e.target.value })}
                  placeholder="e.g. Champions League"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#04C4FC] focus:outline-none text-white transition-all appearance-none"
                >
                  {sportCategories.map(c => <option key={c} value={c} className="bg-[#1F2833]">{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Stadium / Venue</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    value={formData.stadium}
                    onChange={e => setFormData({ ...formData, stadium: e.target.value })}
                    placeholder="e.g. Wembley Stadium"
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Main Cover Image</label>
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
                        className="w-full h-[52px] flex items-center justify-center gap-2 bg-[#0B0C10] border border-dashed border-white/20 rounded-xl px-4 hover:border-[#04C4FC]/50 hover:bg-[#04C4FC]/5 transition-all text-[10px] font-black uppercase tracking-widest text-white/40"
                      >
                        <Upload className="w-4 h-4" />
                        {formData.imageUrl ? 'Change Cover' : 'Upload Cover'}
                      </button>
                   </div>
                   {formData.imageUrl && (
                     <div className="relative group shrink-0">
                        <div className="w-20 h-13 bg-[#0B0C10] rounded-xl border border-white/10 overflow-hidden">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={() => removeImage('imageUrl')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg active:scale-90"
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
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Start Time</label>
                <input 
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] focus:outline-none text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">End Time</label>
                <input 
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] focus:outline-none text-white transition-all"
                />
              </div>
            </div>
          </section>

          {/* Matchup Assets */}
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Layout className="w-4 h-4" />
              <h2 className="font-black uppercase text-[10px] tracking-[0.25em]">Matchup Assets</h2>
            </div>
            
            <div className={`grid grid-cols-1 ${isIndividualSport ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
              <div className={`space-y-3 text-center ${isIndividualSport ? 'max-w-xs mx-auto w-full' : ''}`}>
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {isIndividualSport ? 'Event / League Logo' : 'League Logo'}
                </label>
                <div className="relative group aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-sky-500/30">
                  {formData.leagueLogoUrl ? (
                    <>
                      <img src={formData.leagueLogoUrl} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" alt="League" />
                      <button onClick={() => removeImage('leagueLogoUrl')} className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-xl active:scale-90"><X className="w-3.5 h-3.5"/></button>
                    </>
                  ) : (
                    <button onClick={() => leagueLogoRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-all">
                      <Upload className="w-7 h-7" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                    </button>
                  )}
                  <input type="file" ref={leagueLogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'leagueLogoUrl')} />
                </div>
              </div>

              {!isIndividualSport && (
                <>
                  <div className="space-y-3 text-center">
                    <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest">Team A Logo</label>
                    <div className="relative group aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-sky-500/30">
                      {formData.teamALogoUrl ? (
                        <>
                          <img src={formData.teamALogoUrl} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" alt="Team A" />
                          <button onClick={() => removeImage('teamALogoUrl')} className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-xl active:scale-90"><X className="w-3.5 h-3.5"/></button>
                        </>
                      ) : (
                        <button onClick={() => teamALogoRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-all">
                          <Upload className="w-7 h-7" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                        </button>
                      )}
                      <input type="file" ref={teamALogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'teamALogoUrl')} />
                    </div>
                  </div>

                  <div className="space-y-3 text-center">
                    <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest">Team B Logo</label>
                    <div className="relative group aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-sky-500/30">
                      {formData.teamBLogoUrl ? (
                        <>
                          <img src={formData.teamBLogoUrl} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" alt="Team B" />
                          <button onClick={() => removeImage('teamBLogoUrl')} className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-xl active:scale-90"><X className="w-3.5 h-3.5"/></button>
                        </>
                      ) : (
                        <button onClick={() => teamBLogoRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-all">
                          <Upload className="w-7 h-7" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                        </button>
                      )}
                      <input type="file" ref={teamBLogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'teamBLogoUrl')} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Stream Servers */}
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Settings className="w-4 h-4" />
              <h2 className="font-black uppercase text-[10px] tracking-[0.25em]">Stream Sources</h2>
            </div>

            <div className="space-y-4">
              {formData.servers?.map(server => (
                <div key={server.id} className={`flex items-center gap-4 bg-[#0B0C10] p-4 rounded-xl border transition-all ${previewServer?.id === server.id ? 'border-[#04C4FC]/50 shadow-[0_0_15px_rgba(4,196,252,0.1)]' : 'border-white/5'}`}>
                  <GripVertical className="text-white/10 cursor-move" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{server.name}</span>
                      {server.isDefault && <span className="text-[7px] bg-[#04C4FC]/20 text-[#04C4FC] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Default</span>}
                    </div>
                    <div className="text-[10px] text-white/20 truncate mt-0.5 font-mono">{server.embedUrl}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPreviewServer(server)} className={`p-2.5 rounded-xl transition-all ${previewServer?.id === server.id ? 'bg-[#04C4FC] text-[#0B0C10] shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'}`}><Play className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeServer(server.id)} className="p-2.5 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-xl transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

              <div className="bg-[#0B0C10]/40 p-6 rounded-2xl border border-dashed border-white/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    placeholder="Source Label (e.g. Server 1 HD)"
                    value={newServer.name}
                    onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-[#04C4FC] transition-all"
                  />
                  <input 
                    placeholder="Embed / Stream URL"
                    value={newServer.embedUrl}
                    onChange={e => setNewServer({ ...newServer, embedUrl: e.target.value })}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-[#04C4FC] transition-all"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase cursor-pointer group">
                    <input type="checkbox" checked={newServer.isDefault} onChange={e => setNewServer({ ...newServer, isDefault: e.target.checked })} className="w-3.5 h-3.5 accent-sky-500" /> 
                    <span className="group-hover:text-white transition-colors">Set as Default Source</span>
                  </label>
                  <button onClick={addServer} className="px-5 py-2.5 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500 hover:text-black text-sky-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><Plus className="w-3.5 h-3.5 inline mr-1.5" /> Add Source</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl">
            <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-white/50 border-b border-white/5 pb-3">Publication Controls</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Automated Lifecycle</label>
                <div className="px-4 py-2.5 bg-[#0B0C10] rounded-xl text-[10px] font-black border border-white/10 text-white/50 uppercase tracking-widest text-center">
                   {calculateEventStatus(formData.startTime || '', formData.endTime || '')}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Pin Priority (Sorting)</label>
                <input 
                  type="number"
                  value={formData.pinPriority}
                  onChange={e => setFormData({ ...formData, pinPriority: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0B0C10] rounded-2xl border border-white/5 group hover:border-sky-500/20 transition-all cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Premium Coverage</span>
                <input 
                  type="checkbox"
                  checked={formData.isSpecial}
                  onChange={e => setFormData({ ...formData, isSpecial: e.target.checked })}
                  className="w-5 h-5 accent-[#04C4FC]"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-500/80">
              <Clock className="w-4 h-4" />
              <h3 className="font-black text-[10px] uppercase tracking-[0.25em]">Auto-Purge Schedule</h3>
            </div>
            <p className="text-[9px] font-bold text-white/20 leading-relaxed uppercase tracking-wider">Listing and assets permanently deleted at this time.</p>
            <input 
              type="datetime-local"
              value={formData.deleteAt ? formData.deleteAt.slice(0, 16) : ''}
              onChange={e => setFormData({ ...formData, deleteAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none text-white transition-all"
            />
          </section>

          <div className="aspect-video bg-[#0B0C10] rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center relative group shadow-2xl">
            {previewServer ? (
              <iframe 
                src={previewServer.embedUrl}
                className="w-full h-full border-none"
                allowFullScreen={true}
                title="Admin Preview"
              />
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 group-hover:border-sky-500/30 transition-all">
                  <ExternalLink className="w-6 h-6 text-white/10 group-hover:text-sky-500/50" />
                </div>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Add Source to Preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventEditor;
