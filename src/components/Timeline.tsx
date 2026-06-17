import React from 'react';
import { motion } from 'framer-motion';
import { DayData } from '../types';
import { formatTime, calculateProgress, formatDuration } from '../utils/dateUtils';
import { getSubjectById, normalizeStatus } from '../utils/statsUtils';

interface TimelineProps {
  data: DayData;
}

const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const sortedSessions = [...data.sessions].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'skipped': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusGlow = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'completed': return 'shadow-green-500/50';
      case 'in-progress': return 'shadow-yellow-500/50';
      case 'skipped': return 'shadow-gray-500/50';
      default: return 'shadow-blue-500/50';
    }
  };

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white">Session Timeline</h3>
          <span className="text-xs text-gray-500 hidden sm:inline">Scroll to explore</span>
        </div>
        
        <div className="relative">
          <motion.div 
            className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ originY: 0 }}
          />
          
          <div className="space-y-4 sm:space-y-6">
            {sortedSessions.map((session, index) => {
              const subject = getSubjectById(data.subjects, session.subjectId);
              const progress = calculateProgress(session.actualSeconds, session.plannedMinutes);
              const status = normalizeStatus(session.status);
              
              return (
                <motion.div 
                  key={session.id} 
                  className="relative flex gap-3 sm:gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="relative z-10 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getStatusColor(session.status)} flex items-center justify-center text-base sm:text-lg shadow-lg ${getStatusGlow(session.status)}`}
                      animate={status === 'in-progress' ? {
                        boxShadow: ['0 0 0 0 rgba(234, 179, 8, 0.4)', '0 0 0 10px rgba(234, 179, 8, 0)', '0 0 0 0 rgba(234, 179, 8, 0)']
                      } : {}}
                      transition={status === 'in-progress' ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      } : {}}
                    >
                      {getStatusIcon(session.status)}
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl border backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${session.colorTag}10, transparent)`,
                      borderColor: `${session.colorTag}30`
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="min-w-0">
                        <h4 className="text-white font-semibold text-sm sm:text-base truncate">{subject?.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">{session.notes}</p>
                      </div>
                      <span 
                        className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wide flex-shrink-0"
                        style={{ 
                          backgroundColor: `${session.colorTag}20`,
                          color: session.colorTag
                        }}
                      >
                        {session.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 mt-3 text-[10px] sm:text-sm flex-wrap">
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>Planned: {session.plannedMinutes}min</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>Actual: {formatDuration(session.actualSeconds)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-400">{progress}%</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: session.colorTag }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-3 sm:p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center text-xs sm:text-sm">
          {[
            { color: 'bg-blue-500', label: 'Planned' },
            { color: 'bg-yellow-500', label: 'In Progress' },
            { color: 'bg-green-500', label: 'Completed' },
            { color: 'bg-gray-500', label: 'Skipped' }
          ].map((item, idx) => (
            <motion.div 
              key={item.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${item.color}`} />
              <span className="text-gray-400">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Timeline;