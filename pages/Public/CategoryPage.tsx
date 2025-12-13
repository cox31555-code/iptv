
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { EventStatus } from '../../types.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronLeft } from 'lucide-react';
import Logo from '../../components/Logo.tsx';
import FooterLogo from '../../components/FooterLogo.tsx';

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (e.isDeleted) return false;
      
      const isSpecialPage = categoryName === 'Special';
      const matchesCategory = isSpecialPage ? e.isSpecial : (e.category === categoryName);
      
      if (!matchesCategory) return false;

      const term = searchTerm.toLowerCase();
      return (
        e.teams.toLowerCase().includes(term) ||
        e.league.toLowerCase().includes(term)
      );
    });
  }, [events, categoryName, searchTerm]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (a.status === EventStatus.LIVE && b.status !== EventStatus.LIVE) return -1;
      if (a.status !== EventStatus.LIVE && b.status === EventStatus.LIVE) return 1;
      if (a.pinPriority !== b.pinPriority) return b.pinPriority - a.pinPriority;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar onSearch={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0 space-y-12 flex-1 w-full">
        <div className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-sky-400 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="text-sky-500">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Browsing Category</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{categoryName}</h1>
            </div>
            
            <p className="text-zinc-500 text-sm font-medium">
              Showing {sortedEvents.length} active events
            </p>
          </div>
        </div>

        {sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5">
            <p className="text-zinc-500 text-lg font-medium">
              No {categoryName} events found {searchTerm && `for "${searchTerm}"`}
            </p>
            <Link to="/" className="inline-block mt-4 text-sky-500 text-sm font-bold hover:underline">
              Explore other sports
            </Link>
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

export default CategoryPage;
