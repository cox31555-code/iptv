
import React, { useState, useMemo } from 'react';
import { useApp } from '../../AppContext.tsx';
import { EventCategory, EventStatus } from '../../types.ts';
import { CATEGORY_ORDER } from '../../constants.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo.tsx';
import FooterLogo from '../../components/FooterLogo.tsx';

const Home: React.FC = () => {
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

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
    const map: Record<string, any[]> = {
      'Special': filteredEvents.filter(e => e.isSpecial),
      [EventCategory.FOOTBALL]: filteredEvents.filter(e => e.category === EventCategory.FOOTBALL),
      [EventCategory.NBA]: filteredEvents.filter(e => e.category === EventCategory.NBA),
      [EventCategory.OTHER]: filteredEvents.filter(e => e.category === EventCategory.OTHER),
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30">
      <Navbar onSearch={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0 space-y-24">
        {/* Hero Area */}
        <div className="relative py-12 text-center space-y-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter max-w-3xl mx-auto leading-tight">
              Watch your favorite <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent">Sports</span> in Ultra HD.
            </h1>
            <h2 className="sr-only">AJSports - Leading Sports Streaming Platform</h2>
            <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
              Experience zero-latency sports streaming with multiple backup servers and 24/7 coverage of major leagues.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto w-full px-4">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search teams, leagues, or sports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-1 focus:ring-white focus:border-white/40 transition-all placeholder:text-zinc-600 outline-none shadow-2xl"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

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
              <div className={`flex items-end justify-between border-b border-white/5 pb-2 ${isSpecial ? 'border-sky-500/10' : ''}`}>
                <div className="space-y-1.5">
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isSpecial ? 'text-sky-400' : 'text-zinc-500'}`}>
                    {isSpecial ? 'Premium Coverage' : 'Discover'}
                  </p>
                  <h2 className={`font-black tracking-tighter ${isSpecial ? 'text-3xl md:text-4xl' : 'text-3xl'}`}>
                    {isSpecial ? 'Special Events' : sectionName}
                  </h2>
                </div>
                <Link 
                  to={`/category/${sectionName}`}
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

        {filteredEvents.length === 0 && (
          <div className="text-center py-32 border border-dashed border-white/5 rounded-3xl">
            <p className="text-zinc-500 text-lg font-medium">No matches found for "<span className="text-white">{searchTerm}</span>"</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 pt-4 pb-2 bg-zinc-950/50 mt-12">
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
