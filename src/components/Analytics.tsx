import React from 'react';
import { motion } from 'framer-motion';
import { DayData } from '../types';
import { calculateDayStats, normalizeStatus } from '../utils/statsUtils';
import { formatDuration, formatDurationMinutes } from '../utils/dateUtils';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

interface AnalyticsProps {
  data: DayData;
}

/* ── helpers ─────────────────────────────────────────────────── */

const getBadgeStyle = (efficiency: number) => {
  if (efficiency >= 90) return { text: 'Outstanding!', icon: '🏆', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' };
  if (efficiency >= 75) return { text: 'Excellent!', icon: '🌟', gradient: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)' };
  if (efficiency >= 60) return { text: 'Good Job!', icon: '👍', gradient: 'linear-gradient(135deg, #a855f7 0%, #db2777 100%)' };
  if (efficiency >= 40) return { text: 'Keep Going!', icon: '💪', gradient: 'linear-gradient(135deg, #eab308 0%, #ea580c 100%)' };
  return { text: 'Start Fresh!', icon: '🚀', gradient: 'linear-gradient(135deg, #ef4444 0%, #db2777 100%)' };
};

/** Build SVG arc path for a donut segment */
const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const rad = (deg: number) => (Math.PI / 180) * deg;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
};

/* ── Donut Chart (pure SVG) ─────────────────────────────────── */

const DonutChart: React.FC<{
  data: { name: string; value: number; color: string }[];
  size?: number;
}> = ({ data, size = 200 }) => {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-gray-500 text-sm text-center py-8">No data</div>;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.65;
  const gap = data.length > 1 ? 2 : 0; // degrees gap between segments

  let currentAngle = -90; // start from top
  const segments = data.map((d) => {
    const sweep = (d.value / total) * 360 - gap;
    const start = currentAngle + gap / 2;
    const end = start + Math.max(sweep, 0.5);
    currentAngle += (d.value / total) * 360;
    return { ...d, start, end };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => {
            const isHovered = hoveredIdx === i;
            const rOffset = isHovered ? 4 : 0;
            const midAngle = (seg.start + seg.end) / 2;
            const rad = (deg: number) => (Math.PI / 180) * deg;
            const dx = isHovered ? 3 * Math.cos(rad(midAngle)) : 0;
            const dy = isHovered ? 3 * Math.sin(rad(midAngle)) : 0;
            
            return (
              <motion.path
                key={i}
                d={describeArc(cx + dx, cy + dy, (outerR + innerR) / 2 + rOffset, seg.start, seg.end)}
                fill="none"
                stroke={seg.color}
                strokeWidth={(outerR - innerR) + (isHovered ? 2 : 0)}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300 drop-shadow-lg"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ opacity: hoveredIdx === null || isHovered ? 1 : 0.6 }}
              />
            );
          })}
          {/* center label */}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-lg font-bold" fontSize="18">
            {hoveredIdx !== null ? data[hoveredIdx].value : total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400 font-medium" fontSize="10">
            {hoveredIdx !== null ? data[hoveredIdx].name.slice(0, 10) + '…' : 'total min'}
          </text>
        </svg>
      </div>

      {/* legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-4">
        {data.map((d, i) => (
          <div 
            key={i} 
            className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border border-transparent transition-all cursor-pointer ${hoveredIdx === i ? 'bg-white/10 border-white/5 text-white' : 'text-gray-300'}`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="truncate max-w-[110px]">{d.name}</span>
            <span className="text-gray-400 font-medium">{d.value}m</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Bar Chart (pure CSS) ───────────────────────────────────── */

const SimpleBarChart: React.FC<{
  data: { name: string; planned: number; actual: number; color: string }[];
}> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.planned, d.actual]), 1);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-end justify-center gap-4 sm:gap-6 w-full h-44 px-2 relative">
        {data.map((d, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div 
              key={i} 
              className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px] cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* bars */}
              <div className="flex items-end gap-1.5 h-36 w-full justify-center relative">
                {/* Planned Bar */}
                <div className="flex flex-col justify-end h-full">
                  <motion.div
                    className="w-4 sm:w-5 rounded-t-md relative group"
                    style={{ 
                      background: 'linear-gradient(to top, #7c3aed, #a78bfa)',
                      boxShadow: isHovered ? '0 0 12px rgba(167, 139, 250, 0.4)' : 'none'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.planned / maxVal) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                  />
                </div>
                {/* Actual Bar */}
                <div className="flex flex-col justify-end h-full">
                  <motion.div
                    className="w-4 sm:w-5 rounded-t-md relative group"
                    style={{ 
                      background: 'linear-gradient(to top, #059669, #34d399)',
                      boxShadow: isHovered ? '0 0 12px rgba(52, 211, 153, 0.4)' : 'none'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.actual / maxVal) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }}
                  />
                </div>

                {/* Hover Tooltip inside graph */}
                {isHovered && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-white/10 text-[9px] sm:text-xs text-white rounded px-2 py-0.5 z-20 whitespace-nowrap shadow-xl">
                    P: {d.planned}m | A: {d.actual}m
                  </div>
                )}
              </div>
              {/* label */}
              <span className={`text-[10px] text-center truncate w-full ${isHovered ? 'text-white font-medium' : 'text-gray-400'}`}>
                {d.name.length > 8 ? d.name.slice(0, 8) + '…' : d.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <span className="w-3 h-2.5 rounded-sm" style={{ background: 'linear-gradient(to top, #7c3aed, #a78bfa)' }} />
          Planned
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <span className="w-3 h-2.5 rounded-sm" style={{ background: 'linear-gradient(to top, #059669, #34d399)' }} />
          Actual
        </div>
      </div>
    </div>
  );
};

