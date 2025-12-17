import React, { useState } from 'react';
import { useApp } from '../../AppContext.tsx';
import { Navigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  User, 
  Lock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Eye,
  LogOut,
  Users
} from 'lucide-react';
import Logo from '../../components/Logo.tsx';

const Settings: React.FC = () => {
  const { admin, changePassword, logout } = useApp();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!admin) return <Navigate to="/admin/login" />;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPass !== confirmPass) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (newPass.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPass, newPass);
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-[#1F2833] border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10">
          <Link to="/" className="block">
            <Logo className="h-12" />
          </Link>
          <div className="mt-4 p-3 bg-[#0B0C10] rounded-xl">
            <p className="text-xs text-white/40 mb-1 uppercase font-bold">Account Settings</p>
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
          <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 bg-[#04C4FC] text-[#0B0C10] rounded-xl font-bold transition-all">
            <Shield className="w-4 h-4" /> Settings
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
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">Account Security</h1>
            <p className="text-white/40 text-sm font-medium">Manage your administrative access</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-8">
          <section className="bg-[#1F2833] p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 text-[#04C4FC] mb-8">
              <Shield className="w-5 h-5" />
              <h2 className="font-black uppercase text-xs tracking-[0.2em]">Update Password</h2>
            </div>

            {status && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${
                status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-bold">{status.message}</p>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password"
                  required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] outline-none transition-all"
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password"
                    required
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] outline-none transition-all"
                    placeholder="Min. 6 characters"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#04C4FC] outline-none transition-all"
                    placeholder="Repeat new password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full md:w-auto bg-[#04C4FC] text-[#0B0C10] px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_10px_30px_rgba(4,196,252,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save New Credentials'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
