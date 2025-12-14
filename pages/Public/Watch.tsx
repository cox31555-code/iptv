import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { ChevronLeft, Server } from 'lucide-react';
import Navbar from '../../components/Navbar.tsx';
import { EventCategory, EventStatus } from '../../types.ts';
import Logo from '../../components/Logo.tsx';
import SportIcon from '../../components/SportIcon.tsx';
import Footer from '../../components/Footer.tsx';

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

  const matchup = useMemo(() => {
    if (!event) return { teamA: '', teamB: '' };
    const parts = event.teams.split(/\s+vs\s+/i);
    return {
      teamA: parts[0] || 'Team A',
      teamB: parts[1] || 'Team B'
    };
  }, [event]);

  if (!event) {
    return <Navigate to="/" />;
  }

  const isIndividualSport = [
    EventCategory.MOTORSPORTS,
    EventCategory.DARTS,
    EventCategory.BOXING,
    EventCategory.UFC
  ].includes(event.category as EventCategory);

  const kickoffDate = new Date(event.startTime).toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  });
  
  const kickoffTime = new Date(event.startTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });

  const TeamLogo = ({ url, name, className = "" }: { url?: string; name: string; className?: string }) => (
    <div className={`bg-zinc-900 rounded-2xl md:rounded-2xl border border-white/5 flex items-center justify-center shrink-0 shadow-xl overflow-hidden p-3 md:p-4 group hover:border-sky-500/30 transition-all duration-500 ${className}`}>
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
      ) : (
        <Logo className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity" />
      )}
    </div>
  );

  const activeServers = event.servers.filter(s => s.isActive).sort((a,b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30 flex flex-col">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-4 pb-12 md:pb-20 space-y-4 md:space-y-6 flex-1 w-full">
        <div className="flex items-center justify-between py-1">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-sky-400 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-4 md:py-4 space-y-4 md:space-y-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 md:p-2.5 bg-zinc-900/50 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-3xl flex items-center justify-center min-w-[56px] min-h-[56px] md:min-w-[48px] md:min-h-[48px] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
              {event.leagueLogoUrl ? (
                <img src={event.leagueLogoUrl} alt={event.league} className="h-10 md:h-8 w-auto object-contain" />
              ) : (
                <SportIcon category={event.category} className="h-10 md:h-7 w-auto text-sky-500/60" />
              )}
            </div>
            
            <div className="flex items-center gap-4 md:gap-5">
              <div className="h-px w-8 md:w-8 bg-gradient-to-r from-transparent via-zinc-800 to-zinc-700" />
              <span className="text-[10px] md:text-[9px] font-black tracking-[0.4em] text-zinc-500 uppercase">
                {event.league}
              </span>
              <div className="h-px w-8 md:w-8 bg-gradient-to-l from-transparent via-zinc-800 to-zinc-700" />
            </div>
          </div>

          <div className="w-full max-w-5xl px-4">
            {isIndividualSport ? (
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none drop-shadow-2xl uppercase">
                  {event.teams}
                </h2>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-8 md:hidden">
                  <div className="flex items-center justify-center gap-4">
                    <TeamLogo url={event.teamALogoUrl} name={matchup.teamA} className="w-20 h-20" />
                    <span className="text-zinc-800 text-[10px] font-black italic uppercase tracking-[0.2em]">VS</span>
                    <TeamLogo url={event.teamBLogoUrl} name={matchup.teamB} className="w-20 h-20" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black tracking-tighter leading-none drop-shadow-2xl uppercase">
                      {matchup.teamA}
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-zinc-800" />
                      <span className="text-sky-500/40 text-[9px] font-black uppercase tracking-widest">Versus</span>
                      <div className="h-px w-8 bg-zinc-800" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter leading-none drop-shadow-2xl uppercase">
                      {matchup.teamB}
                    </h2>
                  </div>
                </div>

                <div className="hidden md:flex flex-row items-center justify-center gap-8 w-full">
                  <div className="flex flex-row flex-1 items-center justify-end gap-6">
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-right leading-none line-clamp-2 drop-shadow-2xl">
                      {matchup.teamA}
                    </h2>
                    <TeamLogo url={event.teamALogoUrl} name={matchup.teamA} className="w-20 h-20 lg:w-22 lg:h-22" />
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center px-2">
                    <div className="h-6 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mb-2" />
                    <span className="text-zinc-700 text-[10px] font-black italic uppercase tracking-[0.3em]">VS</span>
                    <div className="h-6 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent mt-2" />
                  </div>

                  <div className="flex flex-row-reverse flex-1 items-center justify-end gap-6">
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-left leading-none line-clamp-2 drop-shadow-2xl">
                      {matchup.teamB}
                    </h2>
                    <TeamLogo url={event.teamBLogoUrl} name={matchup.teamB} className="w-20 h-20 lg:w-22 lg:h-22" />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <p className="text-zinc-400 text-sm md:text-base font-bold tracking-tight">
              {kickoffDate} • {kickoffTime}
            </p>
            <p className="text-sky-500/60 text-[9px] md:text-[9px] font-black uppercase tracking-[0.25em]">
              {event.stadium || (event.category === EventCategory.FOOTBALL ? 'International Stadium' : 'Main Event Arena')}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/5 aspect-video w-full relative group">
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

        {/* 1.1 Replica of the Requested Available Sources Section */}
        <div className="bg-zinc-900/20 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] border border-white/5 overflow-hidden p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 mb-8">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
                Available Sources
              </h3>
            </div>
            {activeServers.length > 1 && (
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 self-start">
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.1em]">Multiple Sources Available</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {activeServers.map((server, idx) => (
              <button
                key={server.id}
                onClick={() => setActiveServer(server)}
                className={`group/server flex items-center justify-between w-full px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all border ${
                  activeServer?.id === server.id
                    ? 'bg-sky-500 text-black border-sky-400 shadow-[0_10px_20px_rgba(14,165,233,0.2)]'
                    : 'bg-zinc-950/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-4 truncate">
                  <span className={`text-[9px] font-bold ${activeServer?.id === server.id ? 'opacity-60' : 'opacity-20 group-hover/server:opacity-40'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{server.name}</span>
                </div>
                {activeServer?.id === server.id && (
                  <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Watch;
