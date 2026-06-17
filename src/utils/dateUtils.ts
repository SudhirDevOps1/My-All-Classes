import { format, addDays, subDays, parse, isValid, isToday as isTodayFn, isYesterday, isTomorrow } from 'date-fns';

export const formatDateForFile = (date: Date): string => {
  return format(date, 'dd-MM-yyyy');
};

export const formatDateForDisplay = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const formatDateShort = (date: Date): string => {
  return format(date, 'MMM d');
};

export const parseDateFromFilename = (filename: string): Date | null => {
  const name = filename.replace('.json', '');
  // Try DD-MM-YYYY format
  const parsed = parse(name, 'dd-MM-yyyy', new Date());
  if (isValid(parsed)) return parsed;
  
  // Try DD/MM/YYYY format
  const parsed2 = parse(name, 'dd/MM/yyyy', new Date());
  if (isValid(parsed2)) return parsed2;
  
  return null;
};

export const getNextDay = (date: Date): Date => {
  return addDays(date, 1);
};

export const getPreviousDay = (date: Date): Date => {
  return subDays(date, 1);
};

export const getRelativeDayLabel = (date: Date): string => {
  if (isTodayFn(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'hh:mm a');
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDurationMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const calculateProgress = (actualSeconds: number, plannedMinutes: number): number => {
  if (plannedMinutes === 0) return 0;
  const plannedSeconds = plannedMinutes * 60;
  return Math.min(100, Math.round((actualSeconds / plannedSeconds) * 100));
};