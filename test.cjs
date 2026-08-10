
async function test() {
  const response = await fetch('https://my-all-classes.pages.dev/api/data');
  const { subjects, sessions, appUsage, blockRules } = await response.json();
  const mappedSessions = (sessions || []).map((s) => ({
    id: s.id,
    subjectId: s.subjectid ?? s.subject_id,
    startTime: s.starttime ?? s.start_time,
    endTime: s.endtime ?? s.end_time,
    plannedMinutes: Number(s.plannedminutes ?? s.planned_minutes ?? 0),
    actualSeconds: Number(s.actualseconds ?? s.actual_seconds ?? 0),
    status: s.status,
  }));
  const datesMap = {};
  mappedSessions.forEach((session) => {
    if (!session.startTime) return;
    const d = new Date(session.startTime);
    if (isNaN(d.getTime())) return;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const dateKey = dd + '-' + mm + '-' + yyyy;
    if (!datesMap[dateKey]) { datesMap[dateKey] = { app: 'FlowTrack', sessions: [] }; }
    if (!datesMap[dateKey].sessions.some(s => s.id === session.id)) { datesMap[dateKey].sessions.push(session); }
  });
  console.log('Keys:', Object.keys(datesMap));
  if (datesMap['03-08-2026']) { console.log('Aug 3 sessions:', datesMap['03-08-2026'].sessions.length); }
}
test().catch(console.error);

