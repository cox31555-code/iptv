import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext.tsx';
import { Navigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Activity, 
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Upload,
  X,
  Users,
  Search,
  Pencil,
  Save,
  Trophy,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { League, EventCategory } from '../../types.ts';
import { getLeagues, createLeague, updateLeague, deleteLeague, uploadLeagueBackground, uploadLeagueLogo } from '../../api.ts';
import Logo from '../../components/Logo.tsx';

const Leagues: React.FC = () => {
  const { admin, logout } = useApp();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newLeague, setNewLeague] = useState({ name: '', categoryId: '', backgroundImageUrl: '', logoUrl: '' });
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!admin) return <Navigate to="/admin/login" />;

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setIsLoading(true);
      const data = await getLeagues();
      setLeagues(data);
    } catch (err: any) {
      console.error('Failed to load leagues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PNG, JPG, or WebP images only.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Background image is too large. Please choose a file smaller than 5MB.');
      return;
    }

    // Store the File object
    setBgFile(file);
    
    // Create preview URL using createObjectURL (no base64!)
    const previewUrl = URL.createObjectURL(file);
    setNewLeague(prev => ({ ...prev, backgroundImageUrl: previewUrl }));
    
    // Clear any previous upload errors
    setUploadError(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PNG, JPG, WebP, or SVG images only.');
      return;
    }

    // Validate file size (2MB max for logos)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo image is too large. Please choose a file smaller than 2MB.');
      return;
    }

    // Store the File object
    setLogoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setNewLeague(prev => ({ ...prev, logoUrl: previewUrl }));
    
    // Clear any previous upload errors
    setUploadError(null);
  };


  const handleEditLeague = (league: League) => {
    setEditingLeague(league);
    // Don't load existing images into preview to avoid GET requests
    // Only show previews for newly selected files (blob: URLs)
    setNewLeague({
      name: league.name,
      categoryId: league.categoryId || '',
      backgroundImageUrl: '', // Empty - will show upload button instead
      logoUrl: '' // Empty - will show upload button instead
    });
    setBgFile(null); // Clear any previously selected file
    setLogoFile(null); // Clear any previously selected logo file
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    // Clean up object URLs to avoid memory leaks
    if (newLeague.backgroundImageUrl && newLeague.backgroundImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(newLeague.backgroundImageUrl);
    }
    if (newLeague.logoUrl && newLeague.logoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(newLeague.logoUrl);
    }
    
    setEditingLeague(null);
    setNewLeague({ name: '', categoryId: '', backgroundImageUrl: '', logoUrl: '' });
    setBgFile(null);
    setLogoFile(null);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeague.name.trim()) return;

    setIsAdding(true);
    setUploadError(null);
    
    try {
      let leagueId: string;
      
      if (editingLeague) {
        // Update existing league (name and categoryId, no backgroundImageUrl)
        await updateLeague(editingLeague.id, {
          name: newLeague.name.trim(),
          categoryId: newLeague.categoryId || undefined
        });
        leagueId = editingLeague.id;
      } else {
        // Create new league (backgroundImageUrl will be set via upload)
        const league: League = {
          id: crypto.randomUUID(),
          name: newLeague.name.trim(),
          slug: generateSlug(newLeague.name.trim()),
          backgroundImageUrl: '', // Empty - will be set by file upload
          categoryId: newLeague.categoryId || undefined
        };
        const created = await createLeague(league);
        leagueId = created.id || league.id;
      }

      // If there's a background file to upload, do it now
      if (bgFile) {
        try {
          console.log(`Uploading background for league ${leagueId}...`);
          await uploadLeagueBackground(leagueId, bgFile);
          console.log('Background uploaded successfully');
        } catch (uploadErr: any) {
          console.error('Background upload failed:', uploadErr);
          setUploadError(
            `League ${editingLeague ? 'updated' : 'created'}, but background upload failed: ${uploadErr.message || 'Unknown error'}. You can try uploading again by editing the league.`
          );
          setIsAdding(false);
          await loadLeagues();
          return;
        }
      }

      // If there's a logo file to upload, do it now
      if (logoFile) {
        try {
          console.log(`Uploading logo for league ${leagueId}...`);
          await uploadLeagueLogo(leagueId, logoFile);
          console.log('Logo uploaded successfully');
        } catch (uploadErr: any) {
          console.error('Logo upload failed:', uploadErr);
          setUploadError(
            `League ${editingLeague ? 'updated' : 'created'}, but logo upload failed: ${uploadErr.message || 'Unknown error'}. You can try uploading again by editing the league.`
          );
          setIsAdding(false);
          await loadLeagues();
          return;
        }
      }

      // Success - clean up
      setNewLeague({ name: '', backgroundImageUrl: '', logoUrl: '' });
      setBgFile(null);
      setLogoFile(null);
      setEditingLeague(null);
      setUploadError(null);
      await loadLeagues();
      
    } catch (err: any) {
      console.error('League operation failed:', err);
      alert(`Failed to ${editingLeague ? 'update' : 'create'} league: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLeague = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      setIsDeleting(id);
      try {
        await deleteLeague(id);
        if (editingLeague?.id === id) {
          handleCancelEdit();
        }
        await loadLeagues();
      } catch (err: any) {
        alert(`Failed to delete league: ${err.message}`);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredLeagues = leagues.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const isEditMode = editingLeague !== null;

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col md:flex-row font-sans text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1F2833] border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10">
          <Link to="/" className="block">
            <Logo className="h-12" />
          </Link>
          <div className="mt-4 p-3 bg-[#0B0C10] rounded-xl">
            <p className="text-xs text-white/40 mb-1 uppercase font-bold">League Database</p>
            <p className="text-sm font-medium text-white">{admin.username}</p>
            <span className="text-[10px] bg-[#04C4FC]/10 text-[#04C4FC] px-1.5 py-0.5 rounded font-black uppercase">{admin.role}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/teams" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Users className="w-4 h-4" /> Teams
          </Link>
          <Link to="/admin/leagues" className="flex items-center gap-3 px-4 py-3 bg-[#04C4FC] text-[#0B0C10] rounded-xl font-bold transition-all">
            <Trophy className="w-4 h-4" /> Leagues
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
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">Leagues Library</h1>
            <p className="text-white/40 text-sm font-medium">Create and manage leagues for cover image backgrounds</p>
          </div>
          <Link 
            to="/admin" 
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit League Form */}
          <div className="lg:col-span-1">
            <form 
              ref={formRef}
              onSubmit={handleSubmit} 
              className={`bg-[#1F2833] p-6 rounded-2xl border space-y-6 shadow-xl sticky top-8 transition-all ${
                isEditMode 
                  ? 'border-amber-500/50 ring-1 ring-amber-500/20' 
                  : 'border-white/5'
              }`}
            >
              {/* Form Header */}
              <div className={`border-b pb-3 ${isEditMode ? 'border-amber-500/30' : 'border-white/5'}`}>
                <h2 className={`font-black text-[10px] uppercase tracking-[0.25em] ${
                  isEditMode ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  {isEditMode ? (
                    <span className="flex items-center gap-2">
                      <Pencil className="w-3 h-3" /> Edit League
                    </span>
                  ) : (
                    'Register New League'
                  )}
                </h2>
                {isEditMode && (
                  <p className="text-[10px] text-amber-400/60 mt-1 font-medium">
                    Editing: {editingLeague.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">League Name</label>
                  <input 
                    required
                    value={newLeague.name}
                    onChange={e => setNewLeague({ ...newLeague, name: e.target.value })}
                    placeholder="e.g. Premier League"
                    className={`w-full bg-[#0B0C10] border rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 outline-none transition-all ${
                      isEditMode 
                        ? 'border-amber-500/30 focus:ring-amber-500' 
                        : 'border-white/10 focus:ring-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={newLeague.categoryId}
                    onChange={e => setNewLeague({ ...newLeague, categoryId: e.target.value })}
                    className={`w-full bg-[#0B0C10] border rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 outline-none transition-all ${
                      isEditMode 
                        ? 'border-amber-500/30 focus:ring-amber-500' 
                        : 'border-white/10 focus:ring-sky-500'
                    }`}
                  >
                    <option value="">Select a category (optional)</option>
                    <option value="Football">Football</option>
                    <option value="NBA">NBA</option>
                    <option value="NFL">NFL</option>
                    <option value="UFC">UFC</option>
                    <option value="Motorsports">Motorsports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Background Image (1440×900)</label>
                  <div className={`relative group aspect-video bg-[#0B0C10] rounded-2xl border border-dashed flex items-center justify-center overflow-hidden transition-all ${
                    isEditMode 
                      ? 'border-amber-500/30 hover:border-amber-500/50' 
                      : 'border-white/10 hover:border-sky-500/30'
                  }`}>
                    {newLeague.backgroundImageUrl ? (
                      <>
                        <img src={newLeague.backgroundImageUrl} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => {
                            // Clean up object URL if it exists
                            if (newLeague.backgroundImageUrl.startsWith('blob:')) {
                              URL.revokeObjectURL(newLeague.backgroundImageUrl);
                            }
                            setNewLeague({ ...newLeague, backgroundImageUrl: '' });
                            setBgFile(null);
                          }}
                          className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 text-white shadow-xl active:scale-90"
                        >
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => bgInputRef.current?.click()} 
                        className={`flex flex-col items-center gap-2 transition-all ${
                          isEditMode 
                            ? 'text-zinc-600 hover:text-amber-400' 
                            : 'text-zinc-600 hover:text-sky-400'
                        }`}
                      >
                        <Upload className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Background</span>
                      </button>
                    )}
                    <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">League Logo (512×512)</label>
                  <div className={`relative group aspect-square bg-[#0B0C10] rounded-2xl border border-dashed flex items-center justify-center overflow-hidden transition-all ${
                    isEditMode 
                      ? 'border-amber-500/30 hover:border-amber-500/50' 
                      : 'border-white/10 hover:border-sky-500/30'
                  }`}>
                    {newLeague.logoUrl ? (
                      <>
                        <img src={newLeague.logoUrl} className="w-full h-full object-contain p-4" alt="Logo Preview" />
                        <button 
                          type="button"
                          onClick={() => {
                            // Clean up object URL if it exists
                            if (newLeague.logoUrl.startsWith('blob:')) {
                              URL.revokeObjectURL(newLeague.logoUrl);
                            }
                            setNewLeague({ ...newLeague, logoUrl: '' });
                            setLogoFile(null);
                          }}
                          className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 text-white shadow-xl active:scale-90"
                        >
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current?.click()} 
                        className={`flex flex-col items-center gap-2 transition-all ${
                          isEditMode 
                            ? 'text-zinc-600 hover:text-amber-400' 
                            : 'text-zinc-600 hover:text-sky-400'
                        }`}
                      >
                        <Trophy className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Logo</span>
                      </button>
                    )}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>
              </div>

              {/* Upload Error Display */}
              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-[10px] text-red-400 font-medium leading-relaxed">
                    {uploadError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="mt-2 text-[9px] text-red-400/70 hover:text-red-400 uppercase tracking-wider font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  type="submit"
                  disabled={!newLeague.name || isAdding}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 ${
                    isEditMode 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-[#04C4FC] text-[#0B0C10]'
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <Save className="w-4 h-4" /> {isAdding ? 'Saving...' : 'Save Changes'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> {isAdding ? 'Adding...' : 'Add League'}
                    </>
                  )}
                </button>

                {isEditMode && (
                  <button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/10 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" /> Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Leagues Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="Lookup leagues..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#1F2833] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04C4FC]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLeagues.map(league => (
                  <div 
                    key={league.id} 
                    className={`group relative bg-[#1F2833] rounded-2xl border p-4 flex flex-col items-center text-center space-y-3 transition-all hover:shadow-2xl ${
                      editingLeague?.id === league.id 
                        ? 'border-amber-500/60 ring-1 ring-amber-500/30' 
                        : 'border-white/5 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="w-16 h-16 bg-[#0B0C10] rounded-xl flex items-center justify-center p-2 mb-2">
                      <Trophy className="w-8 h-8 text-white/20" />
                    </div>
                    <div className="w-full min-h-[40px]">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white truncate w-full px-2">{league.name}</h3>
                      {league.backgroundImageUrl ? (
                        <p className="text-[8px] text-green-500/80 font-bold uppercase truncate px-2 mt-1 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Background ✓
                        </p>
                      ) : (
                        <p className="text-[8px] text-white/30 font-bold uppercase truncate px-2 mt-1 flex items-center justify-center gap-1">
                          <ImageIcon className="w-3 h-3" /> No background
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditLeague(league)}
                        className={`p-1.5 rounded-lg transition-all ${
                          editingLeague?.id === league.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white'
                        }`}
                        title="Edit league"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLeague(league.id, league.name)}
                        disabled={isDeleting === league.id}
                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all"
                        title="Delete league"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {editingLeague?.id === league.id && (
                      <div className="absolute -top-2 -left-2 bg-amber-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                        Editing
                      </div>
                    )}
                  </div>
                ))}
                {filteredLeagues.length === 0 && (
                  <div className="col-span-full py-20 text-center text-zinc-700 font-black uppercase tracking-[0.3em] text-[10px]">
                    {searchTerm ? 'No results for your query' : 'No leagues registered yet'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leagues;
