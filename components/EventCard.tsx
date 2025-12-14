
import React from 'react';
import { Clock, Trophy, Play, Target, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SportEvent, EventStatus, EventCategory } from '../types';
import { useApp } from '../AppContext';
import Logo from './Logo.tsx';
import FootballIcon from './FootballIcon.tsx';
import NBAIcon from './NBAIcon.tsx';
import NFLIcon from './NFLIcon.tsx';
import MotorsportsIcon from './MotorsportsIcon.tsx';
import UFCIcon from './UFCIcon.tsx';

interface EventCardProps {
  event: SportEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isLive = event.status === EventStatus.LIVE;
  const isUpcoming = event.status === EventStatus.UPCOMING;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const renderSportIcon = () => {
    const iconClass = "w-3 h-3 md:w-3.5 md:h-3.5 text-sky-500";
    
    switch (event.category) {
      case EventCategory.FOOTBALL:
        return <FootballIcon className="h-[9px] md:h-[11px] w-auto shrink-0" />;
      case EventCategory.NBA:
        return <NBAIcon className="h-[9px] md:h-[11px] w-auto shrink-0" />;
      case EventCategory.NFL:
        return <NFLIcon className="h-[9px] md:h-[11px] w-auto shrink-0" />;
      case EventCategory.DARTS:
        return <Target className={iconClass} />;
      case EventCategory.MOTORSPORTS:
        return <MotorsportsIcon className="h-[9px] md:h-[11px] w-auto shrink-0" />;
      case EventCategory.BOXING:
      case EventCategory.UFC:
        return <UFCIcon className="h-[9px] md:h-[11px] w-auto shrink-0" />;
      case EventCategory.CRICKET:
        return <Trophy className={iconClass} />;
      case EventCategory.HOCKEY:
        return <Waves className={iconClass} />;
      default:
        return <Trophy className={iconClass} />;
    }
  };

  return (
    <div className="group relative bg-zinc-900/40 rounded-xl md:rounded-2xl overflow-hidden border border-white/[0.05] hover:border-sky-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] flex flex-col">
      <div className="aspect-[16/10] bg-black relative overflow-hidden flex items-center justify-center">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.teams}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0B0C10] flex items-center justify-center p-6 md:p-12 transition-transform duration-700 group-hover:scale-105">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15)_0%,transparent_70%)] opacity-50" />
            <Logo className="w-full h-full opacity-40 group-hover:opacity-60 transition-opacity" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
        
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex gap-1.5 md:gap-2">
          {isLive && (
            <div className="flex items-center gap-1 md:gap-2 px-1.5 md:px-3 py-0.5 md:py-1 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-[8px] md:text-[10px] font-black uppercase text-red-500 tracking-wider">Live</span>
            </div>
          )}
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
            {formatDate(event.startTime)}
          </div>
          <div className="flex items-center gap-1 md:gap-1.5 uppercase tracking-tighter shrink-0 truncate">
            {renderSportIcon()}
            <span className="inline-block">{event.category}</span>
          </div>
        </div>

        <Link
          to={`/watch/${event.id}`}
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
