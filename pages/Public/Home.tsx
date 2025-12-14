
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

      {/* Hero Section */}
      <section className="relative w-full min-h-[350px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Layer Group */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-50 grayscale"
          >
            <source src="500kb.mp4" type="video/mp4" />
          </video>
          <div 
            className="absolute inset-0 z-10" 
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.5) 75%, #000000 100%)'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-8 md:pt-12 pb-12 md:pb-16 w-full">
          <div className="relative text-center space-y-6 md:space-y-8">
            {/* Headlines Section */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl md:text-6xl font-black tracking-tighter max-w-4xl mx-auto leading-tight md:leading-[1.1] drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                Watch your favorite <br className="hidden sm:block" /> 
                <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent">sports for free.</span>
              </h1>
              <p className="text-zinc-400 text-[10px] md:text-base max-w-xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] px-4">
                Experience zero-latency sports streaming with multiple backup servers and 24/7 coverage of major leagues worldwide.
              </p>
            </div>

            {/* Search Bar Container */}
            <div className="max-w-2xl mx-auto w-full px-4 space-y-6 md:space-y-8 relative z-30">
              <div className={`relative group transition-all duration-500 transform ${isSearchFocused ? 'scale-[1.01]' : 'scale-100'}`}>
                <Search className={`absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 h-5 transition-colors duration-300 ${isSearchFocused ? 'text-sky-400' : 'text-zinc-500'}`} />
                <input
                  type="text"
                  placeholder="Search sports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full bg-zinc-900/60 backdrop-blur-3xl border rounded-xl md:rounded-2xl py-3.5 md:py-5 pl-11 md:pl-14 pr-6 md:pr-8 text-xs md:text-sm font-medium transition-all placeholder:text-zinc-600 outline-none shadow-2xl ${
                    isSearchFocused 
                      ? 'border-sky-500/40 bg-zinc-900/80' 
                      : 'border-white/5'
                  }`}
                />
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-10 gap-y-4">
                <a href="https://twitter.com/ajsportstv" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[12px] md:w-[14px] h-[12px] md:h-[14px] fill-current">
                    <title>X</title>
                    <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
                  </svg>
                  <span>Follow on X</span>
                </a>
                <a href="http://t.me/ajsports" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[12px] md:w-[14px] h-[12px] md:h-[14px] fill-current">
                    <title>Telegram</title>
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>Join Telegram</span>
                </a>
                <a href="https://discord.gg/M9QuKhp8Hb" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[12px] md:w-[14px] h-[12px] md:h-[14px] fill-current">
                    <title>Discord</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.0777.0777 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  <span>Join Discord</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-32 relative z-30 pt-8 md:pt-16">
        <div className="space-y-16 md:space-y-32">
          {CATEGORY_ORDER.map(sectionName => {
            const items = categorizedEvents[sectionName];
            if (!items || items.length === 0) return null;

            const isSpecial = sectionName === 'Special';
            const displayItems = isSpecial ? items.slice(0, 3) : items.slice(0, 4);

            return (
              <section 
                key={sectionName} 
                className={`space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 ${
                  isSpecial ? 'bg-zinc-900/10 p-6 md:p-14 rounded-[2rem] md:rounded-[4rem] border border-white/[0.04] relative shadow-2xl' : ''
                }`}
              >
                <div className={`flex items-end justify-between border-b border-white/10 pb-4 md:pb-6 ${isSpecial ? 'border-yellow-500/20' : ''}`}>
                  <div className="space-y-1.5 md:space-y-3">
                    <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] ${isSpecial ? 'text-yellow-400' : 'text-sky-500'}`}>
                      {isSpecial ? 'Premium Coverage' : 'Discover'}
                    </p>
                    <h2 className={`font-black tracking-tighter ${isSpecial ? 'text-2xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
                      {isSpecial ? 'Special Events' : sectionName}
                    </h2>
                  </div>
                  <Link 
                    to={`/${getSlug(sectionName)}`}
                    className="group flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[12px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                  >
                    All Events <ChevronRight className="w-4 h-4 md:w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>

                <div className={`grid gap-4 md:gap-12 ${
                  isSpecial 
                    ? 'grid-cols-1 md:grid-cols-3' 
                    : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {displayItems.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            );
          })}

          {filteredEvents.length === 0 && (searchTerm) && (
            <div className="text-center py-24 md:py-48 border border-dashed border-white/10 rounded-[2rem] md:rounded-[4rem] bg-zinc-950">
              <p className="text-zinc-600 text-lg md:text-2xl font-medium tracking-tight">No results for "<span className="text-white font-black">{searchTerm}</span>"</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 pt-12 md:pt-16 pb-8 md:pb-12 bg-zinc-950/95 mt-16 md:mt-32">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-10 md:space-y-12 flex flex-col items-center">
          <FooterLogo className="h-12 md:h-16 opacity-80 hover:opacity-100 transition-opacity" />
          
          <div className="space-y-10 md:space-y-12 w-full">
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
              <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-600">Legal Notice</p>
              <p className="text-[10px] md:text-[12px] leading-relaxed text-zinc-500 font-medium px-4 md:px-8 max-w-4xl mx-auto opacity-70">
                AJ Sports merely links/embeds content uploaded to popular media hosting websites such Vimeo.com, Dailymotion.com, Youtube.com, twitch.tv, reddit.com, etc. AJSports does not host any audiovisual content itself and has no ability to modify such content. We thus cannot accept any liability for the content transmitted by others as we are not affiliated nor endorsed by the external content. All content is copyright of their respective owners.
              </p>
            </div>

            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-800 border-t border-white/5 pt-8 md:pt-12">
              © 2025 AJ Sports, Inc. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
