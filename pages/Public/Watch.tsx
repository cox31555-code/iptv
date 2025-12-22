import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { ChevronLeft, Server, Clock, Lock, MapPin, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar.tsx';
import { EventCategory, EventStatus, SportEvent } from '../../types.ts';
import Logo from '../../components/Logo.tsx';
import SportIcon from '../../components/SportIcon.tsx';
import Footer from '../../components/Footer.tsx';
import { getEventById } from '../../api.ts';

const Watch: React.FC = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const { events } = useApp();
  
  // Extract ID from slug (e.g. "e1-premier-league-arsenal-vs-liverpool" -> "e1")
  const id = useMemo(() => {
    if (!eventSlug) return null;
    return eventSlug.split('-')[0];
  }, [eventSlug]);

  const [fetchedEvent, setFetchedEvent] = useState<SportEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // First check local state, then use fetched event
  const event = useMemo(() => {
    const fromState = events.find(e => e.id === id);
    return fromState || fetchedEvent;
  }, [events, id, fetchedEvent]);

  // Fetch event by ID if not in local state (for deep links/refresh)
  useEffect(() => {
    if (!id) return;
    if (events.find(e => e.id === id)) return; // Already in state
    
    setIsLoading(true);
    setNotFound(false);
    
    getEventById(id)
      .then(data => {
        setFetchedEvent(data);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, events]);

  const [activeServer, setActiveServer] = useState(
    event?.servers.find(s => s.isDefault && s.isActive) || event?.servers[0]
  );

  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const matchup = useMemo(() => {
    if (!event) return { teamA: '', teamB: '' };
    const parts = event.teams.split(/\s+vs\s+/i);
    return {
      teamA: parts[0] || 'Team A',
      teamB: parts[1] || 'Team B'
    };
  }, [event]);

  // Update server state if event changes (e.g. after data loads)
  useEffect(() => {
    if (event && !activeServer) {
      setActiveServer(event.servers.find(s => s.isDefault && s.isActive) || event.servers[0]);
    }
  }, [event, activeServer]);

  // Show loading state while fetching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Loading event...</p>
        </div>
      </div>
    );
  }

  // Redirect only after confirming event doesn't exist AND fetch completed
  if (notFound && !isLoading) {
    return <Navigate to="/" />;
  }

  if (!event) {
    return null; // Should not reach here, but TypeScript guard
  }

  // Only Football and NBA use the split Team A vs Team B UI with logos
  const isTeamBased = event.category === EventCategory.FOOTBALL || event.category === EventCategory.NBA;

  const kickoffDate = new Date(event.startTime).toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  });
  
  const kickoffTime = new Date(event.startTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });

  const streamStartTime = new Date(event.startTime).getTime() - (20 * 60 * 1000);
  const isStreamAvailable = currentTime >= streamStartTime;
  const timeRemaining = streamStartTime - currentTime;

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const countdown = formatCountdown(timeRemaining);

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
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 lg:pt-8 pb-12 md:pb-20 space-y-4 md:space-y-6 lg:space-y-2 flex-1 w-full -mt-[10px]">
        <div className="flex flex-col items-center justify-center py-4 md:py-4 lg:py-1 space-y-4 md:space-y-6 lg:space-y-2 text-center">
          <div className="flex flex-col items-center gap-2 lg:gap-1">
            <div className="p-2 md:p-2.5 lg:p-1.5 bg-zinc-900/50 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-3xl flex items-center justify-center min-w-[56px] min-h-[56px] md:min-w-[48px] md:min-h-[48px] lg:min-w-[32px] lg:min-h-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
              {event.leagueLogoUrl ? (
                <img src={event.leagueLogoUrl} alt={event.league} className="h-10 md:h-8 lg:h-5 w-auto object-contain" />
              ) : (
                <SportIcon category={event.category} className="h-10 md:h-7 lg:h-4 w-auto text-sky-500/60" />
              )}
            </div>
            
            <div className="flex items-center gap-4 md:gap-5 lg:gap-3">
              <div className="h-px w-8 md:w-8 lg:w-4 bg-gradient-to-r from-transparent via-zinc-800 to-zinc-700" />
              <span className="text-[10px] md:text-[9px] lg:text-[8px] font-black tracking-[0.4em] lg:tracking-[0.2em] text-zinc-500 uppercase">
                {event.league}
              </span>
              <div className="h-px w-8 md:w-8 lg:w-4 bg-gradient-to-l from-transparent via-zinc-800 to-zinc-700" />
            </div>
          </div>

          <div className="w-full max-w-5xl px-4">
            {!isTeamBased ? (
              <div className="flex flex-col items-center gap-2 lg:gap-1 animate-in fade-in duration-700">
                <h2 className="text-4xl md:text-5xl lg:text-3xl font-black tracking-tighter leading-none drop-shadow-2xl uppercase">
                  {event.teams}
                </h2>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
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

                <div className="hidden md:flex flex-row items-center justify-center gap-8 lg:gap-4 w-full">
                  <div className="flex flex-row flex-1 items-center justify-end gap-6 lg:gap-4">
                    <h2 className="text-2xl lg:text-xl font-black tracking-tighter text-right leading-none line-clamp-2 drop-shadow-2xl uppercase">
                      {matchup.teamA}
                    </h2>
                    <TeamLogo url={event.teamALogoUrl} name={matchup.teamA} className="w-20 h-20 lg:w-16 lg:h-16" />
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center px-2">
                    <div className="h-6 lg:h-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mb-2 lg:mb-1" />
                    <span className="text-zinc-700 text-[10px] lg:text-[8px] font-black italic uppercase tracking-[0.3em]">VS</span>
                    <div className="h-6 lg:h-4 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent mt-2 lg:mt-1" />
                  </div>

                  <div className="flex flex-row-reverse flex-1 items-center justify-end gap-6 lg:gap-4">
                    <h2 className="text-2xl lg:text-xl font-black tracking-tighter text-left leading-none line-clamp-2 drop-shadow-2xl uppercase">
                      {matchup.teamB}
                    </h2>
                    <TeamLogo url={event.teamBLogoUrl} name={matchup.teamB} className="w-20 h-20 lg:w-16 lg:h-16" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2.5 pt-0.5">
            <p className="text-zinc-400 text-sm md:text-base lg:text-xs font-bold tracking-tight">
              {kickoffDate} • {kickoffTime}
            </p>
            
            {/* Header Row: Stadium Badge (Unified with Date) */}
            <div className="flex items-center justify-center gap-2 text-sky-400 bg-sky-500/5 border border-sky-500/10 px-3.5 py-1 rounded-full whitespace-nowrap">
              <MapPin className="w-2 h-2 text-sky-500" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                {event.stadium || (event.category === EventCategory.FOOTBALL ? 'International Stadium' : 'Main Event Arena')}
              </span>
            </div>
          </div>
        </div>

        {/* Synchronized container for Player, and Sources */}
        <div className="flex flex-col items-center space-y-4 md:space-y-6 lg:space-y-2 w-full pt-2">
          <div className="bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/5 aspect-video w-full max-w-5xl relative group">
            {!isStreamAvailable ? (
              <div className="absolute inset-0 z-10 bg-[#0B0C10] flex flex-col items-center justify-center p-6 text-center space-y-6 md:space-y-12 lg:space-y-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }} 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-sky-500/5 blur-[120px] rounded-full" />
                
                <div className="relative space-y-3 md:space-y-4 lg:space-y-2">
                  <h3 className="text-lg md:text-4xl lg:text-2xl font-black tracking-tighter uppercase leading-tight">
                    Stream becomes available <br/> 
                    <span className="text-sky-500">20 minutes before kickoff</span>
                  </h3>
                </div>

                {countdown && (
                  <div className="flex gap-2.5 md:gap-8 lg:gap-4 items-start">
                    {[
                      { label: 'Days', value: countdown.days },
                      { label: 'Hours', value: countdown.hours },
                      { label: 'Min', value: countdown.minutes },
                      { label: 'Sec', value: countdown.seconds }
                    ].map((unit, i) => (
                      <div key={unit.label} className="flex flex-col items-center gap-1.5 md:gap-2 lg:gap-1">
                        <div className="relative bg-zinc-900/50 border border-white/5 w-11 h-13 md:w-24 md:h-28 lg:w-16 lg:h-20 rounded-lg md:rounded-2xl lg:rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-xl">
                          <span className="text-lg md:text-6xl lg:text-3xl font-black tracking-tighter text-white tabular-nums">
                            {unit.value}
                          </span>
                          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
                        </div>
                        <span className="text-[7px] md:text-[10px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeServer ? (
              <iframe
                src={activeServer.embedUrl}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen={true}
                title="Stream Player"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-presentation"
                referrerPolicy="no-referrer"
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

          <div className="bg-zinc-900/20 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[1.5rem] border border-white/5 overflow-hidden p-4 md:p-8 lg:p-4 w-full max-w-5xl mt-2 lg:mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 lg:gap-2 px-1 mb-4 md:mb-8 lg:mb-4">
              <div className="space-y-1">
                <h3 className="text-[9px] md:text-[10px] lg:text-[8px] font-black uppercase tracking-[0.3em] text-sky-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
                  Available Sources
                </h3>
              </div>
              {activeServers.length > 1 && (
                <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 md:px-3 md:py-1.5 lg:py-1 rounded-full border border-white/5 self-start">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#10b981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <p className="text-zinc-500 text-[8px] md:text-[9px] lg:text-[7px] font-black uppercase tracking-[0.1em]">Multiple Sources Available</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 lg:gap-2">
              {activeServers.map((server, idx) => (
                <button
                  key={server.id}
                  onClick={() => setActiveServer(server)}
                  className={`group/server flex items-center justify-between w-full px-4 py-3 md:px-5 md:py-4 lg:px-3 lg:py-2.5 rounded-xl md:rounded-2xl lg:rounded-lg text-[10px] md:text-[11px] lg:text-[9px] font-black uppercase tracking-[0.1em] transition-all border ${
                    activeServer?.id === server.id
                      ? 'bg-sky-500 text-black border-sky-400 shadow-[0_10px_20px_rgba(14,165,233,0.2)]'
                      : 'bg-zinc-950/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 lg:gap-2 truncate">
                    <span className={`text-[8px] md:text-[9px] lg:text-[7px] font-bold ${activeServer?.id === server.id ? 'opacity-60' : 'opacity-20 group-hover/server:opacity-40'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{server.name}</span>
                  </div>
                  {activeServer?.id === server.id && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 lg:w-1 lg:h-1 bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Watch;
