import React from 'react';
import { motion } from 'framer-motion';
import { DayData } from '../types';
import { calculateDayStats, normalizeStatus } from '../utils/statsUtils';
import { formatDuration, formatDurationMinutes } from '../utils/dateUtils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

interface AnalyticsProps {
  data: DayData;
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const stats = calculateDayStats(data);

  const pieData = stats.subjectBreakdown.map(subject => ({
    name: subject.subjectName,
    value: subject.plannedMinutes,
    color: subject.color
  }));

  const barData = stats.subjectBreakdown.map(subject => ({
    name: subject.subjectName.split('/')[0].trim(),
    planned: subject.plannedMinutes,
    actual: Math.round(subject.actualSeconds / 60),
    color: subject.color
  }));

  const completionRate = stats.totalSessions > 0 
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
    : 0;

  const overallEfficiency = stats.totalPlannedMinutes > 0 
    ? Math.round((stats.totalActualSeconds / (stats.totalPlannedMinutes * 60)) * 100) 
    : 0;

  const getPerformanceBadge = () => {
    if (overallEfficiency >= 90) return { text: 'Outstanding!', color: 'from-green-500 to-emerald-600', icon: '🏆' };
    if (overallEfficiency >= 75) return { text: 'Excellent!', color: 'from-blue-500 to-cyan-600', icon: '🌟' };
    if (overallEfficiency >= 60) return { text: 'Good Job!', color: 'from-purple-500 to-pink-600', icon: '👍' };
    if (overallEfficiency >= 40) return { text: 'Keep Going!', color: 'from-yellow-500 to-orange-600', icon: '💪' };
    return { text: 'Start Fresh!', color: 'from-red-500 to-pink-600', icon: '🚀' };
  };

  const badge = getPerformanceBadge();

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Performance Badge */}
      <motion.div 
        className={`bg-gradient-to-r ${badge.color} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center`}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="text-4xl sm:text-5xl mb-2"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {badge.icon}
        </motion.div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">{badge.text}</h3>
        <p className="text-white/80 text-sm mt-1">
          {overallEfficiency}% efficiency • {stats.completedSessions}/{stats.totalSessions} sessions completed
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { icon: <Calendar className="w-5 h-5" />, value: stats.totalSessions, label: 'Total Sessions', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' },
          { icon: <Target className="w-5 h-5" />, value: `${completionRate}%`, label: 'Completion Rate', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
          { icon: <TrendingUp className="w-5 h-5" />, value: `${overallEfficiency}%`, label: 'Efficiency', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' }
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} backdrop-blur-xl rounded-xl sm:rounded-2xl border p-4 sm:p-6 text-center`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2 text-white/80">
              {card.icon}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{card.value}</div>
            <div className="text-xs sm:text-sm text-gray-300 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div 
          className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Time Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                  formatter={(value) => [`${value} min`, 'Planned']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Planned vs Actual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend />
                <Bar dataKey="planned" fill="#8B5CF6" radius={[4, 4, 0, 0]} animationDuration={800} />
                <Bar dataKey="actual" fill="#10B981" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Subject Details */}
      <motion.div 
        className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Subject Details
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {stats.subjectBreakdown.map((subject, index) => {
            const subjectSessions = data.sessions.filter(s => s.subjectId === subject.subjectId);
            const completedCount = subjectSessions.filter(s => normalizeStatus(s.status) === 'completed').length;
            const efficiency = subject.plannedMinutes > 0 
              ? Math.round((subject.actualSeconds / (subject.plannedMinutes * 60)) * 100) 
              : 0;

            return (
              <motion.div 
                key={subject.subjectId} 
                className="p-4 rounded-xl bg-white/5 border border-white/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                      whileHover={{ scale: 1.3 }}
                    />
                    <h4 className="text-white font-medium">{subject.subjectName}</h4>
                  </div>
                  <span className="text-sm text-gray-400">
                    {completedCount}/{subjectSessions.length} sessions
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <motion.div 
                    className="p-2 rounded-lg bg-white/5"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-lg font-semibold text-white">
                      {formatDurationMinutes(subject.plannedMinutes)}
                    </div>
                    <div className="text-xs text-gray-500">Planned</div>
                  </motion.div>
                  <motion.div 
                    className="p-2 rounded-lg bg-white/5"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-lg font-semibold text-white">
                      {formatDuration(subject.actualSeconds)}
                    </div>
                    <div className="text-xs text-gray-500">Actual</div>
                  </motion.div>
                  <motion.div 
                    className={`p-2 rounded-lg ${
                      efficiency >= 80 ? 'bg-green-500/10' :
                      efficiency >= 50 ? 'bg-yellow-500/10' :
                      'bg-red-500/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`text-lg font-semibold ${
                      efficiency >= 80 ? 'text-green-400' :
                      efficiency >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {efficiency}%
                    </div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;