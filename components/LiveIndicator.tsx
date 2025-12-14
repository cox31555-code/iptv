
import React from 'react';

interface LiveIndicatorProps {
  className?: string;
  showText?: boolean;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-1.5 md:gap-2 px-1.5 md:px-3 py-0.5 md:py-1 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full ${className}`}>
      <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      {showText && (
        <span className="text-[8px] md:text-[10px] font-black uppercase text-red-500 tracking-wider">Live</span>
      )}
    </div>
  );
};

export default LiveIndicator;
