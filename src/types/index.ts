export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  plannedMinutes: number;
  actualSeconds: number;
  colorTag: string;
  notes: string;
  tags: string[];
  status: 'planned' | 'in_progress' | 'in-progress' | 'completed' | 'skipped';
  createdAt: string;
  updatedAt: string;
  manualEntry: boolean;
  seriesId: string | null;
  parentSessionId: string | null;
  recurrence: string | null;
}

export interface DayData {
  app: string;
  exportedAt: string;
  subjects: Subject[];
  sessions: StudySession[];
}

export interface DayStats {
  totalPlannedMinutes: number;
  totalActualSeconds: number;
  completedSessions: number;
  totalSessions: number;
  subjectBreakdown: {
    subjectId: string;
    subjectName: string;
    color: string;
    plannedMinutes: number;
    actualSeconds: number;
    percentage: number;
  }[];
}

export type ViewMode = 'dashboard' | 'timeline' | 'analytics' | 'settings';
