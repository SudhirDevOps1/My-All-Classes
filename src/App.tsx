import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSameDay } from 'date-fns';
import { DayData, ViewMode } from './types';
import { formatDateForFile, getNextDay, getPreviousDay } from './utils/dateUtils';
import { sampleData } from './data/sampleData';
import { availableDataFiles } from './data/fileList';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import Analytics from './components/Analytics';
import Sidebar from './components/Sidebar';
import ImportModal from './components/ImportModal';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import ErrorBoundary from './components/ErrorBoundary';
import { AmbiencePlayer } from './components/AmbiencePlayer';

import { Menu, X, Download, Loader2, Sparkles, Wifi, WifiOff, Flame } from 'lucide-react';

const STORAGE_PREFIX = 'flowtrack_';
const CACHE_PREFIX = 'flowtrack_cache_';
const MANIFEST_URL = '/data/file-manifest.json';
const REMOTE_DATA_BASE_URL = 'https://my-all-classes.pages.dev/data';
const REQUEST_TIMEOUT_MS = 8000;



const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const fetchJsonFromSources = async <T,>(path: string): Promise<T | null> => {
  const urls = [
    path,
    `${REMOTE_DATA_BASE_URL}/${path.replace(/^\/data\//, '')}`
  ];

  for (const url of [...new Set(urls)]) {
    try {
      const response = await fetchWithTimeout(url, { cache: 'no-cache' });
      if (response.ok) {
        return await response.json() as T;
      }
    } catch {}
  }

  return null;
};

interface DateDataMap {
  [key: string]: DayData;
}

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const MOTIVATIONAL_QUOTES = [
  { text: "Consistency is the key to success. Every small step counts!", author: "Unknown" },
  { text: "Rest is a part of the process. Recharge and come back stronger tomorrow!", author: "Fitness Wisdom" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Your future self will thank you for the effort you put in today.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Focus on progress, not perfection.", author: "Bill Gates" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" }
];



