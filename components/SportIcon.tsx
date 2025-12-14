
import React from 'react';
import { Trophy, Target, Waves } from 'lucide-react';
import { EventCategory } from '../types.ts';
import FootballIcon from './FootballIcon.tsx';
import NBAIcon from './NBAIcon.tsx';
import NFLIcon from './NFLIcon.tsx';
import MotorsportsIcon from './MotorsportsIcon.tsx';
import UFCIcon from './UFCIcon.tsx';

interface SportIconProps {
  category: EventCategory;
  className?: string;
}

const SportIcon: React.FC<SportIconProps> = ({ category, className = "w-4 h-4" }) => {
  switch (category) {
    case EventCategory.FOOTBALL:
      return <FootballIcon className={className} />;
    case EventCategory.NBA:
      return <NBAIcon className={className} />;
    case EventCategory.NFL:
      return <NFLIcon className={className} />;
    case EventCategory.DARTS:
      return <Target className={className} />;
    case EventCategory.MOTORSPORTS:
      return <MotorsportsIcon className={className} />;
    case EventCategory.BOXING:
    case EventCategory.UFC:
      return <UFCIcon className={className} />;
    case EventCategory.HOCKEY:
      return <Waves className={className} />;
    default:
      return <Trophy className={className} />;
  }
};

export default SportIcon;
