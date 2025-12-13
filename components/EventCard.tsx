
import React from 'react';
import { Calendar, Clock, Trophy, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SportEvent, EventStatus } from '../types';

interface EventCardProps {
  event: SportEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isLive = event.status === EventStatus.LIVE;
  const isUpcoming = event.status === EventStatus.UPCOMING;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="group relative bg-[#1F2833] rounded-xl overflow-hidden border border-white/5 hover:border-[#04C4FC]/30 transition-all hover:-translate-y-1">
      <div className="aspect-[16/10] bg-[#0B0C10] relative">
        <img
          src={`https://picsum.photos/seed/${event.id}/400/250`}
          alt={event.teams}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2833] via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-[10px] font-bold uppercase rounded shadow-lg animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Live
            </span>
          )}
          {isUpcoming && (
            <span className="px-2.5 py-1 bg-[#04C4FC] text-[#0B0C10] text-[10px] font-bold uppercase rounded shadow-lg">
              Upcoming
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="text-[10px] text-white/60 bg-black/40 px-2 py-1 rounded backdrop-blur-md border border-white/5">
            {event.league}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-1">
          {event.teams}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#04C4FC]" />
            {formatDate(event.startTime)}
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#04C4FC]" />
            {event.category}
          </div>
        </div>

        <Link
          to={`/watch/${event.id}`}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold transition-all ${
            isLive 
              ? 'bg-[#04C4FC] text-[#0B0C10] hover:bg-[#03a9d9]' 
              : 'bg-white/5 text-white/80 hover:bg-white/10'
          }`}
        >
          {isLive ? <Play className="w-4 h-4 fill-current" /> : null}
          {isLive ? 'Watch Live' : 'View Schedule'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
