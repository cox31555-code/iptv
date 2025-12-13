
import React, { useState } from 'react';
import { Search, Menu, X, Play, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

interface NavbarProps {
  onSearch: (term: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { admin } = useApp();
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#04C4FC] p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-[#0B0C10] fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#04C4FC]">
                PRO<span className="text-white">STREAM</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-[#04C4FC] transition-colors">Special</Link>
              <Link to="/" className="text-sm font-medium hover:text-[#04C4FC] transition-colors">Football</Link>
              <Link to="/" className="text-sm font-medium hover:text-[#04C4FC] transition-colors">NBA</Link>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search events, teams, leagues..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-[#1F2833] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#04C4FC] transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {admin ? (
              <Link to="/admin" className="p-2 text-white/50 hover:text-[#04C4FC] transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/admin/login" className="text-sm font-medium text-white/40 hover:text-[#04C4FC]">
                Admin
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0B0C10] border-b border-white/5 py-4 px-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-[#1F2833] border-none rounded-full py-2 pl-10 pr-4 text-sm"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-lg font-medium">Home</Link>
            <Link to="/" className="text-lg font-medium">Special Events</Link>
            <Link to="/" className="text-lg font-medium">Football</Link>
            <Link to="/" className="text-lg font-medium">NBA</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
