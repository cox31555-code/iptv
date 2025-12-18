import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image, 
  X, 
  Save, 
  Search,
  Activity,
  Users,
  Trophy,
  Settings as SettingsIcon,
  ArrowLeft,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { League } from '../../types';
import { getLeagues, createLeague, updateLeague, deleteLeague, getFullImageUrl } from '../../api';
import { useApp } from '../../AppContext';
import Logo from '../../components/Logo';

const Leagues: React.FC = () => {
  const { admin, logout } = useApp();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState<Partial<League>>({
    name: '',
    slug: '',
    backgroundImageUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  if (!admin) return <Navigate to="/admin/login" />;

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setIsLoading(true);
      const data = await getLeagues();
      setLeagues(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load leagues');
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

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingLeague ? prev.slug : generateSlug(name)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        backgroundImageUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const openCreateModal = () => {
    setEditingLeague(null);
    setFormData({
      name: '',
      slug: '',
      backgroundImageUrl: ''
    });
    setShowModal(true);
  };

  const openEditModal = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      slug: league.slug,
      backgroundImageUrl: league.backgroundImageUrl
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLeague(null);
    setFormData({ name: '', slug: '', backgroundImageUrl: '' });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('League name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingLeague) {
        await updateLeague(editingLeague.id, formData);
      } else {
        const newLeague: League = {
          id: crypto.randomUUID(),
          name: formData.name!,
          slug: formData.slug || generateSlug(formData.name!),
          backgroundImageUrl: formData.backgroundImageUrl || ''
        };
        await createLeague(newLeague);
      }

      await loadLeagues();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save league');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLeague(id);
      await loadLeagues();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete league');
    }
  };

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    league.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all text-xs">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/teams" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all text-xs">
            <Users className="w-4 h-4" /> Teams
          </Link>
          <Link to="/admin/leagues" className="flex items-center gap-3 px-4 py-3 bg-[#04C4FC] text-[#0B0C10] rounded-xl font-bold transition-all text-xs">
            <Trophy className="w-4 h-4" /> Leagues
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all text-xs">
            <SettingsIcon className="w-4 h-4" /> Settings
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-4">Development</p>
            <Link to="/this-page-does-not-exist" className="flex items-center gap-3 px-4 py-3 text-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5 rounded-xl font-medium transition-all text-xs border border-dashed border-orange-500/10">
              <AlertTriangle className="w-4 h-4" /> Test 404 Page
            </Link>
          </div>

          <div className="h-px bg-white/5 my-4 mx-2" />
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 rounded-xl font-medium transition-all text-xs">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all w-full text-left text-xs">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">Leagues</h1>
            <p className="text-white/40 text-sm font-medium">Manage league backgrounds for cover image generation</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-[#04C4FC] text-[#0B0C10] px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(4,196,252,0.2)]"
          >
            <Plus className="w-4 h-4" /> Add League
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#04C4FC] transition-colors" />
          <input
            type="text"
            placeholder="Search leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1F2833] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#04C4FC] outline-none text-white transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04C4FC]"></div>
          </div>
        ) : (
          /* Leagues Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map(league => (
              <div
                key={league.id}
                className="bg-[#1F2833] border border-white/5 rounded-2xl overflow-hidden group shadow-lg transition-transform hover:scale-[1.02]"
              >
                {/* Background Preview */}
                <div className="aspect-[16/10] relative bg-[#0B0C10]">
                  {league.backgroundImageUrl ? (
                    <img
                      src={getFullImageUrl(league.backgroundImageUrl) || league.backgroundImageUrl}
                      alt={league.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Image className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(league)}
                      className="p-2 bg-[#0B0C10]/80 hover:bg-[#04C4FC] rounded-xl text-white transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(league.id)}
                      className="p-2 bg-[#0B0C10]/80 hover:bg-red-500 rounded-xl text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-white">{league.name}</h3>
                  <p className="text-xs text-white/30 mt-1 font-mono">/{league.slug}</p>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === league.id && (
                  <div className="p-4 bg-red-500/10 border-t border-red-500/20">
                    <p className="text-xs text-red-400 mb-3 font-medium">Delete this league?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(league.id)}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl uppercase tracking-wider"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredLeagues.length === 0 && (
              <div className="col-span-full text-center py-20 text-white/30 font-bold uppercase tracking-widest text-xs">
                {searchQuery ? 'No leagues match your search' : 'No leagues yet. Add your first league!'}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1F2833] rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  {editingLeague ? 'Edit League' : 'Add League'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                    League Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0C10] border border-white/10 rounded-xl text-white text-sm focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all"
                    placeholder="e.g., Premier League"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#0B0C10] border border-white/10 rounded-xl text-white text-sm focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all font-mono"
                    placeholder="premier-league"
                  />
                </div>

                {/* Background Image */}
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                    Background Image (1440×900 recommended)
                  </label>
                  
                  {/* Preview */}
                  {formData.backgroundImageUrl && (
                    <div className="relative aspect-[16/10] mb-3 rounded-xl overflow-hidden bg-[#0B0C10]">
                      <img
                        src={formData.backgroundImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, backgroundImageUrl: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-xl text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0B0C10] hover:bg-white/5 border border-white/10 rounded-xl text-white/50 transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    <Image className="w-4 h-4" />
                    Upload Image
                  </button>

                  {/* Or URL input */}
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.backgroundImageUrl?.startsWith('data:') ? '' : (formData.backgroundImageUrl || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundImageUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#0B0C10] border border-white/10 rounded-xl text-white text-sm focus:ring-1 focus:ring-[#04C4FC] outline-none transition-all"
                      placeholder="Or paste image URL..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#04C4FC] hover:bg-[#04C4FC]/80 disabled:bg-[#04C4FC]/30 text-[#0B0C10] font-bold rounded-xl transition-colors text-xs uppercase tracking-wider"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B0C10]" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingLeague ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Leagues;