const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadedDates, setLoadedDates] = useState<DateDataMap>({});
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<{ name: string; age: string; profession: string; goal: string } | null>(null);
  const [playlist, setPlaylist] = useState<{ id: string; name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const loadedDatesRef = useRef<DateDataMap>({});

  useEffect(() => {
    loadedDatesRef.current = loadedDates;
  }, [loadedDates]);

  const autoScanFiles = useCallback(async () => {
    setScanning(true);
    const datesMap: DateDataMap = {};
    const dates: Date[] = [];
    const dateStrings = new Set<string>();

    // Helper to group sessions by date from any DayData file
    const registerDayDataGroups = (data: DayData) => {
      if (!data) return;
      
      // Group sessions by date
      if (Array.isArray(data.sessions)) {
        data.sessions.forEach(session => {
          if (!session.startTime) return;
          const d = new Date(session.startTime);
          if (isNaN(d.getTime())) return;
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          const dateKey = `${dd}-${mm}-${yyyy}`;

          if (!datesMap[dateKey]) {
            datesMap[dateKey] = {
              app: data.app,
              exportedAt: data.exportedAt,
              subjects: data.subjects,
              sessions: []
            };
          }

          const sessionExists = datesMap[dateKey].sessions.some(s => s.id === session.id);
          if (!sessionExists) {
            datesMap[dateKey].sessions.push(session);
          }

          if (!dateStrings.has(dateKey)) {
            dates.push(new Date(yyyy, d.getMonth(), d.getDate()));
            dateStrings.add(dateKey);
          }
        });
      }

      // Also ensure the date representing the file/export date itself is registered even if it had no sessions
      if (data.exportedAt) {
        const d = new Date(data.exportedAt);
        if (!isNaN(d.getTime())) {
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          const dateKey = `${dd}-${mm}-${yyyy}`;
          if (!datesMap[dateKey]) {
            datesMap[dateKey] = {
              app: data.app,
              exportedAt: data.exportedAt,
              subjects: data.subjects,
              sessions: []
            };
          }
          if (!dateStrings.has(dateKey)) {
            dates.push(new Date(yyyy, d.getMonth(), d.getDate()));
            dateStrings.add(dateKey);
          }
        }
      }
    };

    // ── Step 1: Load localStorage data immediately ──────────────────
    const registerLocalEntry = (dateKey: string, raw: string | null) => {
      if (!raw) return;
      try {
        const data = JSON.parse(raw) as DayData;
        registerDayDataGroups(data);
      } catch {}
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && !key.startsWith(CACHE_PREFIX)) {
        registerLocalEntry(key.replace(STORAGE_PREFIX, ''), localStorage.getItem(key));
      }
    }

    // ── Step 2: Build list of candidate filenames to scan ───────────
    // Merge only: manifest list + fallback list
    let manifestFiles: string[] = [];
    try {
      const manifest = await fetchJsonFromSources<{ files?: string[] }>(MANIFEST_URL);
      if (manifest && Array.isArray(manifest.files)) {
        manifestFiles = manifest.files;
      }
    } catch {}

    // Deduplicate, then append any localStorage-only dates not yet in the list
    const allCandidateFiles = [...new Set([
      ...manifestFiles,
      ...availableDataFiles,
    ])];

    // ── Step 3: Fetch every candidate in parallel (batches of 20) ──
    const BATCH_SIZE = 20;
    setScanProgress({ current: 0, total: allCandidateFiles.length });

    const fetchFile = async (filename: string) => {
      try {
        const data = await fetchJsonFromSources<DayData>(`/data/${filename}`);
        if (data) {
          registerDayDataGroups(data);
          try {
            localStorage.setItem(CACHE_PREFIX + filename.replace('.json', ''), JSON.stringify(data));
          } catch {}
        }
      } catch {}
      setScanProgress(prev => ({ ...prev, current: Math.min(prev.current + 1, prev.total) }));
    };

    // Run fetches in batches of 20 to avoid overwhelming the browser
    for (let i = 0; i < allCandidateFiles.length; i += BATCH_SIZE) {
      const batch = allCandidateFiles.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((f) => fetchFile(f)));
    }

    // ── Step 3.5: Fall back to cached offline fetched data (CACHE_PREFIX) ──
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        registerLocalEntry(key.replace(CACHE_PREFIX, ''), localStorage.getItem(key));
      }
    }

    // ── Step 4: Merge bundled sample data as the lowest priority ────
    Object.keys(sampleData).forEach(key => {
      registerDayDataGroups(sampleData[key]);
    });

    const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
    setAvailableDates(sortedDates);
    loadedDatesRef.current = datesMap;
    setLoadedDates(datesMap);
    setScanning(false);

    return { datesMap, sortedDates };
  }, []);

  /**
   * Filter sessions in DayData to only those whose startTime (UTC) falls on the
   * target date. Real FlowTrack exports may bundle sessions from multiple
   * dates into a single JSON file, so we must filter before displaying.
   * Uses UTC date parts to match the JSON timestamps consistently regardless
   * of the user's local timezone.
   */
  const filterDataForDate = useCallback((data: DayData, targetDate: Date): DayData => {
    // Build the target date in UTC to match ISO timestamp dates
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const filtered = data.sessions.filter(session => {
      const d = new Date(session.startTime);
      // Try local time first (user's timezone), then UTC as fallback
      const localMatch = d.getDate() === targetDay &&
                         d.getMonth() === targetMonth &&
                         d.getFullYear() === targetYear;
      const utcMatch = d.getUTCDate() === targetDay &&
                        d.getUTCMonth() === targetMonth &&
                        d.getUTCFullYear() === targetYear;
      return localMatch || utcMatch;
    });

    return { ...data, sessions: filtered };
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const result = await autoScanFiles();
      if (result) {
        const today = new Date();
        const todayKey = formatDateForFile(today);
        
        if (result.datesMap[todayKey]) {
          setDayData(filterDataForDate(result.datesMap[todayKey], today));
          setCurrentDate(today);
        } else {
          const yesterday = getPreviousDay(today);
          const yesterdayKey = formatDateForFile(yesterday);
          if (result.datesMap[yesterdayKey]) {
            setDayData(filterDataForDate(result.datesMap[yesterdayKey], yesterday));
            setCurrentDate(yesterday);
          } else if (result.sortedDates.length > 0) {
            const mostRecent = result.sortedDates[0];
            const key = formatDateForFile(mostRecent);
            setDayData(filterDataForDate(result.datesMap[key], mostRecent));
            setCurrentDate(mostRecent);
          } else {
            setDayData(null);
          }
        }
      }
      setLoading(false);
    };

    init();
  }, [autoScanFiles, filterDataForDate]);

  // ── Auto-refresh: poll for new files every 60s + on tab focus ──────
  useEffect(() => {
    let isCancelled = false;

    const silentScan = async () => {
      // Lightweight background scan — no loading spinner
      const candidates: string[] = [];

      // Re-fetch manifest for any newly listed files
      try {
        const manifest = await fetchJsonFromSources<{ files?: string[] }>(MANIFEST_URL);
        if (manifest?.files) candidates.push(...manifest.files);
      } catch {}

      const uniqueCandidates = [...new Set([
        ...candidates,
        ...availableDataFiles
      ])];
      const newlyFound: { dateKey: string; data: DayData; date: Date }[] = [];

      const BATCH = 20;
      for (let i = 0; i < uniqueCandidates.length; i += BATCH) {
        if (isCancelled) return;
        const batch = uniqueCandidates.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map(async (filename) => {
            try {
              const data = await fetchJsonFromSources<DayData>(`/data/${filename}`);
              if (data) {
                const datesFound: { dateKey: string; data: DayData; date: Date }[] = [];
                const addDate = (d: Date) => {
                  if (isNaN(d.getTime())) return;
                  const dd = String(d.getDate()).padStart(2, '0');
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const yyyy = d.getFullYear();
                  const dateKey = `${dd}-${mm}-${yyyy}`;
                  datesFound.push({ dateKey, data, date: new Date(yyyy, d.getMonth(), d.getDate()) });
                };

                if (Array.isArray(data.sessions)) {
                  data.sessions.forEach(s => {
                    if (s.startTime) addDate(new Date(s.startTime));
                  });
                }
                if (data.exportedAt) {
                  addDate(new Date(data.exportedAt));
                }
                return datesFound;
              }
            } catch {}
            return [];
          })
        );
        
        results.forEach(datesArray => {
           datesArray.forEach(item => newlyFound.push(item));
        });
      }

      if (isCancelled || newlyFound.length === 0) return;

      // Merge newly found data into state
      setLoadedDates(prev => {
        const next = { ...prev };
        newlyFound.forEach(({ dateKey, data }) => { 
          if (!next[dateKey]) {
            next[dateKey] = { app: data.app, exportedAt: data.exportedAt, subjects: data.subjects || [], sessions: [] };
          }
          if (Array.isArray(data.sessions)) {
            data.sessions.forEach(session => {
              if (session.startTime) {
                 const d = new Date(session.startTime);
                 if (!isNaN(d.getTime())) {
                   const dd = String(d.getDate()).padStart(2, '0');
                   const mm = String(d.getMonth() + 1).padStart(2, '0');
                   const yyyy = d.getFullYear();
                   if (`${dd}-${mm}-${yyyy}` === dateKey && !next[dateKey].sessions.some(s => s.id === session.id)) {
                     next[dateKey].sessions.push(session);
                   }
                 }
              }
            });
          }
        });
        loadedDatesRef.current = next;
        return next;
      });
      setAvailableDates(prev => {
        const existingKeys = new Set(prev.map(d => formatDateForFile(d)));
        const newDates = newlyFound
          .filter(({ dateKey }) => !existingKeys.has(dateKey))
          .map(({ date }) => date);
        if (newDates.length === 0) return prev;
        return [...prev, ...newDates].sort((a, b) => b.getTime() - a.getTime());
      });
      // Cache new data in localStorage
      newlyFound.forEach(({ dateKey, data }) => {
        try { localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(data)); } catch {}
      });
    };

    // Poll every 60 seconds
    const intervalId = window.setInterval(silentScan, 60_000);

    // Re-scan when tab regains focus
    const onFocus = () => { if (!isCancelled) silentScan(); };
    window.addEventListener('focus', onFocus);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const loadDataForDate = useCallback(async (date: Date) => {
    setLoading(true);
    const filename = formatDateForFile(date);           // e.g. "12-06-2026" (no .json)
    const dateKey = filename;                            // e.g. "12-06-2026"
    const jsonFilename = `${filename}.json`;             // e.g. "12-06-2026.json"

    try {
      // 1. Always attempt to fetch fresh online data first (Live Server Fetch)
      const freshData = await fetchJsonFromSources<DayData>(`/data/${jsonFilename}`);
      if (freshData) {
        const newDatesMap = { ...loadedDatesRef.current };
        const newDatesToAdd: Date[] = [];

        const registerDayDataGroupsLocal = (d: DayData) => {
          if (!d || !Array.isArray(d.sessions)) return;
          d.sessions.forEach(session => {
            if (!session.startTime) return;
            const dateObj = new Date(session.startTime);
            if (isNaN(dateObj.getTime())) return;
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            const dateK = `${dd}-${mm}-${yyyy}`;

            if (!newDatesMap[dateK]) {
              newDatesMap[dateK] = {
                app: d.app,
                exportedAt: d.exportedAt,
                subjects: d.subjects,
                sessions: []
              };
            }
            const exists = newDatesMap[dateK].sessions.some(s => s.id === session.id);
            if (!exists) newDatesMap[dateK].sessions.push(session);

            newDatesToAdd.push(new Date(yyyy, dateObj.getMonth(), dateObj.getDate()));
          });
        };

        registerDayDataGroupsLocal(freshData);

        setLoadedDates(newDatesMap);
        loadedDatesRef.current = newDatesMap;
        
        setAvailableDates(prevDates => {
          const dateStringsSet = new Set(prevDates.map(d => formatDateForFile(d)));
          let updated = false;
          const newDatesList = [...prevDates];
          newDatesToAdd.forEach(d => {
            const k = formatDateForFile(d);
            if (!dateStringsSet.has(k)) {
              newDatesList.push(d);
              dateStringsSet.add(k);
              updated = true;
            }
          });
          return updated ? newDatesList.sort((a, b) => b.getTime() - a.getTime()) : prevDates;
        });

        setDayData(filterDataForDate(newDatesMap[dateKey] || freshData, date));

        try {
          localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(freshData));
        } catch {}
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Fall back to manual user imports if online fetch failed or 404
    const userStored = localStorage.getItem(STORAGE_PREFIX + dateKey);
    if (userStored) {
      try {
        const data = JSON.parse(userStored) as DayData;
        setDayData(filterDataForDate(data, date));
        setLoading(false);
        return;
      } catch {}
    }

    // 3. Fall back to cached SWR data (already in state from auto-scan)
    if (loadedDatesRef.current[dateKey]) {
      setDayData(filterDataForDate(loadedDatesRef.current[dateKey], date));
      setLoading(false);
      return;
    }

    // 4. Fall back to cached data in localStorage
    const cachedStored = localStorage.getItem(CACHE_PREFIX + dateKey);
    if (cachedStored) {
      try {
        const data = JSON.parse(cachedStored) as DayData;
        setDayData(filterDataForDate(data, date));
        setLoading(false);
        return;
      } catch {}
    }

    // 5. Fall back to bundled samples
    if (sampleData[dateKey]) {
      setDayData(filterDataForDate(sampleData[dateKey], date));
      setLoading(false);
      return;
    }

    setDayData(null);
    setLoading(false);
  }, [filterDataForDate]);

  useEffect(() => {
    loadDataForDate(currentDate);
  }, [currentDate, loadDataForDate]);

  useEffect(() => {
    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = today;

    const getFormattedKey = (date: Date) => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };

    const didStudyOnDate = (dateKey: string) => {
      const data = loadedDates[dateKey];
      if (!data) return false;
      return data.sessions.some(s => s.actualSeconds > 0 || s.status === 'completed' || s.status === 'in_progress' || s.status === 'in-progress');
    };

    let todayKey = getFormattedKey(checkDate);
    if (!didStudyOnDate(todayKey)) {
      // If no study today, check yesterday to continue streak
      checkDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    }

    for (let i = 0; i < 365; i++) {
      const key = getFormattedKey(checkDate);
      if (didStudyOnDate(key)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [loadedDates]);

  useEffect(() => {
    // Search settings in loaded data
    let foundPlaylist = false;
    let foundProfile = false;
    for (const key of Object.keys(loadedDates)) {
      const data = loadedDates[key];
      if (data?.settings) {
        const profileEntry = data.settings.find(s => s.key === 'user_profile');
        if (profileEntry && !foundProfile) {
          try {
            setUserProfile(JSON.parse(profileEntry.value));
            foundProfile = true;
          } catch {}
        }
        const playlistEntry = data.settings.find(s => s.key === 'ambience_playlist');
        if (playlistEntry && !foundPlaylist) {
          try {
            setPlaylist(JSON.parse(playlistEntry.value));
            foundPlaylist = true;
          } catch {}
        }
        if (foundPlaylist && foundProfile) break; // Stop if we found both
      }
    }
  }, [loadedDates]);

  const getLatestAllowedDate = () => {
    const today = new Date();
    if (availableDates.length === 0) return today;
    const latestDataDate = availableDates[0];
    return latestDataDate > today ? latestDataDate : today;
  };

  const isLatestDay = isSameDay(currentDate, getLatestAllowedDate()) || currentDate > getLatestAllowedDate();

  const handlePreviousDay = () => {
    setCurrentDate(prev => getPreviousDay(prev));
  };

  const handleNextDay = () => {
    if (isLatestDay) return;
    setCurrentDate(prev => getNextDay(prev));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setSidebarOpen(false);
  };

  const handleImport = (data: DayData) => {
    const filename = formatDateForFile(currentDate);
    localStorage.setItem(STORAGE_PREFIX + filename, JSON.stringify(data));
    
    const newDatesMap = { ...loadedDatesRef.current };
    const newDatesList = [...availableDates];
    const dateStringsSet = new Set(newDatesList.map(d => formatDateForFile(d)));

    const registerDayDataGroupsLocal = (d: DayData) => {
      if (!d || !Array.isArray(d.sessions)) return;
      d.sessions.forEach(session => {
        if (!session.startTime) return;
        const dateObj = new Date(session.startTime);
        if (isNaN(dateObj.getTime())) return;
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const dateK = `${dd}-${mm}-${yyyy}`;

        if (!newDatesMap[dateK]) {
          newDatesMap[dateK] = {
            app: d.app,
            exportedAt: d.exportedAt,
            subjects: d.subjects,
            sessions: []
          };
        }
        const exists = newDatesMap[dateK].sessions.some(s => s.id === session.id);
        if (!exists) newDatesMap[dateK].sessions.push(session);

        if (!dateStringsSet.has(dateK)) {
          newDatesList.push(new Date(yyyy, dateObj.getMonth(), dateObj.getDate()));
          dateStringsSet.add(dateK);
        }
      });
    };

    registerDayDataGroupsLocal(data);

    setLoadedDates(newDatesMap);
    loadedDatesRef.current = newDatesMap;
    setAvailableDates(newDatesList.sort((a, b) => b.getTime() - a.getTime()));
    setDayData(filterDataForDate(newDatesMap[filename] || data, currentDate));
    setShowImport(false);
  };

  const handleExport = () => {
    if (!dayData) return;
    
    const filename = formatDateForFile(currentDate);
    const blob = new Blob([JSON.stringify(dayData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRescan = async () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    loadedDatesRef.current = {};
    setLoadedDates({});
    const result = await autoScanFiles();
    if (result && result.sortedDates.length > 0) {
      const today = new Date();
      const todayKey = formatDateForFile(today);
      if (result.sortedDates.some(d => formatDateForFile(d) === todayKey)) {
        setCurrentDate(today);
      } else {
        setCurrentDate(result.sortedDates[0]);
      }
    }
  };

  const isEmpty = !dayData || dayData.sessions.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'transparent' }}>
      <AnimatedBackground />

      <header className="relative z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0 text-white"
              >
                {sidebarOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
              </motion.button>
              
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <motion.div 
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-base sm:text-lg font-bold">⚡</span>
                </motion.div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold gradient-text truncate">FlowTrack</h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                    Study Tracker Pro <span className="ml-1 text-purple-400 font-medium tracking-wide">✨ Premium UI</span>
                  </p>
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/[0.05]">
              {(['dashboard', 'timeline', 'analytics'] as ViewMode[]).map((mode) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </motion.button>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* User Profile */}
              {userProfile && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl mr-1 sm:mr-2 shadow-lg"
                >
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-cover" />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-bold text-white leading-none truncate max-w-[80px] sm:max-w-[120px]">{userProfile.name}</span>
                    <span className="text-[8px] sm:text-[9px] text-purple-400 font-medium leading-none mt-0.5">Student</span>
                  </div>
                </motion.div>
              )}

              {/* Ambience Player Widget */}
              <div className="mr-1 sm:mr-2">
                <AmbiencePlayer initialPlaylist={playlist} />
              </div>
              
              {/* Streak Badge */}
              {streak > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold"
                  title={`${streak} Day Study Streak`}
                >
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span className="text-[10px] sm:text-xs">{streak} Day Streak</span>
                </motion.div>
              )}
              
              {dayData && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleExport}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  title="Export JSON"
                >
                  <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRescan}
                disabled={scanning}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white disabled:opacity-50"
                title="Rescan Files"
              >
                <Loader2 size={16} className={`sm:w-[18px] sm:h-[18px] ${scanning ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowImport(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-600/25 whitespace-nowrap flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 hidden sm:block" />
                <span className="hidden sm:inline">Import</span>
                <span className="sm:hidden">+</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentDate={currentDate}
          availableDates={availableDates}
          onDateSelect={handleDateSelect}
          viewMode={viewMode}
          onViewChange={(mode) => { setViewMode(mode); setSidebarOpen(false); }}
          userProfile={userProfile}
        />

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <motion.button
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePreviousDay}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              
              <div className="text-center min-w-[140px] sm:min-w-[200px]">
                <motion.h2 
                  key={currentDate.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-base sm:text-xl lg:text-2xl font-bold text-white leading-tight"
                >
                  {currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </motion.h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0 sm:mt-0.5">
                  {currentDate.toLocaleDateString('en-US', { year: 'numeric' })}
                </p>
              </div>
              
              <motion.button
                whileHover={isLatestDay ? {} : { scale: 1.1, x: 2 }}
                whileTap={isLatestDay ? {} : { scale: 0.9 }}
                onClick={handleNextDay}
                disabled={isLatestDay}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/[0.08] transition-all ${isLatestDay ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {scanning && (
                <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Scanning {scanProgress.current}/{scanProgress.total}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToday}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                Today
              </motion.button>
            </div>
          </motion.div>

          <div className="md:hidden flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {(['dashboard', 'timeline', 'analytics'] as ViewMode[]).map((mode) => (
              <motion.button
                key={mode}
                onClick={() => setViewMode(mode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  viewMode === mode
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 bg-white/5 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </motion.button>
            ))}
          </div>

          <div className="pb-4 sm:pb-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 gap-4"
                >
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-500/20" />
                    <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-t-2 border-purple-500 animate-spin" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Loading schedule...</p>
                </motion.div>
              ) : isEmpty ? (
                (() => {
                  const quote = MOTIVATIONAL_QUOTES[Math.abs(currentDate.getDate() + currentDate.getMonth()) % MOTIVATIONAL_QUOTES.length];
                  return (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-10 sm:py-16 px-4 max-w-2xl mx-auto"
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4 sm:mb-6"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-3xl sm:text-5xl">🎯</span>
                      </motion.div>
                      
                      {/* Motivational Quote Container */}
                      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-6xl text-purple-500/10 font-serif leading-none">“</div>
                        <p className="text-base sm:text-lg text-gray-200 font-medium italic relative z-10">
                          {quote.text}
                        </p>
                        <p className="text-xs sm:text-sm text-purple-400 mt-3 font-semibold tracking-wider uppercase">
                          — {quote.author}
                        </p>
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Study Sessions Recorded</h3>
                      <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
                        There are no study sessions logged for this date. Recharge, keep your streak alive, and track your daily classes!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowImport(true)}
                          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-600/25 text-white"
                        >
                          Import Schedule
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleToday}
                          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg sm:rounded-xl font-medium transition-all text-white"
                        >
                          Go to Today
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <motion.div
                  key={viewMode}
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <ErrorBoundary key={`eb-${viewMode}`}>
                    {viewMode === 'dashboard' && (
                      <Dashboard data={dayData} streak={streak} playlist={playlist} />
                    )}
                    {viewMode === 'timeline' && (
                      <Timeline data={dayData} />
                    )}
                    {viewMode === 'analytics' && (
                      <Analytics data={dayData} />
                    )}
                  </ErrorBoundary>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Footer />

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      )}

    </div>
  );
};

export default App;