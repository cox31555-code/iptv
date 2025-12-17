import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Image, X, Save, Search } from 'lucide-react';
import { League } from '../../types';
import { getLeagues, createLeague, updateLeague, deleteLeague, getFullImageUrl } from '../../api';

const Leagues: React.FC = () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leagues</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage league backgrounds for cover image generation
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add League
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search leagues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeagues.map(league => (
          <div
            key={league.id}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden group"
          >
            {/* Background Preview */}
            <div className="aspect-[16/10] relative bg-zinc-900">
              {league.backgroundImageUrl ? (
                <img
                  src={getFullImageUrl(league.backgroundImageUrl) || league.backgroundImageUrl}
                  alt={league.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Image className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(league)}
                  className="p-2 bg-zinc-900/80 hover:bg-sky-500 rounded-lg text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(league.id)}
                  className="p-2 bg-zinc-900/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-white">{league.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">/{league.slug}</p>
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm === league.id && (
              <div className="p-4 bg-red-500/10 border-t border-red-500/20">
                <p className="text-sm text-red-400 mb-3">Delete this league?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(league.id)}
                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredLeagues.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            {searchQuery ? 'No leagues match your search' : 'No leagues yet. Add your first league!'}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <h2 className="text-lg font-semibold text-white">
                {editingLeague ? 'Edit League' : 'Add League'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  League Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g., Premier League"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  placeholder="premier-league"
                />
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Background Image (1440×900 recommended)
                </label>
                
                {/* Preview */}
                {formData.backgroundImageUrl && (
                  <div className="relative aspect-[16/10] mb-2 rounded-lg overflow-hidden bg-zinc-800">
                    <img
                      src={formData.backgroundImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, backgroundImageUrl: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-lg text-white"
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
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    Upload Image
                  </button>
                </div>

                {/* Or URL input */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.backgroundImageUrl?.startsWith('data:') ? '' : (formData.backgroundImageUrl || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundImageUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Or paste image URL..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-semibold rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
    </div>
  );
};

export default Leagues;
