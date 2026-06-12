import { DayData, DayStats, Subject, StudySession } from '../types';

// Normalize status: JSON uses "in_progress" but we also support "in-progress"
export const normalizeStatus = (status: string): string => {
  if (status === 'in_progress' || status === 'in-progress') return 'in-progress';
  return status;
};

export const calculateDayStats = (data: DayData | null): DayStats => {
  if (!data) {
    return {
      totalPlannedMinutes: 0,
      totalActualSeconds: 0,
      completedSessions: 0,
      totalSessions: 0,
      subjectBreakdown: []
    };
  }

  const { subjects, sessions } = data;
  
  const totalPlannedMinutes = sessions.reduce((sum, s) => sum + s.plannedMinutes, 0);
  const totalActualSeconds = sessions.reduce((sum, s) => sum + s.actualSeconds, 0);
  const completedSessions = sessions.filter(s => normalizeStatus(s.status) === 'completed').length;
  const totalSessions = sessions.length;

  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.id, s));

  const subjectStats = new Map<string, { planned: number; actual: number }>();
  sessions.forEach(session => {
    const existing = subjectStats.get(session.subjectId) || { planned: 0, actual: 0 };
    subjectStats.set(session.subjectId, {
      planned: existing.planned + session.plannedMinutes,
      actual: existing.actual + session.actualSeconds
    });
  });

  const subjectBreakdown = Array.from(subjectStats.entries()).map(([subjectId, stats]) => {
    const subject = subjectMap.get(subjectId);
    return {
      subjectId,
      subjectName: subject?.name || 'Unknown',
      color: subject?.color || '#666',
      plannedMinutes: stats.planned,
      actualSeconds: stats.actual,
      percentage: totalPlannedMinutes > 0 
        ? Math.round((stats.planned / totalPlannedMinutes) * 100) 
        : 0
    };
  });

  return {
    totalPlannedMinutes,
    totalActualSeconds,
    completedSessions,
    totalSessions,
    subjectBreakdown
  };
};

export const getUpcomingSession = (sessions: StudySession[]): StudySession | null => {
  const now = new Date();
  const upcoming = sessions
    .filter(s => normalizeStatus(s.status) === 'planned' && new Date(s.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  return upcoming[0] || null;
};

export const getCurrentSession = (sessions: StudySession[]): StudySession | null => {
  const now = new Date();
  return sessions.find(s => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    const status = normalizeStatus(s.status);
    return status === 'in-progress' || (start <= now && end >= now && status !== 'completed' && status !== 'skipped');
  }) || null;
};

export const getSubjectById = (subjects: Subject[], id: string): Subject | undefined => {
  return subjects.find(s => s.id === id);
};
