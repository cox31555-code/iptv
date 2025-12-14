
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../AppContext.tsx';
import { EventCategory, EventStatus, getCategorySlug } from '../../types.ts';
import { CATEGORY_ORDER } from '../../constants.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronRight, Search, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FooterLogo from '../../components/FooterLogo.tsx';

const Home: React.FC = () => {
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSpecialIndex, setActiveSpecialIndex] = useState(0);
  const specialScrollRef = useRef<HTMLDivElement>(null);

  const isSearching = searchTerm.trim().length > 0;

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        const term = searchTerm.toLowerCase();
        return (
          e.teams.toLowerCase().includes(term) ||
          e.league.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          (e.isSpecial && 'special'.includes(term))
        );
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, searchTerm]);

  const categorizedEvents = useMemo(() => {
    // Only compute categories if not searching to save resources
    if (isSearching) return {};

    const otherSportsGroup = [
      EventCategory.NFL, EventCategory.DARTS, EventCategory.MOTORSPORTS,
      EventCategory.BOXING, EventCategory.UFC, EventCategory.CRICKET,
      EventCategory.HOCKEY, EventCategory.OTHER
    ];

    const map: Record<string, any[]> = {
      'Special': events.filter(e => e.isSpecial),
      [EventCategory.FOOTBALL]: events.filter(e => e.category === EventCategory.FOOTBALL),
      [EventCategory.NBA]: events.filter(e => e.category === EventCategory.NBA),
      [EventCategory.OTHER]: events.filter(e => otherSportsGroup.includes(e.category)),
    };

    Object.values(map).forEach(list => {
      // Sort purely by oldest start time first as requested
      list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    return map;
  }, [events, isSearching]);

  const handleSpecialScroll = () => {
    if (specialScrollRef.current) {
      const { scrollLeft, clientWidth } = specialScrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSpecialIndex(index);
    }
  };

  const clearSearch = () => setSearchTerm('');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30">
      <Navbar onSearch={() => {}} />

      <section className={`relative w-full flex items-center justify-center overflow-hidden transition-all duration-700 ${isSearching ? 'min-h-[300px] md:min-h-[400px]' : 'min-h-[350px] md:min-h-[500px]'}`}>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50 grayscale">
            <source src="500kb.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 w-full text-center transition-all duration-500 ${isSearching ? 'pt-12 md:pt-16 pb-8' : 'pt-8 md:pt-12 pb-12 md:pb-16'}`}>
          <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight md:leading-[1.1]">
              Watch your favorite <br className="hidden sm:block" /> 
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent">sports for free.</span>
            </h1>
            <p className="text-zinc-400 text-[10px] md:text-base max-w-xl mx-auto font-medium">
              Experience zero-latency sports streaming with multiple backup servers and 24/7 coverage.
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-4 transition-all duration-500 mt-10">
            <div className={`relative transition-all duration-500 ${isSearchFocused ? 'scale-[1.01]' : ''}`}>
              <Search className={`absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 h-5 transition-colors ${isSearchFocused ? 'text-sky-400' : 'text-zinc-500'}`} />
              <input
                type="text"
                placeholder="Search sports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full bg-zinc-900/60 backdrop-blur-3xl border rounded-xl md:rounded-2xl py-3.5 md:py-5 pl-11 md:pl-14 pr-12 text-xs md:text-sm font-medium transition-all outline-none ${isSearchFocused ? 'border-sky-500/40 bg-zinc-900/80' : 'border-white/5'}`}
              />
              {isSearching && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <XCircle className="w-4 h-4 md:w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 transition-all duration-500 ${isSearching ? 'pb-20' : 'space-y-16 md:space-y-32 md:pt-0 pb-16'}`}>
        {isSearching ? (
          /* Unified Search Results Grid */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter">
                Search Results <span className="text-sky-500 ml-2">({filteredEvents.length})</span>
              </h2>
            </div>
            
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-zinc-900/10 border border-dashed border-white/5 rounded-3xl">
                <p className="text-zinc-500 font-medium">No matches found for "{searchTerm}"</p>
                <button onClick={clearSearch} className="mt-4 text-sky-500 font-bold text-xs uppercase tracking-widest hover:underline">Clear Search</button>
              </div>
            )}
          </div>
        ) : (
          /* Standard Categorized View */
          CATEGORY_ORDER.map(sectionName => {
            const items = categorizedEvents[sectionName];
            if (!items?.length) return null;

            const isSpecial = sectionName === 'Special';
            const specialItems = items.slice(0, 3);

            return (
              <section 
                key={sectionName} 
                className={isSpecial 
                  ? 'bg-zinc-900/10 pt-0 px-6 pb-6 md:pt-0 md:px-14 md:pb-14 rounded-[2rem] md:rounded-[4rem] border border-white/[0.04] shadow-2xl space-y-8' 
                  : 'space-y-8'
                }
              >
                <div className={`flex items-end justify-between border-b border-white/10 pb-4 ${isSpecial ? 'border-yellow-500/20' : ''}`}>
                  <div className="space-y-1.5 md:space-y-3">
                    <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] ${isSpecial ? 'text-yellow-400' : 'text-sky-500'}`}>
                      {isSpecial ? 'Premium Coverage' : 'Discover'}
                    </p>
                    <h2 className={`font-black tracking-tighter ${isSpecial ? 'text-2xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
                      {isSpecial ? 'Special Events' : sectionName}
                    </h2>
                  </div>
                  <Link to={`/${getCategorySlug(sectionName)}`} className="group flex items-center gap-1.5 text-[10px] md:text-[12px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                    All Events <ChevronRight className="w-4 h-4 md:w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>

                {isSpecial ? (
                  <div className="relative">
                    <div className="block md:hidden space-y-6">
                      <div 
                        ref={specialScrollRef}
                        onScroll={handleSpecialScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar -mx-2 px-2"
                      >
                        {specialItems.map(event => (
                          <div key={event.id} className="min-w-[88vw] snap-center">
                            <EventCard event={event} />
                          </div>
                        ))}
                      </div>
                      {specialItems.length > 1 && (
                        <div className="flex justify-center items-center gap-2">
                          {specialItems.map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1 rounded-full transition-all duration-300 ${activeSpecialIndex === i ? 'w-8 bg-yellow-500' : 'w-2 bg-zinc-800'}`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="hidden md:grid grid-cols-3 gap-12">
                      {specialItems.map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-12">
                    {items.slice(0, 4).map(event => <EventCard key={event.id} event={event} />)}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      <footer className="border-t border-white/5 pt-12 pb-8 bg-zinc-950/95 mt-16 flex flex-col items-center">
        <FooterLogo className="h-12 md:h-16 opacity-80" />
        <p className="text-[10px] text-zinc-500 max-w-4xl mx-auto px-8 mt-10 leading-relaxed text-center opacity-70">
          AJ Sports merely links/embeds content hosted elsewhere. We do not host any content and are not affiliated with external providers.
        </p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 border-t border-white/5 pt-8 mt-8">
          © 2025 AJ Sports, Inc. All rights reserved
        </p>
      </footer>
    </div>
  );
};

export default Home;
