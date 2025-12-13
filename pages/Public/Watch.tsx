
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext';
import { ChevronLeft, Info, Calendar, Trophy, Share2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

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

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-[#04C4FC] transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {/* Large Web Player Container */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 aspect-video w-full relative group">
            {activeServer ? (
              <iframe
                src={activeServer.embedUrl}
                className="w-full h-full border-none"
                style={{ marginLeft: '100px', alignContent: 'center' }}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen={true}
                sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation-by-user-activation allow-presentation"
                title="Stream Player"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/40 italic">
                No active servers available
              </div>
            )}
          </div>

          {/* Server Selection - Prominent below player */}
          <div className="bg-[#1F2833] p-4 rounded-xl border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#04C4FC] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#04C4FC] rounded-full animate-pulse" />
                Switch Servers
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.servers.filter(s => s.isActive).sort((a,b) => a.sortOrder - b.sortOrder).map(server => (
                  <button
                    key={server.id}
                    onClick={() => setActiveServer(server)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                      activeServer?.id === server.id
                        ? 'bg-[#04C4FC] text-[#0B0C10] border-[#04C4FC] shadow-[0_0_15px_rgba(4,196,252,0.3)]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {server.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Event Info & Share - Side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EventDetails event={event} />
            </div>
            <div className="space-y-6">
              <div className="bg-[#1F2833] p-6 rounded-2xl border border-white/5 h-full">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-[#04C4FC]" /> Share Stream
                </h4>
                <p className="text-xs text-white/40 mb-4 leading-relaxed">
                  Enjoying the match? Share the link with your friends and watch together!
                </p>
                <div className="relative">
                  <input
                    readOnly
                    value={window.location.href}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#04C4FC] font-mono focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[8px] uppercase font-bold text-white/20">Click to copy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const EventDetails: React.FC<{ event: any }> = ({ event }) => (
  <div className="bg-[#1F2833] p-8 rounded-2xl border border-white/5 space-y-6">
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-[#04C4FC]/10 text-[#04C4FC] text-[10px] font-black uppercase rounded tracking-wider border border-[#04C4FC]/20">
            {event.league}
          </span>
          {event.status === 'Live' && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live Now
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-white">
          {event.teams}
        </h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
          {event.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 min-w-[280px]">
        <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5">
          <p className="text-[10px] uppercase font-black text-white/20 mb-2 tracking-widest">Start Time</p>
          <div className="flex items-center gap-2 text-sm font-bold text-white/80">
            <Calendar className="w-4 h-4 text-[#04C4FC]" />
            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5">
          <p className="text-[10px] uppercase font-black text-white/20 mb-2 tracking-widest">Category</p>
          <div className="flex items-center gap-2 text-sm font-bold text-white/80">
            <Trophy className="w-4 h-4 text-[#04C4FC]" />
            {event.category}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Watch;