/* ── Main Analytics Component ───────────────────────────────── */

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  if (!data || !data.sessions || !data.subjects) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No analytics data available</p>
      </div>
    );
  }

  const stats = calculateDayStats(data);

  const pieData = (stats.subjectBreakdown || [])
    .filter((s) => s.plannedMinutes > 0)
    .map((s) => ({ name: s.subjectName, value: s.plannedMinutes, color: s.color || '#8B5CF6' }));

  const barData = (stats.subjectBreakdown || []).map((s) => ({
    name: s.subjectName ? s.subjectName.split('/')[0].trim() : 'Unknown',
    planned: s.plannedMinutes || 0,
    actual: Math.round((s.actualSeconds || 0) / 60),
    color: s.color || '#8B5CF6',
  }));

  const completionRate = stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0;
  const overallEfficiency = stats.totalPlannedMinutes > 0 ? Math.round((stats.totalActualSeconds / (stats.totalPlannedMinutes * 60)) * 100) : 0;
  const badge = getBadgeStyle(overallEfficiency);

  return (
    <motion.div className="space-y-4 sm:space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* ── Performance Badge ── */}
      <motion.div
        className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
        style={{ background: badge.gradient }}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
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
          {overallEfficiency}% efficiency &bull; {stats.completedSessions}/{stats.totalSessions} sessions completed
        </p>
      </motion.div>

      {/* ── Summary Cards ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { icon: <Calendar className="w-5 h-5" />, value: stats.totalSessions, label: 'Total Sessions', border: 'rgba(168,85,247,0.3)', bg: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(147,51,234,0.2))' },
          { icon: <Target className="w-5 h-5" />, value: `${completionRate}%`, label: 'Completion Rate', border: 'rgba(34,197,94,0.3)', bg: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(22,163,74,0.2))' },
          { icon: <TrendingUp className="w-5 h-5" />, value: `${overallEfficiency}%`, label: 'Efficiency', border: 'rgba(59,130,246,0.3)', bg: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(37,99,235,0.2))' },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            className="backdrop-blur-xl rounded-xl sm:rounded-2xl border p-4 sm:p-6 text-center"
            style={{ borderColor: card.border, background: card.bg }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2 text-white/80">{card.icon}</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{card.value}</div>
            <div className="text-xs sm:text-sm text-gray-300 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Donut */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Time Distribution</h3>
          <div className="min-h-[240px] flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-gray-500 text-sm">No planned time to display</p>
            ) : (
              <DonutChart data={pieData} size={200} />
            )}
          </div>
        </div>

        {/* Bars */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Planned vs Actual</h3>
          <div className="min-h-[240px] flex items-center justify-center">
            {barData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data to display</p>
            ) : (
              <SimpleBarChart data={barData} />
            )}
          </div>
        </div>
      </div>

      {/* ── Subject Details ── */}
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
            const subjectSessions = data.sessions.filter((s) => s.subjectId === subject.subjectId);
            const completedCount = subjectSessions.filter((s) => normalizeStatus(s.status) === 'completed').length;
            const efficiency = subject.plannedMinutes > 0 ? Math.round((subject.actualSeconds / (subject.plannedMinutes * 60)) * 100) : 0;

            const efficiencyColor = efficiency >= 80 ? '#22c55e' : efficiency >= 50 ? '#eab308' : '#ef4444';
            const efficiencyBg = efficiency >= 80 ? 'rgba(34,197,94,0.1)' : efficiency >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)';

            return (
              <motion.div
                key={subject.subjectId}
                className="p-4 rounded-xl bg-white/5 border border-white/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                      whileHover={{ scale: 1.3 }}
                    />
                    <h4 className="text-white font-medium truncate">{subject.subjectName}</h4>
                  </div>
                  <span className="text-sm text-gray-400 flex-shrink-0 ml-2">
                    {completedCount}/{subjectSessions.length} sessions
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <motion.div className="p-2 rounded-lg bg-white/5" whileHover={{ scale: 1.05 }}>
                    <div className="text-base sm:text-lg font-semibold text-white">{formatDurationMinutes(subject.plannedMinutes)}</div>
                    <div className="text-xs text-gray-500">Planned</div>
                  </motion.div>
                  <motion.div className="p-2 rounded-lg bg-white/5" whileHover={{ scale: 1.05 }}>
                    <div className="text-base sm:text-lg font-semibold text-white">{formatDuration(subject.actualSeconds)}</div>
                    <div className="text-xs text-gray-500">Actual</div>
                  </motion.div>
                  <motion.div className="p-2 rounded-lg" style={{ backgroundColor: efficiencyBg }} whileHover={{ scale: 1.05 }}>
                    <div className="text-base sm:text-lg font-semibold" style={{ color: efficiencyColor }}>
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
