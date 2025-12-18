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
  MapPin,
  Search,
  Tag,
  Image
} from 'lucide-react';
import { EventCategory, StreamServer, SportEvent, calculateEventStatus, Team, League } from '../../types.ts';
import { uploadCoverImage, getFullImageUrl, getLeagues } from '../../api.ts';

const EventEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, teams, addEvent, updateEvent } = useApp();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const teamALogoRef = useRef<HTMLInputElement>(null);
  const teamBLogoRef = useRef<HTMLInputElement>(null);
  const leagueLogoRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<SportEvent>>({
    teams: '',
    league: '',
    keywords: '',
    category: EventCategory.FOOTBALL,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
    stadium: '',
    description: '',
    imageUrl: '',
    coverImageUrl: '',
    teamALogoUrl: '',
    teamBLogoUrl: '',
    leagueLogoUrl: '',
    isSpecial: false,
    pinPriority: 0,
    deleteAt: null,
    servers: []
  });

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [showLookupA, setShowLookupA] = useState(false);
  const [showLookupB, setShowLookupB] = useState(false);

  const [newServer, setNewServer] = useState<Partial<StreamServer>>({
    name: '',
    embedUrl: '',
    isActive: true,
    isDefault: false
  });

  const [previewServer, setPreviewServer] = useState<StreamServer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stadiumManuallyEdited, setStadiumManuallyEdited] = useState(false);
  const [autoPurge, setAutoPurge] = useState(false);

  // League state
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showLeagueLookup, setShowLeagueLookup] = useState(false);
  const [leagueSearch, setLeagueSearch] = useState('');

  const isTeamBased = formData.category === EventCategory.FOOTBALL || formData.category === EventCategory.NBA;

  // Load leagues on mount
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (err) {
        console.error('Failed to load leagues:', err);
      }
    };
    loadLeagues();
  }, []);

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = events.find(e => e.id === id);
      if (existing) {
        setFormData({
          ...existing,
          startTime: existing.startTime.slice(0, 16),
          endTime: existing.endTime.slice(0, 16),
        });

        if (existing.category === EventCategory.FOOTBALL || existing.category === EventCategory.NBA) {
          const parts = existing.teams.split(/\s+vs\s+/i);
          setTeamA(parts[0]?.trim() || '');
          setTeamB(parts[1]?.trim() || '');
        }

        const defaultServer = existing.servers.find(s => s.isDefault) || existing.servers[0];
        if (defaultServer) setPreviewServer(defaultServer);
      }
    }
  }, [id, events]);

  const prevCategoryRef = useRef(formData.category);
  useEffect(() => {
    const wasTeamBased = prevCategoryRef.current === EventCategory.FOOTBALL || prevCategoryRef.current === EventCategory.NBA;
    if (isTeamBased && !wasTeamBased) {
      const parts = (formData.teams || '').split(/\s+vs\s+/i);
      setTeamA(parts[0]?.trim() || '');
      setTeamB(parts[1]?.trim() || '');
    }
    prevCategoryRef.current = formData.category;
  }, [formData.category, isTeamBased, formData.teams]);

  useEffect(() => {
    if (isTeamBased) {
      const combined = `${teamA.trim()} vs ${teamB.trim()}`;
      const finalTeams = (teamA.trim() === '' && teamB.trim() === '') ? '' : combined;
      if (formData.teams !== finalTeams) {
        setFormData(prev => ({ ...prev, teams: finalTeams }));
      }
    }
  }, [teamA, teamB, isTeamBased]);

  // Auto-update deleteAt when endTime changes and autoPurge is enabled
  useEffect(() => {
    if (autoPurge && formData.endTime) {
      const endDate = new Date(formData.endTime);
      const purgeDate = new Date(endDate.getTime() + 29 * 60 * 1000);
      setFormData(prev => ({ ...prev, deleteAt: purgeDate.toISOString() }));
    }
  }, [formData.endTime, autoPurge]);

  const handleSelectTeam = (team: Team, type: 'A' | 'B') => {
    // Logic to update keywords automatically
    setFormData(prev => {
      const currentKeywords = prev.keywords ? prev.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
      const newTeamKeywords = team.keywords ? team.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
      
      // Combine and remove duplicates
      const uniqueKeywords = Array.from(new Set([...currentKeywords, ...newTeamKeywords]));
      
      const updates: Partial<SportEvent> = {
        ...prev,
        [type === 'A' ? 'teamALogoUrl' : 'teamBLogoUrl']: team.logoUrl,
        keywords: uniqueKeywords.join(', ')
      };
      
      // Autofill stadium from Team A only (if not manually edited)
      if (type === 'A' && team.stadium && !stadiumManuallyEdited) {
        updates.stadium = team.stadium;
      }
      
      return updates;
    });

    if (type === 'A') {
      setTeamA(team.name);
      setShowLookupA(false);
      // Reset manual edit flag when Team A changes so autofill can work
      if (team.stadium) {
        setStadiumManuallyEdited(false);
      }
    } else {
      setTeamB(team.name);
      setShowLookupB(false);
    }
  };

  const filteredTeamsA = teams.filter(t => t.name.toLowerCase().includes(teamA.toLowerCase()) && teamA.length > 0);
  const filteredTeamsB = teams.filter(t => t.name.toLowerCase().includes(teamB.toLowerCase()) && teamB.length > 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SportEvent) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image too large (max 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: keyof SportEvent) => setFormData(prev => ({ ...prev, [field]: '' }));

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const startTime = formData.startTime ? new Date(formData.startTime).toISOString() : new Date().toISOString();
      const endTime = formData.endTime ? new Date(formData.endTime).toISOString() : new Date(Date.now() + 7200000).toISOString();
      
      // Normalize coverImageUrl: treat empty string as null for backend
      const normalizedCoverImageUrl = formData.coverImageUrl?.trim() || null;
      
      const finalData: SportEvent = {
        id: id && id !== 'new' ? id : Math.random().toString(36).substr(2, 9),
        createdAt: (formData as any).createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stadium: formData.stadium || '',
        description: formData.description || '',
        keywords: formData.keywords || '',
        ...formData,
        coverImageUrl: normalizedCoverImageUrl, // Explicitly include (even if null) so backend can clear it
        startTime,
        endTime,
        status: calculateEventStatus(startTime, endTime),
        servers: formData.servers || [],
      } as SportEvent;
      
      if (id && id !== 'new') {
        await updateEvent(finalData);
      } else {
        await addEvent(finalData);
      }
      navigate('/admin');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  const addServer = () => {
    if (!newServer.name || !newServer.embedUrl) return;
    
    const serverId = crypto.randomUUID();
    const server: StreamServer = {
      id: serverId,
      name: newServer.name,
      embedUrl: newServer.embedUrl,
      isActive: newServer.isActive!,
      isDefault: newServer.isDefault!,
      sortOrder: 0 // Will be set correctly inside functional update
    };
    
    // Use functional update to avoid stale state issues
    setFormData(prev => {
      const existingServers = prev.servers || [];
      // If new server is default, unset default on all existing servers
      const updatedServers = server.isDefault 
        ? existingServers.map(s => ({ ...s, isDefault: false }))
        : existingServers;
      
      return {
        ...prev,
        servers: [...updatedServers, { ...server, sortOrder: existingServers.length + 1 }]
      };
    });
    
    setNewServer({ name: '', embedUrl: '', isActive: true, isDefault: false });
    
    // Set preview server if none selected
    if (!previewServer) {
      setPreviewServer(server);
    }
  };

  const removeServer = (serverId: string) => {
    // Use functional update to avoid stale state
    setFormData(prev => {
      const updated = (prev.servers || []).filter(s => s.id !== serverId);
      // Update preview server if the removed one was being previewed
      if (previewServer?.id === serverId) {
        setPreviewServer(updated[0] || null);
      }
      return { ...prev, servers: updated };
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-20 text-white font-sans">
      <header className="sticky top-0 z-40 bg-[#0B0C10]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-xl font-black tracking-tighter uppercase">{id === 'new' ? 'Create Event' : 'Edit Event'}</h1>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#04C4FC] text-[#0B0C10] px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(4,196,252,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"><Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4"><Info className="w-4 h-4" /><h2 className="font-black uppercase text-[10px] tracking-[0.25em]">General Information</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as EventCategory })} className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-[#04C4FC] outline-none text-white transition-all appearance-none">
                  {Object.values(EventCategory).map(c => <option key={c} value={c} className="bg-[#1F2833]">{c}</option>)}
                </select>
              </div>

              {isTeamBased ? (
                <>
                  <div className="relative">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Team A Name</label>
                    <div className="relative">
                      <input value={teamA} onFocus={() => setShowLookupA(true)} onBlur={() => setTimeout(() => setShowLookupA(false), 200)} onChange={e => setTeamA(e.target.value)} placeholder="Search team..." className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all" />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    </div>
                    {showLookupA && filteredTeamsA.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-2 bg-[#1F2833] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                        {filteredTeamsA.map(team => (
                          <button key={team.id} type="button" onMouseDown={() => handleSelectTeam(team, 'A')} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-sky-500/10 transition-colors border-b border-white/5 last:border-0 text-left">
                            <img src={team.logoUrl} alt="" className="w-6 h-6 object-contain" />
                            <span className="text-xs font-black uppercase tracking-widest">{team.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Team B Name</label>
                    <div className="relative">
                      <input value={teamB} onFocus={() => setShowLookupB(true)} onBlur={() => setTimeout(() => setShowLookupB(false), 200)} onChange={e => setTeamB(e.target.value)} placeholder="Search team..." className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all" />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    </div>
                    {showLookupB && filteredTeamsB.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-2 bg-[#1F2833] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                        {filteredTeamsB.map(team => (
                          <button key={team.id} type="button" onMouseDown={() => handleSelectTeam(team, 'B')} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-sky-500/10 transition-colors border-b border-white/5 last:border-0 text-left">
                            <img src={team.logoUrl} alt="" className="w-6 h-6 object-contain" />
                            <span className="text-xs font-black uppercase tracking-widest">{team.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Event Title / Teams</label>
                  <input value={formData.teams} onChange={e => setFormData({ ...formData, teams: e.target.value })} placeholder="e.g. Formula 1 Monaco GP" className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all" />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Keywords / Nicknames
                </label>
                <input 
                  value={formData.keywords} 
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })} 
                  placeholder="e.g. Gunners, The Reds, CR7 (Comma separated)" 
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all" 
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">League (for cover generation)</label>
                <div className="relative">
                  <input 
                    value={formData.league || leagueSearch} 
                    onFocus={() => setShowLeagueLookup(true)} 
                    onBlur={() => setTimeout(() => setShowLeagueLookup(false), 200)} 
                    onChange={e => {
                      setLeagueSearch(e.target.value);
                      setFormData({ ...formData, league: e.target.value, leagueId: undefined });
                    }} 
                    placeholder="Search or type league..." 
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all" 
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                </div>
                {showLeagueLookup && leagues.filter(l => 
                  l.name.toLowerCase().includes((formData.league || leagueSearch || '').toLowerCase())
                ).length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-[#1F2833] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                    {leagues
                      .filter(l => l.name.toLowerCase().includes((formData.league || leagueSearch || '').toLowerCase()))
                      .map(league => (
                        <button 
                          key={league.id} 
                          type="button" 
                          onMouseDown={() => {
                            setFormData({ ...formData, league: league.name, leagueId: league.id });
                            setLeagueSearch('');
                            setShowLeagueLookup(false);
                          }} 
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-sky-500/10 transition-colors border-b border-white/5 last:border-0 text-left"
                        >
                          {league.backgroundImageUrl && (
                            <img src={league.backgroundImageUrl} alt="" className="w-8 h-5 object-cover rounded" />
                          )}
                          <span className="text-xs font-black uppercase tracking-widest">{league.name}</span>
                        </button>
                      ))}
                  </div>
                )}
                {formData.leagueId && (
                  <div className="mt-2 text-[9px] text-sky-400">
                    ✓ Linked to league background for auto cover generation
                  </div>
                )}
              </div>
              <div><label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Venue</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><input value={formData.stadium} onChange={e => { setStadiumManuallyEdited(true); setFormData({ ...formData, stadium: e.target.value }); }} placeholder="e.g. Anfield" className="w-full bg-[#0B0C10] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none" /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Start Time</label><input type="datetime-local" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none" /></div>
              <div><label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">End Time</label><input type="datetime-local" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none" /></div>
            </div>
          </section>

          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4"><Image className="w-4 h-4" /><h2 className="font-black uppercase text-[10px] tracking-[0.25em]">Cover Image</h2></div>
            <div className="space-y-3">
              <p className="text-[10px] text-white/40">Upload a custom cover image for the event card. Recommended: 16:10 aspect ratio, max 5MB.</p>
              <div className="relative aspect-video bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-sky-500/30 transition-all">
                {(coverImagePreview || formData.coverImageUrl) ? (
                  <>
                    <img 
                      src={coverImagePreview || getFullImageUrl(formData.coverImageUrl) || ''} 
                      className="w-full h-full object-cover" 
                      alt="Cover preview" 
                    />
                    <button 
                      onClick={() => {
                        setCoverImagePreview(null);
                        // Set to null (not empty string) so backend clears the field
                        setFormData(prev => ({ ...prev, coverImageUrl: null }));
                      }} 
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5 hover:bg-red-400 transition-colors"
                    >
                      <X className="w-3 h-3"/>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => coverImageRef.current?.click()} 
                    disabled={isUploadingCover}
                    className="flex flex-col items-center gap-2 text-zinc-600 hover:text-sky-400 transition-colors disabled:opacity-50"
                  >
                    {isUploadingCover ? (
                      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8"/>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
                    </span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={coverImageRef} 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    if (file.size > 5 * 1024 * 1024) {
                      alert("Image too large (max 5MB).");
                      return;
                    }
                    
                    // Show local preview immediately
                    const reader = new FileReader();
                    reader.onloadend = () => setCoverImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                    
                    // Upload to server
                    setIsUploadingCover(true);
                    try {
                      const result = await uploadCoverImage(file);
                      setFormData(prev => ({ ...prev, coverImageUrl: result.url }));
                      setCoverImagePreview(null); // Clear preview, use actual URL
                    } catch (err: any) {
                      alert(err.message || 'Failed to upload image');
                      setCoverImagePreview(null);
                    } finally {
                      setIsUploadingCover(false);
                    }
                  }} 
                />
              </div>
            </div>
          </section>

          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4"><Layout className="w-4 h-4" /><h2 className="font-black uppercase text-[10px] tracking-[0.25em]">Matchup Assets</h2></div>
            <div className={`grid grid-cols-1 ${!isTeamBased ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6 text-center`}>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest">{!isTeamBased ? 'Event Logo' : 'League Logo'}</label>
                <div className="relative aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-sky-500/30 transition-all">
                  {formData.leagueLogoUrl ? <><img src={formData.leagueLogoUrl} className="w-full h-full object-contain p-4" alt="" /><button onClick={() => removeImage('leagueLogoUrl')} className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5"><X className="w-3 h-3"/></button></> : <button onClick={() => leagueLogoRef.current?.click()} className="text-zinc-600 hover:text-sky-400"><Upload className="w-8 h-8"/></button>}
                  <input type="file" ref={leagueLogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'leagueLogoUrl')} />
                </div>
              </div>
              {isTeamBased && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest">Team A Logo</label>
                    <div className="relative aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-sky-500/30 transition-all">
                      {formData.teamALogoUrl ? <><img src={formData.teamALogoUrl} className="w-full h-full object-contain p-4" alt="" /><button onClick={() => removeImage('teamALogoUrl')} className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5"><X className="w-3 h-3"/></button></> : <button onClick={() => teamALogoRef.current?.click()} className="text-zinc-600 hover:text-sky-400"><Upload className="w-8 h-8"/></button>}
                      <input type="file" ref={teamALogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'teamALogoUrl')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest">Team B Logo</label>
                    <div className="relative aspect-square bg-[#0B0C10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-sky-500/30 transition-all">
                      {formData.teamBLogoUrl ? <><img src={formData.teamBLogoUrl} className="w-full h-full object-contain p-4" alt="" /><button onClick={() => removeImage('teamBLogoUrl')} className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5"><X className="w-3 h-3"/></button></> : <button onClick={() => teamBLogoRef.current?.click()} className="text-zinc-600 hover:text-sky-400"><Upload className="w-8 h-8"/></button>}
                      <input type="file" ref={teamBLogoRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'teamBLogoUrl')} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4"><Settings className="w-4 h-4" /><h2 className="font-black uppercase text-[10px] tracking-[0.25em]">Stream Sources</h2></div>
            <div className="space-y-4">
              {formData.servers?.map(server => (
                <div key={server.id} className={`flex items-center gap-4 bg-[#0B0C10] p-4 rounded-xl border ${previewServer?.id === server.id ? 'border-[#04C4FC]/50' : 'border-white/5'}`}>
                  <GripVertical className="text-white/10" />
                  <div className="flex-1 min-w-0"><div className="font-bold text-xs truncate">{server.name}</div><div className="text-[10px] text-white/20 truncate font-mono">{server.embedUrl}</div></div>
                  <div className="flex gap-1.5"><button onClick={() => setPreviewServer(server)} className={`p-2 rounded-lg ${previewServer?.id === server.id ? 'bg-[#04C4FC] text-black' : 'bg-white/5 text-white/40'}`}><Play className="w-3.5 h-3.5" /></button><button onClick={() => removeServer(server.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></div>
                </div>
              ))}
              <div className="bg-[#0B0C10]/40 p-5 rounded-2xl border border-dashed border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-4"><input placeholder="Server Label" value={newServer.name} onChange={e => setNewServer({ ...newServer, name: e.target.value })} className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-xs" /><input placeholder="Embed URL" value={newServer.embedUrl} onChange={e => setNewServer({ ...newServer, embedUrl: e.target.value })} className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-xs" /></div>
                <div className="flex justify-between items-center"><label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase cursor-pointer"><input type="checkbox" checked={newServer.isDefault} onChange={e => setNewServer({ ...newServer, isDefault: e.target.checked })} className="accent-sky-500" /> Default</label><button onClick={addServer} className="px-4 py-2 bg-sky-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest">Add Source</button></div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-white/50 border-b border-white/5 pb-3">Publication</h3>
            <div className="space-y-4">
              <div><label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Priority</label><input type="number" value={formData.pinPriority} onChange={e => setFormData({ ...formData, pinPriority: parseInt(e.target.value) || 0 })} className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
              <div className="flex items-center justify-between p-4 bg-[#0B0C10] rounded-xl border border-white/5"><span className="text-[10px] font-black uppercase tracking-widest">Premium</span><input type="checkbox" checked={formData.isSpecial} onChange={e => setFormData({ ...formData, isSpecial: e.target.checked })} className="w-5 h-5 accent-sky-500" /></div>
              <div className="flex items-center justify-between p-4 bg-[#0B0C10] rounded-xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest">Auto-purge 29min after end</span>
                <input 
                  type="checkbox" 
                  checked={autoPurge} 
                  onChange={e => {
                    setAutoPurge(e.target.checked);
                    if (e.target.checked && formData.endTime) {
                      const endDate = new Date(formData.endTime);
                      const purgeDate = new Date(endDate.getTime() + 29 * 60 * 1000);
                      setFormData(prev => ({ ...prev, deleteAt: purgeDate.toISOString() }));
                    } else if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, deleteAt: null }));
                    }
                  }} 
                  className="w-5 h-5 accent-sky-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Auto-Purge Time {autoPurge && <span className="text-sky-400">(auto)</span>}</label>
                <input 
                  type="datetime-local" 
                  value={formData.deleteAt?.slice(0, 16) || ''} 
                  disabled={autoPurge}
                  onChange={e => setFormData({ ...formData, deleteAt: e.target.value ? new Date(e.target.value).toISOString() : null })} 
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 text-xs outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
          </section>

          <div className="aspect-video bg-[#0B0C10] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            {previewServer ? <iframe src={previewServer.embedUrl} className="w-full h-full border-none" allowFullScreen title="Preview" /> : <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/10 italic">No Source Selected</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventEditor;
