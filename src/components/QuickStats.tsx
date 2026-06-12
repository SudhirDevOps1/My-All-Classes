import React from 'react';
import { motion } from 'framer-motion';
import { DayData } from '../types';
import { calculateDayStats } from '../utils/statsUtils';

import { Flame, Target, Clock, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  data: DayData;
}

const QuickStats: React.FC<QuickStatsProps> = ({ data }) => {
  const stats = calculateDayStats(data);
  
  const totalActualHours = Math.floor(stats.totalActualSeconds / 3600);
  const totalActualMinutes = Math.floor((stats.totalActualSeconds % 3600) / 60);
  
  const completionPercentage = stats.totalSessions > 0 
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
    : 0;

  const efficiency = stats.totalPlannedMinutes > 0
    ? Math.round((stats.totalActualSeconds / (stats.totalPlannedMinutes * 60)) * 100)
    : 0;

  const cards = [
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Total Study",
      value: totalActualHours > 0 
        ? `${totalActualHours}h ${totalActualMinutes}m` 
        : `${totalActualMinutes}m`,
      color: "purple"
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Completion",
      value: `${completionPercentage}%`,
      color: "green"
    },
    {
      icon: <Flame className="w-4 h-4" />,
      label: "Sessions",
      value: `${stats.completedSessions}/${stats.totalSessions}`,
      color: "orange"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Efficiency",
      value: `${efficiency}%`,
      color: "blue"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          className={`
            bg-gradient-to-br backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 border
            ${card.color === 'purple' ? 'from-purple-500/20 to-purple-600/20 border-purple-500/30' : ''}
            ${card.color === 'green' ? 'from-green-500/20 to-green-600/20 border-green-500/30' : ''}
            ${card.color === 'orange' ? 'from-orange-500/20 to-orange-600/20 border-orange-500/30' : ''}
            ${card.color === 'blue' ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30' : ''}
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            {card.icon}
            <span className="text-xs">{card.label}</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">{card.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;