import React, { useState, useMemo, useRef, useEffect, useDeferredValue, useCallback } from 'react';
import { useApp } from '../../AppContext.tsx';
import { EventCategory, getCategorySlug, EventStatus } from '../../types.ts';
import { CATEGORY_ORDER } from '../../constants.ts';
import EventCard from '../../components/EventCard.tsx';
import Navbar from '../../components/Navbar.tsx';
import { ChevronRight, Search, XCircle, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer.tsx';
import { usePageTitle } from '../../utils/usePageTitle.ts';

const Home: React.FC = () => {
  const { events, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSpecialIndex, setActiveSpecialIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const specialScrollRef = useRef<HTMLDivElement>(null);

  const isSearching = deferredSearchTerm.trim().length > 0;

  // Set dynamic page title
  usePageTitle('Live Sports Streaming');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load hero banner ad
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.aclib && typeof window.aclib.runBanner === 'function') {
        try {
          window.aclib.runBanner({
            zoneId: '10766646',
          });
          console.log('[HeroBanner] Loaded zone 10766646');
        } catch (error) {
          console.error('[HeroBanner] Failed to load ad:', error);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        const term = deferredSearchTerm.toLowerCase();
        return (
          e.teams.toLowerCase().includes(term) ||
          e.league.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          (e.keywords && e.keywords.toLowerCase().includes(term)) ||
          (e.isSpecial && 'special'.includes(term))
        );
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, deferredSearchTerm]);

  const liveEvents = useMemo(() => {
    return events
      .filter(e => e.status === EventStatus.LIVE)
      .sort((a, b) => (b.pinPriority || 0) - (a.pinPriority || 0));
  }, [events]);

  const categorizedEvents = useMemo(() => {
    if (isSearching) return {};

    const otherSportsGroup = [
      EventCategory.DARTS, EventCategory.MOTORSPORTS,
      EventCategory.BOXING, EventCategory.UFC, EventCategory.CRICKET,
      EventCategory.HOCKEY, EventCategory.OTHER
    ];

    const map: Record<string, any[]> = {
      'Special': events.filter(e => e.isSpecial),
      [EventCategory.FOOTBALL]: events.filter(e => e.category === EventCategory.FOOTBALL),
      [EventCategory.NBA]: events.filter(e => e.category === EventCategory.NBA),
      [EventCategory.NFL]: events.filter(e => e.category === EventCategory.NFL),
      [EventCategory.OTHER]: events.filter(e => otherSportsGroup.includes(e.category)),
    };

    Object.values(map).forEach(list => {
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

  // Dimensions for standard grid items used in "What's on now?" to match "Football/NBA" grids
  const standardItemClass = "w-[calc(50vw-24px)] sm:w-[280px] md:w-[320px] lg:w-[280px] xl:w-[290px] shrink-0 snap-start";
  
  // Dimensions for Special events (Larger/Cinematic)
  const specialItemClass = "w-[85vw] md:w-[450px] lg:w-[500px] shrink-0 snap-start";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30">
      <Navbar onSearch={() => {}} />

      <section className={`relative w-full flex items-center justify-center overflow-hidden transition-all duration-700 ${isSearching ? 'min-h-[300px] md:min-h-[350px]' : 'min-h-[350px] md:min-h-[420px]'}`}>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
          
          <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none"
            style={{ 
              backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', 
              backgroundSize: '100px 100px' 
            }} 
          />

          <div className="absolute inset-0 z-10 pointer-events-none px-6 py-6 md:px-16 md:py-16 opacity-30">
            <div className="w-full h-full border border-white/5 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-sky-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-sky-500" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-sky-500" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-sky-500" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-px h-12 bg-white/20" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-px h-12 bg-white/20" />
            </div>
          </div>

          <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 w-full text-center transition-all duration-500 ${isSearching ? 'pt-10 md:pt-14 pb-6' : 'pt-8 md:pt-10 pb-10 md:pb-12'}`}>
          <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight md:leading-[1.1]">
              Watch your favorite <br className="hidden sm:block" /> 
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent">sports for free.</span>
            </h1>
            <p className="text-zinc-400 text-[10px] md:text-sm max-w-xl mx-auto font-medium opacity-80">
              Experience zero-latency sports streaming with multiple backup servers and 24/7 coverage.
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-4 transition-all duration-500 mt-8">
            <div className={`relative transition-all duration-500 ${isSearchFocused ? 'scale-[1.01]' : ''}`}>
              <Search className={`absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 h-5 transition-colors ${isSearchFocused ? 'text-sky-400' : 'text-zinc-500'}`} />
              <input
                type="text"
                placeholder="Search sports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full bg-zinc-900/60 backdrop-blur-3xl border rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-11 md:pl-14 pr-12 text-xs md:text-sm font-medium transition-all outline-none ${isSearchFocused ? 'border-sky-500/40 bg-zinc-900/80' : 'border-white/5'}`}
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

            <div className="flex items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
              <a href="https://twitter.com/ajsportstv" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 md:gap-2 text-zinc-500 hover:text-white transition-all">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current group-hover:text-white transition-all">
                  <title>X</title>
                  <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
                </svg>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">Follow on X</span>
              </a>
              <a href="http://t.me/ajsportsch" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 md:gap-2 text-zinc-500 hover:text-white transition-all">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current group-hover:text-[#26A5E4] group-hover:drop-shadow-[0_0_8px_rgba(38,165,228,0.5)] transition-all">
                  <title>Telegram</title>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">Telegram</span>
              </a>
              <a href="https://discord.gg/M9QuKhp8Hb" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 md:gap-2 text-zinc-500 hover:text-white transition-all">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current group-hover:text-[#5865F2] group-hover:drop-shadow-[0_0_8px_rgba(88,101,242,0.5)] transition-all">
                  <title>Discord</title>
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">Discord</span>
              </a>
            </div>
          </div>
          <div className="mt-8">
            <div className="max-w-[728px] mx-auto h-[90px] flex items-center justify-center bg-zinc-900/20 rounded-xl border border-white/5">
              <div id="home-hero-banner-10766646" className="w-full h-full flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Advertisement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 transition-all duration-500 ${isSearching ? 'pb-16' : 'space-y-12 md:space-y-16 md:pt-0 pb-16'}`}>
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 animate-in fade-in duration-700">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 rounded-full animate-spin"></div>
              {/* Inner pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-sky-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-sm md:text-base font-medium text-zinc-400 animate-pulse">
              Loading events...
            </p>
          </div>
        ) : isSearching ? (
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
          <>
            {CATEGORY_ORDER.map(sectionName => {
              const items = categorizedEvents[sectionName];
              
              // Define blocks to render for this iteration
              const blocks = [];

              // If we are at Football, inject "What's on now?" first
              if (sectionName === EventCategory.FOOTBALL && liveEvents.length > 0) {
                blocks.push(
                  <section key="live-now" className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-end justify-between border-b border-white/10 pb-3 md:pb-4">
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                          Currently Broadcasting
                        </p>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter">What's on now?</h2>
                      </div>
                    </div>
                    
                    {/* Horizontal scroll for Live events - using standard sizing to match Discover grids */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-4 styled-h-scrollbar">
                      {liveEvents.slice(0, 12).map(event => (
                        <div key={event.id} className={standardItemClass}>
                          <EventCard event={event} />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (items?.length) {
                const isSpecial = sectionName === 'Special';

                blocks.push(
                  <section 
                    key={sectionName} 
                    className={isSpecial 
                      ? 'bg-zinc-900/10 p-6 md:p-10 md:pt-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.04] shadow-2xl space-y-6 md:space-y-10' 
                      : 'space-y-6 md:space-y-8'
                    }
                  >
                    <div className={`flex items-end justify-between border-b pb-3 md:pb-4 ${isSpecial ? 'border-white/5' : 'border-white/10'}`}>
                      <div className="space-y-1 md:space-y-2">
                        <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] ${isSpecial ? 'text-yellow-400' : 'text-sky-500'}`}>
                          {isSpecial ? 'Premium Coverage' : 'Discover'}
                        </p>
                        <h2 className={`font-black tracking-tighter ${isSpecial ? 'text-2xl md:text-4xl leading-none' : 'text-xl md:text-3xl'}`}>
                          {isSpecial ? 'Special Events' : sectionName}
                        </h2>
                      </div>
                      <Link to={`/${getCategorySlug(sectionName)}`} className="group flex items-center gap-1.5 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                        All Events <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {isSpecial ? (
                      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 styled-h-scrollbar pb-4">
                        {items.slice(0, 12).map(event => (
                          <div key={event.id} className={specialItemClass}>
                            <EventCard event={event} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-4 styled-h-scrollbar">
                        {items.slice(0, 12).map(event => (
                          <div key={event.id} className={standardItemClass}>
                            <EventCard event={event} />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              }

              return blocks;
            })}
          </>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 md:bottom-12 md:right-10 z-[60] p-4 bg-zinc-900/60 backdrop-blur-2xl border border-white/10 text-sky-500 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:bg-sky-500 hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default Home;
