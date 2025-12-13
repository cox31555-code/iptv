import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext.tsx';
import { ChevronLeft, Calendar, Trophy, Server, Play } from 'lucide-react';
import Navbar from '../../components/Navbar.tsx';
import { EventStatus } from '../../types.ts';

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

  if (!event || event.isDeleted) {
    return <Navigate to="/" />;
  }

  const isLive = event.status === EventStatus.LIVE;

  const kickoffTime = new Date(event.startTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-sky-400 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white/5 px-2 py-1 rounded">ID: {event.id}</span>
          </div>
        </div>

        {/* Player Container - Now Full Width */}
        <div className="bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 aspect-video w-full relative group">
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

        {/* Live Channels / Server Selection - Full Width Grid */}
        <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Live Channels</h3>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
               <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Multiple Sources Available</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {event.servers.filter(s => s.isActive).sort((a,b) => a.sortOrder - b.sortOrder).map((server, idx) => (
              <button
                key={server.id}
                onClick={() => setActiveServer(server)}
                className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
                  activeServer?.id === server.id
                    ? 'bg-sky-500 text-black border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.2)] scale-[1.02]'
                    : 'bg-black/40 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] ${activeServer?.id === server.id ? 'opacity-60' : 'opacity-30'}`}>0{idx + 1}</span>
                  {server.name}
                </div>
                {activeServer?.id === server.id && <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            ))}
          </div>
        </div>

        {/* Event Info Card - Full Width and Restyled */}
        <div className="bg-zinc-900/40 border border-white/5 p-8 md:p-12 rounded-[2.5rem] space-y-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="space-y-6 flex-1">
              <p className="text-sky-500 font-black uppercase tracking-[0.3em] text-xs">
                {event.league}
              </p>
              
              <div className="flex flex-wrap items-center gap-5">
                {isLive && (
                  <div className="px-4 py-1.5 bg-red-500 text-black text-[10px] font-black uppercase rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] shrink-0">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                    Live
                  </div>
                )}
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                  {event.teams}
                </h1>
              </div>

              <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed max-w-4xl">
                {event.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 shrink-0 w-full md:w-auto">
              <div className="p-7 bg-black/40 rounded-3xl border border-white/5 space-y-2 min-w-[160px]">
                <p className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em]">Kickoff</p>
                <div className="flex items-center gap-3 text-lg font-black text-zinc-300">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  {kickoffTime}
                </div>
              </div>
              <div className="p-7 bg-black/40 rounded-3xl border border-white/5 space-y-2 min-w-[160px]">
                <p className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em]">League</p>
                <div className="flex items-center gap-3 text-lg font-black text-zinc-300">
                  <Trophy className="w-5 h-5 text-sky-500" />
                  {event.category}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;