import { DayData, StudySession, Subject } from '../types';

export const fetchCloudData = async (): Promise<{ datesMap: Record<string, DayData>, sortedDates: Date[] } | null> => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Cloud fetch failed with status:", response.status, errData);
      return null;
    }

    const { subjects, sessions, appUsage, blockRules } = await response.json();

    if (!subjects || !sessions) {
      console.error("Invalid response format from /api/data");
      return null;
    }

    // Group app usage by Date
    const appUsageByDate: Record<string, any[]> = {};
    if (appUsage && Array.isArray(appUsage)) {
      appUsage.forEach(record => {
        let d;
        if (record.startTime) d = new Date(record.startTime);
        else if (record.date) d = new Date(record.date);
        
        if (d && !isNaN(d.getTime())) {
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          const key = `${dd}-${mm}-${yyyy}`;
          if (!appUsageByDate[key]) appUsageByDate[key] = [];
          appUsageByDate[key].push(record);
        }
      });
    }

    // Group sessions by Date to match the DayData format the app expects
    const datesMap: Record<string, DayData> = {};
    const dates: Date[] = [];
    const dateStrings = new Set<string>();

    sessions.forEach((session: StudySession) => {
      if (!session.startTime) return;
      const d = new Date(session.startTime);
      if (isNaN(d.getTime())) return;
      
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const dateKey = `${dd}-${mm}-${yyyy}`;

      if (!datesMap[dateKey]) {
        datesMap[dateKey] = {
          app: 'FlowTrack Pro Cloud',
          exportedAt: new Date().toISOString(),
          subjects: subjects,
          sessions: [],
          appUsage: appUsageByDate[dateKey] || [],
          blockRules: blockRules || []
        };
      }

      // Add session if not exists
      if (!datesMap[dateKey].sessions.some(s => s.id === session.id)) {
        datesMap[dateKey].sessions.push(session);
      }

      if (!dateStrings.has(dateKey)) {
        dates.push(new Date(yyyy, d.getMonth(), d.getDate()));
        dateStrings.add(dateKey);
      }
    });

    // Also ensure dates that only have appUsage but no sessions are created
    Object.keys(appUsageByDate).forEach(dateKey => {
      if (!datesMap[dateKey]) {
        datesMap[dateKey] = {
          app: 'FlowTrack Pro Cloud',
          exportedAt: new Date().toISOString(),
          subjects: subjects,
          sessions: [],
          appUsage: appUsageByDate[dateKey] || [],
          blockRules: blockRules || []
        };
        const parts = dateKey.split('-');
        if (parts.length === 3 && !dateStrings.has(dateKey)) {
          dates.push(new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])));
          dateStrings.add(dateKey);
        }
      }
    });

    // Also inject subjects even if no sessions exist, so they are available
    if (Object.keys(datesMap).length === 0) {
       const today = new Date();
       const dd = String(today.getDate()).padStart(2, '0');
       const mm = String(today.getMonth() + 1).padStart(2, '0');
       const yyyy = today.getFullYear();
       const dateKey = `${dd}-${mm}-${yyyy}`;
       
       datesMap[dateKey] = {
           app: 'FlowTrack Pro Cloud',
           exportedAt: new Date().toISOString(),
           subjects: subjects,
           sessions: [],
           appUsage: appUsageByDate[dateKey] || [],
           blockRules: blockRules || []
       };
       dates.push(new Date(yyyy, today.getMonth(), today.getDate()));
    }

    const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());

    return { datesMap, sortedDates };

  } catch (error) {
    console.error("Cloud fetch exception:", error);
    return null;
  }
};
