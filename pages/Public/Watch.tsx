
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { ChevronLeft, Trophy, Server, Play } from 'lucide-react';
import Navbar from '../../components/Navbar.tsx';
import { EventStatus, EventCategory } from '../../types.ts';
import Logo from '../../components/Logo.tsx';
import FootballIcon from '../../components/FootballIcon.tsx';
import NBAIcon from '../../components/NBAIcon.tsx';
import NFLIcon from '../../components/NFLIcon.tsx';
import MotorsportsIcon from '../../components/MotorsportsIcon.tsx';
import UFCIcon from '../../components/UFCIcon.tsx';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { events } = useApp();
  const event = events.find(e => e.id === id);

  const [activeServer, setActiveServer] = useState(
    event?.servers.find(s => s.isDefault && s.isActive) || event?.servers[0]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Split teams logic
  const matchup = useMemo(() => {
    if (!event) return { teamA: '', teamB: '' };
    const parts = event.teams.split(/\s+vs\s+/i);
    return {
      teamA: parts[0] || 'Team A',
      teamB: parts[1] || 'Team B'
    };
  }, [event]);

  if (!event || event.isDeleted) {
    return <Navigate to="/" />;
  }

  const kickoffDate = new Date(event.startTime).toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  });
  
  const kickoffTime = new Date(event.startTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });

  const renderLeagueIcon = () => {
    if (event.leagueLogoUrl) {
      return <img src={event.leagueLogoUrl} alt={event.league} className="h-10 w-auto object-contain" />;
    }

    const iconClass = "h-10 w-auto text-sky-500/80";
    switch (event.category) {
      case EventCategory.FOOTBALL: return <FootballIcon className={iconClass} />;
      case EventCategory.NBA: return <NBAIcon className={iconClass} />;
      case EventCategory.NFL: return <NFLIcon className={iconClass} />;
      case EventCategory.MOTORSPORTS: return <MotorsportsIcon className={iconClass} />;
      case EventCategory.BOXING:
      case EventCategory.UFC: return <UFCIcon className={iconClass} />;
      default: return <Trophy className="w-10 h-10 text-sky-500/80" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-4 pb-12 md:pb-20 space-y-4 md:space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-2">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-sky-400 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </div>

        {/* Cinematic Matchup Header */}
        <div className="flex flex-col items-center justify-center py-2 md:py-4 space-y-6 md:space-y-8 text-center">
          {/* League Info - Redesigned */}
          <div className="flex flex-col items-center gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-zinc-900/50 rounded-2xl md:rounded-[2rem] border border-white/5 backdrop-blur-3xl flex items-center justify-center min-w-[60px] min-h-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {renderLeagueIcon()}
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <div className="h-px w-6 md:w-12 bg-gradient-to-r from-transparent via-zinc-800 to-zinc-700" />
              <span className="text-[9px] md:text-[11px] font-black tracking-[0.4em] text-zinc-500 uppercase">
                {event.league}
              </span>
              <div className="h-px w-6 md:w-12 bg-gradient-to-l from-transparent via-zinc-800 to-zinc-700" />
            </div>
          </div>

          {/* Team Versus Row */}
          <div className="flex items-center justify-center gap-4 md:gap-16 w-full max-w-5xl px-4">
            {/* Team A */}
            <div className="flex flex-1 items-center justify-end gap-3 md:gap-10">
              <h2 className="text-xl md:text-6xl font-black tracking-tighter text-right leading-none line-clamp-2 order-2 md:order-1 drop-shadow-2xl">
                {matchup.teamA}
              </h2>
              <div className="w-16 h-16 md:w-36 md:h-36 bg-zinc-900 rounded-2xl md:rounded-[3rem] border border-white/5 flex items-center justify-center shrink-0 order-1 md:order-2 shadow-2xl overflow-hidden p-3 md:p-8 group hover:border-sky-500/30 transition-all duration-500">
                {event.teamALogoUrl ? (
                  <img src={event.teamALogoUrl} alt={matchup.teamA} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Logo className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity" />
                )}
              </div>
            </div>

            {/* VS Divider */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block mb-6" />
              <span className="text-zinc-700 text-[10px] md:text-sm font-black italic uppercase tracking-[0.3em]">VS</span>
              <div className="h-16 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent hidden md:block mt-6" />
            </div>

            {/* Team B */}
            <div className="flex flex-1 items-center justify-start gap-3 md:gap-10">
              <div className="w-16 h-16 md:w-36 md:h-36 bg-zinc-900 rounded-2xl md:rounded-[3rem] border border-white/5 flex items-center justify-center shrink-0 shadow-2xl overflow-hidden p-3 md:p-8 group hover:border-sky-500/30 transition-all duration-500">
                {event.teamBLogoUrl ? (
                  <img src={event.teamBLogoUrl} alt={matchup.teamB} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Logo className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity" />
                )}
              </div>
              <h2 className="text-xl md:text-6xl font-black tracking-tighter text-left leading-none line-clamp-2 drop-shadow-2xl">
                {matchup.teamB}
              </h2>
            </div>
          </div>

          {/* Time & Venue */}
          <div className="space-y-2">
            <p className="text-zinc-400 text-sm md:text-xl font-bold tracking-tight">
              {kickoffDate} • {kickoffTime}
            </p>
            <p className="text-sky-500/60 text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em]">
              {event.stadium || (event.category === EventCategory.FOOTBALL ? 'International Stadium' : 'Main Event Arena')}
            </p>
          </div>
        </div>

        {/* Player Container */}
        <div className="bg-zinc-900 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/5 aspect-video w-full relative group !mt-0">
          {activeServer ? (
            <iframe
              src={activeServer.embedUrl}
              className="w-full h-full border-none"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen={true}
              title="Stream Player"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4">
              <div className="p-4 bg-white/5 rounded-full">
                <Server className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">No servers active</p>
            </div>
          )}
        </div>

        {/* Compact Server Selection */}
        <div className="bg-zinc-900/20 backdrop-blur-3xl p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-white/5 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="space-y-0.5">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-sky-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-sky-500 rounded-full animate-pulse" />
                Available Sources
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.1em]">
                Multiple Sources Available
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {event.servers.filter(s => s.isActive).sort((a,b) => a.sortOrder - b.sortOrder).map((server, idx) => (
              <button
                key={server.id}
                onClick={() => setActiveServer(server)}
                className={`group/server flex items-center justify-between w-full px-4 py-3.5 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                  activeServer?.id === server.id
                    ? 'bg-sky-500 text-black border-sky-400 shadow-[0_10px_20px_rgba(14,165,233,0.2)]'
                    : 'bg-zinc-950/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`text-[8px] font-bold ${activeServer?.id === server.id ? 'opacity-60' : 'opacity-20 group-hover/server:opacity-40'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{server.name}</span>
                </div>
                {activeServer?.id === server.id && (
                  <div className="w-1.5 h-1.5 bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;
