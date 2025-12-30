import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { EventCategory, categoryFromSlug, SportEvent } from '../../types.ts';
import { usePageTitle } from '../../utils/usePageTitle.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import AdSlot from '../../components/AdSlot.tsx';
import NotFound from './NotFound.tsx';
import { ChevronLeft, Search, XCircle, ChevronDown } from 'lucide-react';
import Footer from '../../components/Footer.tsx';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { events } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  const displayName = categoryFromSlug(categorySlug || '');
  
  // Validation: In App.tsx, the dynamic route /:categorySlug catches everything.
  // We check if the slug is actually one of our supported sections.
  const isValidCategory = displayName !== 'Category';
  
  const isSpecialPage = categorySlug === 'special';
  const isOtherSportsPage = categorySlug === 'other-sports';

  // Set dynamic page title
  usePageTitle(isSpecialPage ? 'Special Events' : displayName);

  const filteredEvents = useMemo(() => {
    if (!isValidCategory) return [];

    const otherSportsGroup = [
      EventCategory.NFL, EventCategory.DARTS, EventCategory.MOTORSPORTS,
      EventCategory.BOXING, EventCategory.UFC, EventCategory.CRICKET,
      EventCategory.HOCKEY, EventCategory.OTHER
    ];

    return events.filter(e => {
      let matchesCategory = false;
      if (isSpecialPage) {
        matchesCategory = e.isSpecial;
      } else if (isOtherSportsPage) {
        matchesCategory = otherSportsGroup.includes(e.category);
      } else {
        matchesCategory = e.category === displayName;
      }
      
      if (!matchesCategory) return false;

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      
      return (
        e.teams.toLowerCase().includes(term) || 
        e.league.toLowerCase().includes(term) ||
        (e.keywords && e.keywords.toLowerCase().includes(term))
      );
    });
  }, [events, categorySlug, searchTerm, displayName, isSpecialPage, isOtherSportsPage, isValidCategory]);

  // If not a valid category route, show the 404 page
  if (!isValidCategory) {
    return <NotFound />;
  }

  // Group events by day
  const groupedEvents = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    const groups: { dateLabel: string; events: SportEvent[] }[] = [];
    const groupMap: Record<string, SportEvent[]> = {};

    const formatDateKey = (dateStr: string) => {
      const d = new Date(dateStr);
      // We use a sortable key like YYYY-MM-DD
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getDisplayLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const dateText = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
      
      if (eventDate.getTime() === today.getTime()) return `Today, ${dateText}`;
      if (eventDate.getTime() === tomorrow.getTime()) return `Tomorrow, ${dateText}`;
      
      return dateText;
    };

    sorted.forEach(event => {
      const key = formatDateKey(event.startTime);
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push(event);
    });

    // Extract keys and sort them to ensure chronological order of groups
    Object.keys(groupMap).sort().forEach(key => {
      groups.push({
        dateLabel: getDisplayLabel(groupMap[key][0].startTime),
        events: groupMap[key]
      });
    });

    return groups;
  }, [filteredEvents]);

  const clearSearch = () => {
    setSearchTerm('');
    setVisibleCount(16); // Reset visible count when clearing search
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const totalEventCount = filteredEvents.length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar onSearch={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 flex-1 w-full space-y-12 md:space-y-16">
        <div className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-sky-400 group transition-colors">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isSpecialPage ? 'text-yellow-500' : 'text-sky-500'}`}>Browsing Category</p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter capitalize leading-none">
                {isSpecialPage ? 'Special Events' : displayName}
              </h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 min-w-[240px]">
              <div className={`relative w-full max-w-[200px] transition-all duration-300 ${isSearchFocused ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
                <Search className={`absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors ${isSearchFocused ? 'text-sky-400' : 'text-zinc-400'}`} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full bg-transparent border-b border-white/20 py-1.5 pl-6 pr-6 text-[11px] font-bold transition-all outline-none focus:border-sky-500/50 placeholder:text-zinc-600"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  {searchTerm ? 'Matches' : 'Active Events'}: <span className="text-zinc-300">{totalEventCount}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-16 pb-20">
          {groupedEvents.length > 0 ? (
            <>
              {(() => {
                let eventCount = 0;
                const sections = [];
                
                for (let groupIdx = 0; groupIdx < groupedEvents.length; groupIdx++) {
                  const group = groupedEvents[groupIdx];
                  const eventsToShow = [];
                  
                  for (const event of group.events) {
                    if (eventCount < visibleCount) {
                      eventsToShow.push(event);
                      eventCount++;
                    } else {
                      break;
                    }
                  }
                  
                  if (eventsToShow.length > 0) {
                    sections.push(
                      <section key={group.dateLabel} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                        <div className="flex items-center gap-4">
                          <h2 className="text-lg md:text-xl font-black tracking-tighter uppercase text-white/90">
                            {group.dateLabel}
                          </h2>
                          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
                          {eventsToShow.map(event => (
                            <EventCard key={event.id} event={event} />
                          ))}
                        </div>
                      </section>
                    );
                  }
                  
                  if (eventCount >= visibleCount) {
                    break;
                  }
                }
                
                return sections;
              })()}
              
              {visibleCount < totalEventCount && (
                <div className="flex justify-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <button
                    onClick={handleLoadMore}
                    className="group relative px-8 py-4 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-sky-500/10 hover:border-sky-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm md:text-base font-black uppercase tracking-widest text-zinc-300 group-hover:text-sky-400 transition-colors">
                        Load More
                      </span>
                      <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-sky-400 group-hover:translate-y-1 transition-all" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">
                      {Math.min(12, totalEventCount - visibleCount)} more events
                    </p>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 md:py-48 bg-zinc-900/10 rounded-[2rem] md:rounded-[3.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center space-y-4">
              <p className="text-zinc-500 text-sm md:text-base font-bold uppercase tracking-widest">
                {searchTerm ? `No matches for "${searchTerm}"` : 'No events currently listed.'}
              </p>
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="text-sky-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-sky-400 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
