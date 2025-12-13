
import React, { useState, useMemo } from 'react';
import { useApp } from '../../AppContext.tsx';
import { EventCategory, EventStatus } from '../../types.ts';
import { CATEGORY_ORDER } from '../../constants.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronRight } from 'lucide-react';

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
        e.category.toLowerCase().includes(term)
      );
    });
  }, [events, searchTerm]);

  const categorizedEvents = useMemo(() => {
    const map: Record<EventCategory, any[]> = {
      [EventCategory.SPECIAL]: [],
      [EventCategory.FOOTBALL]: [],
      [EventCategory.NBA]: [],
    };

    filteredEvents.forEach(e => {
      map[e.category].push(e);
    });

    // Sort within categories: Live first, then by pinPriority, then by startTime
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
    <div className="min-h-screen bg-[#0B0C10]">
      <Navbar onSearch={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {CATEGORY_ORDER.map(category => {
          const items = categorizedEvents[category];
          if (items.length === 0) return null;

          return (
            <section key={category} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#04C4FC] rounded-full" />
                  <h2 className="text-2xl font-bold tracking-tight">{category} Events</h2>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-[#04C4FC] hover:underline">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No events found matching your search.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-white/20">© 2024 ProStream Sports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;