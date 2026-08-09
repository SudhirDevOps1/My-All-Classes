import { DayData, StudySession, Subject } from '../types';

export const fetchCloudData = async (): Promise<{ datesMap: Record<string, DayData>, sortedDates: Date[] } | null> => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Cloud fetch failed with status:", response.status, errData);
      return null;
    }

    const { subjects, sessions } = await response.json();

    if (!subjects || !sessions) {
      console.error("Invalid response format from /api/data");
      return null;
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
          sessions: []
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
           sessions: []
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
