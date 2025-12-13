
import React, { useState, useMemo } from 'react';
import { useApp } from '../../AppContext.tsx';
import { EventCategory, EventStatus } from '../../types.ts';
import { CATEGORY_ORDER } from '../../constants.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronRight, Search, Twitter, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo.tsx';
import FooterLogo from '../../components/FooterLogo.tsx';

const Home: React.FC = () => {
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (e.isDeleted) return false;
      const term = searchTerm.toLowerCase();
      return (
        e.teams.toLowerCase().includes(term) ||
        e.league.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        (e.isSpecial && 'special'.includes(term))
      );
    });
  }, [events, searchTerm]);

  const categorizedEvents = useMemo(() => {
    const otherSportsGroup = [
      EventCategory.NFL,
      EventCategory.DARTS,
      EventCategory.MOTORSPORTS,
      EventCategory.BOXING,
      EventCategory.UFC,
      EventCategory.CRICKET,
      EventCategory.HOCKEY,
      EventCategory.OTHER
    ];

    const map: Record<string, any[]> = {
      'Special': filteredEvents.filter(e => e.isSpecial),
      [EventCategory.FOOTBALL]: filteredEvents.filter(e => e.category === EventCategory.FOOTBALL),
      [EventCategory.NBA]: filteredEvents.filter(e => e.category === EventCategory.NBA),
      [EventCategory.OTHER]: filteredEvents.filter(e => otherSportsGroup.includes(e.category)),
    };

    Object.values(map).forEach(list => {
      list.sort((a, b) => {
        if (a.status === EventStatus.LIVE && b.status !== EventStatus.LIVE) return -1;
        if (a.status !== EventStatus.LIVE && b.status === EventStatus.LIVE) return 1;
        if (a.pinPriority !== b.pinPriority) return b.pinPriority - a.pinPriority;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    });

    return map;
  }, [filteredEvents]);

  const getSlug = (name: string) => {
    if (name === 'Special') return 'special';
    if (name === EventCategory.OTHER) return 'other-sports';
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30">
      <Navbar onSearch={() => {}} />

      {/* Hero Section with Integrated Media Background */}
      <section className="relative w-full overflow-hidden min-h-[600px] flex items-center">
        {/* Background Media Container */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark tint for contrast */}
          
          {/* Faded bottom effect for seamless blending */}
          <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-black/10 to-black pointer-events-none" />
          
          <img 
            src="https://images.unsplash.com/photo-1540747913346-19e3adca174f?q=80&w=1920&auto=format&fit=crop"
            alt="Sports Atmosphere"
            className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-12 pb-24 w-full">
          <div className={`relative text-center space-y-10 transition-all duration-500 ${isSearchFocused ? 'scale-[1.01]' : 'scale-100'}`}>
            <div className={`space-y-6 transition-all duration-500 ${isSearchFocused ? 'opacity-40 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'}`}>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter max-w-4xl mx-auto leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                Watch your favorite <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent">Sports</span> in Ultra HD.
              </h1>
              <h2 className="sr-only">AJ Sports - Free Sports Live Streaming</h2>
              <p className="text-zinc-200 text-sm md:text-lg max-w-xl mx-auto font-bold leading-relaxed drop-shadow-md">
                Experience zero-latency sports streaming with multiple backup servers and 24/7 coverage of major leagues.
              </p>
            </div>

            {/* Search Bar & Socials Container */}
            <div className="max-w-2xl mx-auto w-full px-4 space-y-8">
              <div className={`relative group transition-all duration-300 ease-out transform ${isSearchFocused ? 'scale-[1.05]' : 'scale-100'}`}>
                <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-sky-400' : 'text-zinc-400'}`} />
                <input
                  type="text"
                  placeholder="Search teams, leagues, or sports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full bg-zinc-900/70 backdrop-blur-3xl border border-white/20 rounded-2xl py-6 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all placeholder:text-zinc-500 outline-none shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Social Media Links */}
              <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-4 transition-all duration-500 ${isSearchFocused ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-1'}`}>
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:text-sky-400 transition-all drop-shadow-md"
                >
                  <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Follow on X</span>
                </a>
                <a 
                  href="https://t.me" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:text-[#229ED9] transition-all drop-shadow-md"
                >
                  <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Telegram</span>
                </a>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:text-[#5865F2] transition-all drop-shadow-md"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Discord</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Overlay for Darkening Background Content when search is focused */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-500 pointer-events-none z-40 ${isSearchFocused ? 'opacity-40' : 'opacity-0'}`} 
        aria-hidden="true"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Content Sections Area */}
        <div className={`space-y-24 transition-all duration-500 ${isSearchFocused ? 'brightness-90 opacity-60 pointer-events-none' : 'brightness-100 opacity-100'}`}>
          {CATEGORY_ORDER.map(sectionName => {
            const items = categorizedEvents[sectionName];
            if (!items || items.length === 0) return null;

            const isSpecial = sectionName === 'Special';
            const displayItems = isSpecial ? items.slice(0, 3) : items.slice(0, 4);

            return (
              <section 
                key={sectionName} 
                className={`space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ${
                  isSpecial ? 'bg-zinc-900/10 p-6 md:p-10 rounded-[2.5rem] border border-white/[0.03] relative' : ''
                }`}
              >
                <div className={`flex items-end justify-between border-b border-white/5 pb-2 ${isSpecial ? 'border-yellow-500/10' : ''}`}>
                  <div className="space-y-1.5">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isSpecial ? 'text-yellow-400' : 'text-sky-500'}`}>
                      {isSpecial ? 'Premium Coverage' : 'Discover'}
                    </p>
                    <h2 className={`font-black tracking-tighter ${isSpecial ? 'text-3xl md:text-4xl' : 'text-3xl'}`}>
                      {isSpecial ? 'Special Events' : sectionName}
                    </h2>
                  </div>
                  <Link 
                    to={`/${getSlug(sectionName)}`}
                    className="group flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                  >
                    View full schedule <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className={`grid gap-8 ${
                  isSpecial 
                    ? 'grid-cols-1 md:grid-cols-3' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {displayItems.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            );
          })}

          {filteredEvents.length === 0 && (searchTerm) && (
            <div className="text-center py-32 border border-dashed border-white/5 rounded-3xl">
              <p className="text-zinc-500 text-lg font-medium">No matches found for "<span className="text-white">{searchTerm}</span>"</p>
            </div>
          )}
        </div>
      </main>

      <footer className={`border-t border-white/5 pt-4 pb-2 bg-zinc-950/50 mt-12 transition-all duration-500 ${isSearchFocused ? 'brightness-90 opacity-60' : 'brightness-100 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6 flex flex-col items-center">
          <FooterLogo className="h-16 opacity-80 hover:opacity-100 transition-opacity" />
          
          <div className="space-y-6 w-full">
            <div className="max-w-3xl mx-auto space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Disclaimer</p>
              <p className="text-[10px] leading-relaxed text-zinc-600 font-medium px-4">
                AJ Sports merely links/embeds content uploaded to popular media hosting websites such Vimeo.com, Dailymotion.com, Youtube.com, twitch.tv, reddit.com, etc. AJSports does not host any audiovisual content itself and has no ability to modify such content. We thus cannot accept any liability for the content transmitted by others as we are not affiliated nor endorsed by the external content. All content is copyright of their respective owners.
              </p>
            </div>

            <p className="text-[10px] leading-relaxed text-zinc-600 font-medium px-4">
              © 2025 AJ Sports, Inc. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
