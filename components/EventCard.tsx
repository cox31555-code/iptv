import React, { useState } from 'react';
import { Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SportEvent, EventStatus, getEventUrl } from '../types.ts';
import { getFullImageUrl, getEventCoverUrl } from '../api.ts';
import Logo from './Logo.tsx';
import SportIcon from './SportIcon.tsx';
import LiveIndicator from './LiveIndicator.tsx';

interface EventCardProps {
  event: SportEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isLive = event.status === EventStatus.LIVE;
  const isUpcoming = event.status === EventStatus.UPCOMING;

  // Helper: Get the display cover URL (never returns null)
  const getDisplayCoverUrl = (): string => {
    const manualUrl = event.coverImageUrl?.trim();
    if (manualUrl) {
      const fullUrl = getFullImageUrl(manualUrl);
      if (fullUrl) return fullUrl;
    }
    return getEventCoverUrl(event.id);
  };

  const formatDisplayTime = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    
    const isSameDay = 
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return eventDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } else {
      const month = eventDate.toLocaleString('en-US', { month: 'short' });
      const day = eventDate.getDate();
      return `${month} ${day}`;
    }
  };

  return (
    <div className="group relative bg-zinc-900/40 rounded-xl md:rounded-2xl overflow-hidden border border-white/[0.05] hover:border-sky-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] flex flex-col">
      <div className="aspect-[16/10] bg-black relative overflow-hidden flex items-center justify-center">
        {/* Priority: manual coverImageUrl > generated cover > imageUrl > hide */}
        <img
          src={getDisplayCoverUrl()}
          alt={event.teams}
          loading="lazy"
          decoding="async"
          width={640}
          height={400}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const generatedCoverUrl = getEventCoverUrl(event.id);
            
            // If manual cover failed, fall back to generated cover
            if (event.coverImageUrl?.trim() && target.src !== generatedCoverUrl) {
              target.src = generatedCoverUrl;
              return;
            }
            
            // If generated cover failed, try legacy imageUrl
            if (event.imageUrl && target.src !== event.imageUrl) {
              target.src = event.imageUrl;
              return;
            }
            
            // All sources failed - hide image
            target.style.display = 'none';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
        
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex gap-1.5 md:gap-2">
          {isLive && <LiveIndicator />}
          {isUpcoming && (
            <div className="px-1.5 md:px-3 py-0.5 md:py-1 bg-sky-500/10 backdrop-blur-md border border-sky-500/20 rounded-full">
              <span className="text-[8px] md:text-[10px] font-black uppercase text-sky-400 tracking-wider">Upcoming</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
          <span className="text-[7px] md:text-[10px] font-bold text-white/50 bg-black/60 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded md:rounded-lg backdrop-blur-md border border-white/10 uppercase tracking-widest">
            {event.league}
          </span>
        </div>
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-1">
        <h3 className="text-xs md:text-lg font-bold text-white leading-tight md:leading-snug mb-2 md:mb-3 group-hover:text-sky-400 transition-colors line-clamp-2">
          {event.teams}
        </h3>
        
        <div className="flex items-center gap-3 md:gap-5 text-[9px] md:text-[11px] text-zinc-500 font-medium mt-auto mb-3 md:mb-5">
          <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-sky-500" />
            {formatDisplayTime(event.startTime)}
          </div>
          <div className="flex items-center gap-1 md:gap-1.5 uppercase tracking-tighter shrink-0 truncate">
            <SportIcon category={event.category} className="h-[9px] md:h-[11px] w-auto shrink-0 text-sky-500" />
            <span className="inline-block">{event.category}</span>
          </div>
        </div>

        <Link
          to={getEventUrl(event)}
          className={`group/btn flex items-center justify-center gap-1.5 md:gap-2 w-full py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all ${
            isLive 
              ? 'bg-sky-500 text-black hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.2)]' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/5'
          }`}
        >
          {isLive ? <Play className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-current group-hover/btn:translate-x-0.5 transition-transform" /> : null}
          {isLive ? 'Watch' : 'Details'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
