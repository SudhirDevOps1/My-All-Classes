import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudySession, Subject } from '../types';
import { formatTime, formatDuration, formatDurationMinutes } from '../utils/dateUtils';
import { normalizeStatus } from '../utils/statsUtils';
import { X, Clock, Tag, FileText, CheckCircle2, Circle, Play } from 'lucide-react';

interface SessionDetailModalProps {
  session: StudySession | null;
  subject: Subject | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ 
  session, 
  subject, 
  isOpen, 
  onClose 
}) => {
  if (!session) return null;

  const status = normalizeStatus(session.status);
  const progress = Math.min(100, Math.round((session.actualSeconds / (session.plannedMinutes * 60)) * 100));

  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'completed':
        return { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'in-progress':
        return { icon: <Play className="w-5 h-5" />, label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'skipped':
        return { icon: <Circle className="w-5 h-5" />, label: 'Skipped', color: 'text-gray-400', bg: 'bg-gray-500/20' };
      default:
        return { icon: <Clock className="w-5 h-5" />, label: 'Planned', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="relative p-6 border-b border-white/10"
                style={{ background: `linear-gradient(135deg, ${session.colorTag}20, transparent)` }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${session.colorTag}30` }}
                  >
                    {subject?.name?.charAt(0) || '📚'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{subject?.name}</h2>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Progress Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Session Progress</span>
                    <span className="text-lg font-bold text-white">{progress}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: session.colorTag }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Planned: {formatDurationMinutes(session.plannedMinutes)}</span>
                    <span>Actual: {formatDuration(session.actualSeconds)}</span>
                  </div>
                </div>

                {/* Time Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Start Time</span>
                    </div>
                    <p className="text-white font-medium">{formatTime(session.startTime)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">End Time</span>
                    </div>
                    <p className="text-white font-medium">{formatTime(session.endTime)}</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Notes</span>
                  </div>
                  <p className="text-white">{session.notes}</p>
                </div>

                {/* Tags */}
                {session.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {session.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-white/10 text-sm text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{new Date(session.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span>{new Date(session.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session ID</span>
                    <span className="font-mono">{session.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionDetailModal;