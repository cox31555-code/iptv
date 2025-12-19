import React, { useState, useRef } from 'react';
import { useApp } from '../../AppContext.tsx';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2,
  Upload,
  X,
  Search,
  Tag,
  MapPin,
  Pencil,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Team } from '../../types.ts';
import AdminLayout from '../../admin/layout/AdminLayout';
import { useToast } from '../../admin/components/Toast';
import { useConfirm } from '../../admin/components/ConfirmDialog';

const Teams: React.FC = () => {
  const { teams, addTeam, updateTeam, deleteTeam } = useApp();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', logoUrl: '', keywords: '', stadium: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo is too large. Please choose a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTeam(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name,
      logoUrl: team.logoUrl,
      keywords: team.keywords || '',
      stadium: team.stadium || ''
    });
    // Scroll to form for better UX
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setNewTeam({ name: '', logoUrl: '', keywords: '', stadium: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.logoUrl) return;

    setIsAdding(true);
    try {
      if (editingTeam) {
        // Update existing team
        await updateTeam({
          id: editingTeam.id,
          name: newTeam.name.trim(),
          logoUrl: newTeam.logoUrl,
          keywords: newTeam.keywords.trim(),
          stadium: newTeam.stadium.trim()
        });
      } else {
        // Create new team
        await addTeam({
          id: Math.random().toString(36).substr(2, 9),
          name: newTeam.name.trim(),
          logoUrl: newTeam.logoUrl,
          keywords: newTeam.keywords.trim(),
          stadium: newTeam.stadium.trim()
        });
      }
      // Reset form and exit edit mode
      setNewTeam({ name: '', logoUrl: '', keywords: '', stadium: '' });
      setEditingTeam(null);
      showToast(`Team ${editingTeam ? 'updated' : 'added'} successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || `Failed to ${editingTeam ? 'update' : 'add'} team`, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTeam = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Team',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Team',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteTeam(id);
      // If we're editing the team being deleted, exit edit mode
      if (editingTeam?.id === id) {
        handleCancelEdit();
      }
      showToast('Team deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete team', 'error');
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.keywords && t.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.name.localeCompare(b.name));

  const isEditMode = editingTeam !== null;

  return (
    <AdminLayout
      title="Teams Library"
      description="Create and manage teams for faster event creation"
      action={
        <Link 
          to="/admin" 
          className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Team Form */}
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
                      <Pencil className="w-3 h-3" /> Edit Team
                    </span>
                  ) : (
                    'Register New Team'
                  )}
                </h2>
                {isEditMode && (
                  <p className="text-[10px] text-amber-400/60 mt-1 font-medium">
                    Editing: {editingTeam.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Team Name</label>
                  <input 
                    required
                    value={newTeam.name}
                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="e.g. Liverpool FC"
                    className={`w-full bg-[#0B0C10] border rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 outline-none transition-all ${
                      isEditMode 
                        ? 'border-amber-500/30 focus:ring-amber-500' 
                        : 'border-white/10 focus:ring-sky-500'
                    }`}
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
                    className={`w-full bg-[#0B0C10] border rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 outline-none transition-all ${
                      isEditMode 
                        ? 'border-amber-500/30 focus:ring-amber-500' 
                        : 'border-white/10 focus:ring-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Home Stadium
                  </label>
                  <input 
                    value={newTeam.stadium}
                    onChange={e => setNewTeam({ ...newTeam, stadium: e.target.value })}
                    placeholder="e.g. Anfield"
                    maxLength={200}
                    className={`w-full bg-[#0B0C10] border rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 outline-none transition-all ${
                      isEditMode 
                        ? 'border-amber-500/30 focus:ring-amber-500' 
                        : 'border-white/10 focus:ring-sky-500'
                    }`}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Team Logo</label>
                  <div className={`relative group aspect-square bg-[#0B0C10] rounded-2xl border border-dashed flex items-center justify-center overflow-hidden transition-all ${
                    isEditMode 
                      ? 'border-amber-500/30 hover:border-amber-500/50' 
                      : 'border-white/10 hover:border-sky-500/30'
                  }`}>
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
                        className={`flex flex-col items-center gap-2 transition-all ${
                          isEditMode 
                            ? 'text-zinc-600 hover:text-amber-400' 
                            : 'text-zinc-600 hover:text-sky-400'
                        }`}
                      >
                        <Upload className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Logo</span>
                      </button>
                    )}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  type="submit"
                  disabled={!newTeam.name || !newTeam.logoUrl || isAdding}
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
                      <Plus className="w-4 h-4" /> {isAdding ? 'Adding...' : 'Register Team'}
                    </>
                  )}
                </button>

                {/* Cancel Edit Button - Only shown in edit mode */}
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
                <div 
                  key={team.id} 
                  className={`group relative bg-[#1F2833] rounded-2xl border p-4 flex flex-col items-center text-center space-y-3 transition-all hover:shadow-2xl ${
                    editingTeam?.id === team.id 
                      ? 'border-amber-500/60 ring-1 ring-amber-500/30' 
                      : 'border-white/5 hover:border-sky-500/40'
                  }`}
                >
                  <div className="w-16 h-16 bg-[#0B0C10] rounded-xl flex items-center justify-center p-2 mb-2">
                    <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="w-full min-h-[40px]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white truncate w-full px-2">{team.name}</h3>
                    {team.keywords && (
                      <p className="text-[8px] text-sky-500/60 font-bold uppercase truncate px-2 mt-1">{team.keywords}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons - Edit & Delete */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditTeam(team)}
                      className={`p-1.5 rounded-lg transition-all ${
                        editingTeam?.id === team.id
                          ? 'bg-amber-500 text-black'
                          : 'bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white'
                      }`}
                      title="Edit team"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      title="Delete team"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Currently Editing Indicator */}
                  {editingTeam?.id === team.id && (
                    <div className="absolute -top-2 -left-2 bg-amber-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Editing
                    </div>
                  )}
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
    </AdminLayout>
  );
};

export default Teams;
