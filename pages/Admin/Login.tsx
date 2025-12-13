
import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useApp } from '../../AppContext';
import { MOCK_ADMIN } from '../../constants';
import { Lock, User, Play, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { admin, login } = useApp();
  const navigate = useNavigate();

  if (admin) return <Navigate to="/admin" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
      login({ id: MOCK_ADMIN.id, username, role: MOCK_ADMIN.role });
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] px-4 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-[#04C4FC] transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Website
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block bg-[#04C4FC] p-3 rounded-2xl mb-4">
            <Play className="w-8 h-8 text-[#0B0C10] fill-current" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-white/40 mt-2">Enter credentials to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1F2833] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-red-600/10 border border-red-600/20 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#04C4FC] focus:outline-none transition-all"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#04C4FC] focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#04C4FC] text-[#0B0C10] font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform active:scale-95"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-white/20 text-xs">
          For demo: admin / password
        </p>
      </div>
    </div>
  );
};

export default Login;
