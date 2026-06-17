import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayData } from '../types';
import { calculateDayStats, getUpcomingSession, getCurrentSession, getSubjectById, normalizeStatus } from '../utils/statsUtils';
import { formatTime, formatDuration, formatDurationMinutes, calculateProgress } from '../utils/dateUtils';
import { Clock, Target, Zap, ChevronRight, TrendingUp, Award } from 'lucide-react';
import SessionDetailModal from './SessionDetailModal';
import QuickStats from './QuickStats';

interface DashboardProps {
  data: DayData;
  streak?: number;
  playlist?: { id: string; name: string; url: string }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

const Dashboard: React.FC<DashboardProps> = ({ data, streak }) => {
  const stats = calculateDayStats(data);
  const upcomingSession = getUpcomingSession(data.sessions);
  const currentSession = getCurrentSession(data.sessions);
  
  const [selectedSession, setSelectedSession] = useState<{
    session: any;
    subject: any;
  } | null>(null);

  const overallProgress = stats.totalPlannedMinutes > 0 
    ? Math.round((stats.totalActualSeconds / (stats.totalPlannedMinutes * 60)) * 100) 
    : 0;

  const efficiency = stats.totalPlannedMinutes > 0 
    ? Math.round((stats.totalActualSeconds / (stats.totalPlannedMinutes * 60)) * 100)
    : 0;

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Quick Stats Row */}
      <motion.div variants={itemVariants}>
        <QuickStats data={data} streak={streak} />
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <StatCard
          icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />}
          label="Planned"
          value={formatDurationMinutes(stats.totalPlannedMinutes)}
          color="purple"
          trend={stats.totalPlannedMinutes > 0}
        />
        <StatCard
          icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />}
          label="Actual"
          value={formatDuration(stats.totalActualSeconds)}
          color="yellow"
          trend={stats.totalActualSeconds > 0}
        />
        <StatCard
          icon={<Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />}
          label="Done"
          value={`${stats.completedSessions}/${stats.totalSessions}`}
          color="green"
          trend={stats.completedSessions > 0}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
          label="Progress"
          value={`${overallProgress}%`}
          color="blue"
          trend={overallProgress > 50}
        />
      </motion.div>

      {/* Efficiency Badge */}
      {efficiency > 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            ${efficiency >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              efficiency >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'}
          `}>
            <Award className="w-4 h-4" />
            <span>
              {efficiency >= 80 ? 'Excellent Efficiency!' :
               efficiency >= 50 ? 'Good Progress' :
               'Keep Going!'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Current / Upcoming Session */}
      <AnimatePresence mode="wait">
        {(currentSession || upcomingSession) && (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
          >
            {currentSession && (
              <SessionHighlight
                title="Currently Active"
                session={currentSession}
                subject={getSubjectById(data.subjects, currentSession.subjectId)}
                isActive
                onClick={() => setSelectedSession({
                  session: currentSession,
                  subject: getSubjectById(data.subjects, currentSession.subjectId)
                })}
              />
            )}
            {upcomingSession && (
              <SessionHighlight
                title="Up Next"
                session={upcomingSession}
                subject={getSubjectById(data.subjects, upcomingSession.subjectId)}
                onClick={() => setSelectedSession({
                  session: upcomingSession,
                  subject: getSubjectById(data.subjects, upcomingSession.subjectId)
                })}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Progress */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          Subject Progress
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {stats.subjectBreakdown.map((subject, index) => {
            const subjectSessions = data.sessions.filter(s => s.subjectId === subject.subjectId);
            const completedCount = subjectSessions.filter(s => normalizeStatus(s.status) === 'completed').length;
            const progress = subjectSessions.length > 0 ? (completedCount / subjectSessions.length) * 100 : 0;
            
            return (
              <motion.div 
                key={subject.subjectId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-1.5 sm:space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <motion.div 
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                      whileHover={{ scale: 1.2 }}
                    />
                    <span className="text-white font-medium text-sm sm:text-base truncate">{subject.subjectName}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {completedCount}/{subjectSessions.length}
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: subject.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
                  <span>{formatDurationMinutes(subject.plannedMinutes)} planned</span>
                  <span>{formatDuration(subject.actualSeconds)} actual</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Sessions List - READ ONLY with click for details */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            Today's Schedule
          </h3>
          <span className="text-xs text-gray-500 hidden sm:inline">Click for details</span>
        </div>
        
        {data.sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No sessions scheduled for this day.
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {data.sessions.map((session, index) => {
              const subject = getSubjectById(data.subjects, session.subjectId);
              const progress = calculateProgress(session.actualSeconds, session.plannedMinutes);
              const status = normalizeStatus(session.status);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedSession({ session, subject })}
                  className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/[0.04] cursor-pointer transition-all hover:bg-white/10 hover:border-white/[0.08] hover:shadow-lg group"
                >
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${session.colorTag}20` }}
                  >
                    {status === 'completed' ? '✅' : status === 'in-progress' ? '🔄' : '⏳'}
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <h4 className="text-white font-medium truncate text-sm sm:text-base">{subject?.name || 'Unknown'}</h4>
                      <span 
                        className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 uppercase tracking-wide"
                        style={{ 
                          backgroundColor: `${session.colorTag}20`,
                          color: session.colorTag
                        }}
                      >
                        {session.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{session.notes}</p>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                      <span className="truncate">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                      <span className="flex-shrink-0">Planned: {session.plannedMinutes}min</span>
                      <span className="flex-shrink-0">Actual: {formatDuration(session.actualSeconds)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-medium text-white">{progress}%</div>
                    </div>
                    <div className="w-16 sm:w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: session.colorTag }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>



      {/* JSON Metadata (Data Export Details) */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-lg">📄</span>
          Data Export Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-gray-500 mb-1">Source App</div>
            <div className="text-sm font-medium text-white">{data.app || 'Unknown'}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-gray-500 mb-1">Exported At</div>
            <div className="text-sm font-medium text-white">
              {data.exportedAt ? new Date(data.exportedAt).toLocaleString() : 'Unknown'}
            </div>
          </div>
        </div>
        
        {data.settings && data.settings.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Raw Settings Configuration</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {data.settings.map((setting, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1 overflow-hidden">
                  <span className="text-[10px] text-gray-400 font-mono truncate">{setting.key}</span>
                  <span className="text-xs text-white truncate" title={setting.value}>{setting.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession?.session || null}
        subject={selectedSession?.subject}
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </motion.div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  trend?: boolean;
}> = ({ icon, label, value, color, trend }) => {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
  };

  return (
    <motion.div 
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-lg sm:rounded-xl lg:rounded-2xl border p-2.5 sm:p-3 lg:p-4 relative overflow-hidden`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {trend && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        {icon}
        <span className="text-[10px] sm:text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-base sm:text-xl lg:text-2xl font-bold text-white truncate">{value}</div>
    </motion.div>
  );
};

const SessionHighlight: React.FC<{
  title: string;
  session: any;
  subject: any;
  isActive?: boolean;
  onClick: () => void;
}> = ({ title, session, subject, isActive, onClick }) => (
  <motion.div 
    className={`bg-gradient-to-br ${isActive ? 'from-green-500/20 to-emerald-600/20 border-green-500/30' : 'from-blue-500/20 to-indigo-600/20 border-blue-500/30'} backdrop-blur-xl rounded-xl sm:rounded-2xl border p-4 sm:p-6 cursor-pointer group`}
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
      <motion.div 
        className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-blue-400'}`}
        animate={isActive ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-xs sm:text-sm font-medium text-gray-300">{title}</span>
      <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
    </div>
    
    <div className="flex items-start gap-3 sm:gap-4">
      <motion.div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-2xl flex-shrink-0"
        style={{ backgroundColor: `${session.colorTag}30` }}
        whileHover={{ rotate: 5 }}
      >
        {subject?.name?.charAt(0) || '📚'}
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">{subject?.name}</h4>
        <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 line-clamp-2">{session.notes}</p>
        
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-sm flex-wrap">
          <span className="text-gray-300">
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </span>
          <span className="text-gray-400">
            Planned: {session.plannedMinutes}min
          </span>
          <span className="text-gray-400">
            Actual: {formatDuration(session.actualSeconds)}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;