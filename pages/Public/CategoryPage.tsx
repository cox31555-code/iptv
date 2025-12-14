
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { EventStatus, EventCategory, categoryFromSlug } from '../../types.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronLeft } from 'lucide-react';
import FooterLogo from '../../components/FooterLogo.tsx';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const displayName = categoryFromSlug(categorySlug || '');
  const isSpecialPage = categorySlug === 'special';
  const isOtherSportsPage = categorySlug === 'other-sports';

  const filteredEvents = useMemo(() => {
    const otherSportsGroup = [
      EventCategory.NFL, EventCategory.DARTS, EventCategory.MOTORSPORTS,
      EventCategory.BOXING, EventCategory.UFC, EventCategory.CRICKET,
      EventCategory.HOCKEY, EventCategory.OTHER
    ];

    return events.filter(e => {
      // isDeleted check removed because deleted events no longer exist in state
      let matchesCategory = false;
      if (isSpecialPage) {
        matchesCategory = e.isSpecial;
      } else if (isOtherSportsPage) {
        matchesCategory = otherSportsGroup.includes(e.category);
      } else {
        matchesCategory = e.category === displayName;
      }
      
      if (!matchesCategory) return false;

      const term = searchTerm.toLowerCase();
      return e.teams.toLowerCase().includes(term) || e.league.toLowerCase().includes(term);
    });
  }, [events, categorySlug, searchTerm, displayName, isSpecialPage, isOtherSportsPage]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      // Sort purely by oldest start time first
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar onSearch={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 flex-1 w-full space-y-12">
        <div className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-sky-400 group transition-colors">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isSpecialPage ? 'text-yellow-500' : 'text-sky-500'}`}>Browsing Category</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter capitalize">{displayName}</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Showing {sortedEvents.length} active events</p>
          </div>
        </div>

        {sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="text-center py-40 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5">
            <p className="text-zinc-500 text-lg font-medium">No events found in this category.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 pt-12 pb-8 bg-zinc-950/50 mt-12 flex flex-col items-center">
        <FooterLogo className="h-16 opacity-80" />
        <p className="text-[10px] text-zinc-600 mt-6 max-w-3xl text-center px-4">
          All content is copyright of their respective owners. AJ Sports is an indexing service.
        </p>
      </footer>
    </div>
  );
};

export default CategoryPage;
