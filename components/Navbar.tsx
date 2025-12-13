
import React, { useState } from 'react';
import { Menu, X, Heart, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { EventCategory } from '../types';
import Logo from './Logo.tsx';
import DonateModal from './DonateModal.tsx';

interface NavbarProps {
  onSearch: (term: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center pt-8 pb-4 gap-6">
            {/* Logo Tier */}
            <Link to="/" className="flex items-center group">
              <Logo className="h-12 md:h-16 group-hover:scale-105 transition-transform" />
            </Link>

            {/* Navigation Tier */}
            <div className="flex items-center justify-between w-full border-t border-white/5 pt-4">
              
              <div className="flex-1">
                <div className="md:hidden">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Toggle menu"
                  >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8 px-4">
                <Link to="/" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-sky-400 transition-all hover:-translate-y-0.5">Home</Link>
                <Link to="/special" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-sky-400 transition-all hover:-translate-y-0.5">Special</Link>
                <Link to="/football" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-sky-400 transition-all hover:-translate-y-0.5">Football</Link>
                <Link to="/nba" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-sky-400 transition-all hover:-translate-y-0.5">NBA</Link>
                <Link to="/other-sports" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-sky-400 transition-all hover:-translate-y-0.5">Other Sports</Link>
              </div>

              <div className="flex-1 flex justify-end items-center gap-2">
                <Link 
                  to="/admin"
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all group"
                  title="Admin Panel"
                >
                  <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                </Link>
                <button 
                  onClick={() => setIsDonateOpen(true)}
                  className="group flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full transition-all"
                >
                  <Heart className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="text-[9px] font-black text-zinc-500 group-hover:text-white uppercase tracking-[0.2em]">Donate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-white/5 py-8 px-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-6 text-center">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-black tracking-tighter text-white">HOME</Link>
              <div className="h-px bg-white/5 w-12 mx-auto" />
              <Link to="/special" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">Special Events</Link>
              <Link to="/football" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">Football</Link>
              <Link to="/nba" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">NBA</Link>
              <Link to="/other-sports" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">Other Sports</Link>
              
              <div className="flex flex-col gap-3 mt-4">
                <button 
                  onClick={() => { setIsDonateOpen(true); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 py-4 border border-white/10 text-zinc-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-white hover:bg-white/5 transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Donate Now
                </button>
                <Link 
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-4 bg-white/5 text-zinc-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-white transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <DonateModal 
        isOpen={isDonateOpen} 
        onClose={() => setIsDonateOpen(false)} 
      />
    </>
  );
};

export default Navbar;
