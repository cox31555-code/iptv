import React, { useState, useEffect } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo.tsx';
import DonateModal from './DonateModal.tsx';

interface NavbarProps {
  onSearch: (term: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 60) {
        if (!isScrolled) setIsScrolled(true);
      } else if (scrollY < 10) {
        if (isScrolled) setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  return (
    <>
      {/* Stable Layout Placeholder */}
      <div className="w-full h-[120px] md:h-[180px] pointer-events-none" />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-2xl border-zinc-800/40 py-2 shadow-2xl' 
          : 'bg-black/40 backdrop-blur-sm border-transparent py-4 md:py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-0">
            
            {/* Logo Tier */}
            <div 
              className={`flex items-center justify-center overflow-hidden transition-all duration-500 ease-in-out ${
                isScrolled ? 'max-h-0 opacity-0 -translate-y-4 pointer-events-none mb-0' : 'max-h-24 opacity-100 translate-y-0 mb-4 md:mb-6'
              }`}
            >
              <Link to="/" className="flex items-center group py-1">
                <Logo className="h-10 md:h-16 group-hover:scale-105 transition-transform duration-500" />
              </Link>
            </div>

            {/* Navigation Tier */}
            <div className={`flex items-center justify-between w-full transition-all duration-500 border-t ${
              isScrolled ? 'border-transparent pt-0' : 'border-zinc-800/40 pt-3 md:pt-4'
            }`}>
              
              <div className="flex-1">
                <div className="md:hidden">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 -ml-1 text-zinc-400 hover:text-white transition-colors"
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

              <div className="flex-1 flex justify-end items-center gap-3 md:gap-6">
                <button 
                  onClick={() => setIsDonateOpen(true)}
                  className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 border border-zinc-800/40 hover:border-zinc-700/60 hover:bg-white/5 rounded-full transition-all"
                >
                  <Heart className="w-2.5 h-2.5 md:w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="text-[8px] md:text-[9px] font-black text-zinc-500 group-hover:text-white uppercase tracking-[0.2em]">Donate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 py-8 px-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-6 text-center">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-black tracking-tighter text-white">HOME</Link>
              <div className="h-px bg-zinc-900 w-12 mx-auto" />
              <Link to="/special" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">Special Events</Link>
              <Link to="/football" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">Football</Link>
              <Link to="/nba" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">NBA</Link>
              <Link to="/other-sports" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-400">Other Sports</Link>
              
              <div className="flex flex-col gap-3 mt-4">
                <button 
                  onClick={() => { setIsDonateOpen(true); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 py-4 border border-zinc-900 text-zinc-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-white hover:bg-white/5 transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Donate Now
                </button>
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