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
import { useWebConnect } from './hooks/useWebConnect';
import WebConnectGuideModal from './components/WebConnectGuideModal';
import { Menu, X, Download, Loader2, Sparkles, Wifi, WifiOff } from 'lucide-react';

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

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadedDates, setLoadedDates] = useState<DateDataMap>({});
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showP2PGuide, setShowP2PGuide] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const fetchedRef = useRef<Set<string>>(new Set());
  const loadedDatesRef = useRef<DateDataMap>({});

  useEffect(() => {
    loadedDatesRef.current = loadedDates;
  }, [loadedDates]);
  
  // WebConnect P2P sync (optional, disabled by default)
  // Official API: https://webconnect.js.org/#api-connect-to-a-channel
  const { isConnected: isP2PConnected, peerCount } = useWebConnect({
    enabled: false, // Set to true to enable P2P sync across devices
    options: {
      appName: 'flowtrack',
      channelName: 'study-sync'
    }
  });

  // Generate all possible DD-MM-YYYY.json filenames in a date range
  const generateDateRange = useCallback((fromDate: Date, toDate: Date): string[] => {
    const result: string[] = [];
    const d = new Date(fromDate);
    while (d <= toDate) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      result.push(`${dd}-${mm}-${yyyy}.json`);
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, []);

  const autoScanFiles = useCallback(async () => {
    setScanning(true);
    const datesMap: DateDataMap = {};
    const dates: Date[] = [];
    const dateStrings = new Set<string>();

    // ── Step 1: Load localStorage data immediately ──────────────────
    const registerLocalEntry = (dateKey: string, raw: string | null) => {
      if (!raw || dateStrings.has(dateKey)) return;
      try {
        const data = JSON.parse(raw) as DayData;
        const [day, month, year] = dateKey.split('-').map(Number);
        if (day && month && year) {
          datesMap[dateKey] = data;
          dates.push(new Date(year, month - 1, day));
          dateStrings.add(dateKey);
        }
      } catch {}
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && !key.startsWith(CACHE_PREFIX)) {
        registerLocalEntry(key.replace(STORAGE_PREFIX, ''), localStorage.getItem(key));
      }
    }

    // ── Step 2: Build list of candidate filenames to scan ───────────
    // Merge: manifest list + fallback list + auto-generated date range (90 days back → 14 days forward)
    let manifestFiles: string[] = [];
    try {
      const manifest = await fetchJsonFromSources<{ files?: string[] }>(MANIFEST_URL);
      if (manifest && Array.isArray(manifest.files)) {
        manifestFiles = manifest.files;
      }
    } catch {}

    const today = new Date();
    const past = new Date(today);
    past.setDate(past.getDate() - 90);
    const future = new Date(today);
    future.setDate(future.getDate() + 14);
    const autoScannedFiles = generateDateRange(past, future);

    // Deduplicate, then append any localStorage-only dates not yet in the list
    const allCandidateFiles = [...new Set([
      ...manifestFiles,
      ...availableDataFiles,
      ...autoScannedFiles,
    ])];

    // ── Step 3: Fetch every candidate in parallel (batches of 20) ──
    const BATCH_SIZE = 20;
    setScanProgress({ current: 0, total: allCandidateFiles.length });

    const fetchFile = async (filename: string) => {
      const dateKey = filename.replace('.json', '');

      // Skip dates already loaded from localStorage
      if (datesMap[dateKey]) {
        setScanProgress(prev => ({ ...prev, current: Math.min(prev.current + 1, prev.total) }));
        return;
      }

      // Skip if already fetched in this session (cache hit)
      if (fetchedRef.current.has(dateKey)) {
        setScanProgress(prev => ({ ...prev, current: Math.min(prev.current + 1, prev.total) }));
        return;
      }

      fetchedRef.current.add(dateKey);

      try {
        const data = await fetchJsonFromSources<DayData>(`/data/${filename}`);
        if (data) {
          datesMap[dateKey] = data;
          try {
            localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(data));
          } catch {}
          const [day, month, year] = dateKey.split('-').map(Number);
          if (day && month && year) {
            dates.push(new Date(year, month - 1, day));
            dateStrings.add(dateKey);
          }
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
      if (!datesMap[key]) {
        datesMap[key] = sampleData[key];
        const [day, month, year] = key.split('-').map(Number);
        if (day && month && year) {
          dates.push(new Date(year, month - 1, day));
          dateStrings.add(key);
        }
      }
    });

    const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
    setAvailableDates(sortedDates);
    loadedDatesRef.current = datesMap;
    setLoadedDates(datesMap);
    setScanning(false);

    return { datesMap, sortedDates };
  }, [generateDateRange]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const result = await autoScanFiles();
      if (result) {
        const today = new Date();
        const todayKey = formatDateForFile(today);
        
        if (result.datesMap[todayKey]) {
          setDayData(result.datesMap[todayKey]);
          setCurrentDate(today);
        } else {
          const yesterday = getPreviousDay(today);
          const yesterdayKey = formatDateForFile(yesterday);
          if (result.datesMap[yesterdayKey]) {
            setDayData(result.datesMap[yesterdayKey]);
            setCurrentDate(yesterday);
          } else if (result.sortedDates.length > 0) {
            const mostRecent = result.sortedDates[0];
            const key = formatDateForFile(mostRecent);
            setDayData(result.datesMap[key]);
            setCurrentDate(mostRecent);
          } else {
            setDayData(null);
          }
        }
      }
      setLoading(false);
    };

    init();
  }, [autoScanFiles]);

  const loadDataForDate = useCallback(async (date: Date) => {
    setLoading(true);
    const filename = formatDateForFile(date);           // e.g. "12-06-2026" (no .json)
    const dateKey = filename;                            // e.g. "12-06-2026"
    const jsonFilename = `${filename}.json`;             // e.g. "12-06-2026.json"

    try {
      // 1. Always attempt to fetch fresh online data first (Live Server Fetch)
      //    NOTE: Must use `.json` extension when fetching from /data/
      const freshData = await fetchJsonFromSources<DayData>(`/data/${jsonFilename}`);
      if (freshData) {
        setDayData(freshData);
        setLoadedDates(prev => {
          const next = { ...prev, [dateKey]: freshData };
          loadedDatesRef.current = next;
          return next;
        });
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
        setDayData(data);
        setLoading(false);
        return;
      } catch {}
    }

    // 3. Fall back to cached SWR data (already in state from auto-scan)
    if (loadedDatesRef.current[dateKey]) {
      setDayData(loadedDatesRef.current[dateKey]);
      setLoading(false);
      return;
    }

    // 4. Fall back to cached data in localStorage
    const cachedStored = localStorage.getItem(CACHE_PREFIX + dateKey);
    if (cachedStored) {
      try {
        const data = JSON.parse(cachedStored) as DayData;
        setDayData(data);
        setLoading(false);
        return;
      } catch {}
    }

    // 5. Fall back to bundled samples
    if (sampleData[dateKey]) {
      setDayData(sampleData[dateKey]);
      setLoading(false);
      return;
    }

    setDayData(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDataForDate(currentDate);
  }, [currentDate, loadDataForDate]);

  const handlePreviousDay = () => {
    setCurrentDate(prev => getPreviousDay(prev));
  };

  const handleNextDay = () => {
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
    setDayData(data);
    setShowImport(false);
    
    setLoadedDates(prev => {
      const next = { ...prev, [filename]: data };
      loadedDatesRef.current = next;
      return next;
    });
    
    setAvailableDates(prev => {
      const exists = prev.some(d => isSameDay(d, currentDate));
      if (exists) return prev;
      return [...prev, currentDate].sort((a, b) => b.getTime() - a.getTime());
    });
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
    fetchedRef.current.clear();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex flex-col">
      <AnimatedBackground />

      <header className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0">
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
                  <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Study Tracker Pro</p>
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
              {/* Clickable P2P Status & Guide Button (Visible on ALL devices) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowP2PGuide(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] transition-all cursor-pointer"
                title="WebConnect P2P Sync & Guide"
              >
                {isP2PConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 animate-pulse" />
                    <span className="text-[10px] sm:text-xs text-gray-300 font-medium">{peerCount}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">peers</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 hover:text-gray-400 transition-colors" />
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">P2P Guide</span>
                  </>
                )}
              </motion.button>
              
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
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextDay}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] transition-all"
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
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 sm:py-20 px-4"
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4 sm:mb-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-3xl sm:text-5xl">📚</span>
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Sessions Planned</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
                    There are no study sessions scheduled for this day. Import a schedule to get started!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowImport(true)}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-600/25"
                    >
                      Import Schedule
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToday}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg sm:rounded-xl font-medium transition-all"
                    >
                      Go to Today
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={viewMode}
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === 'dashboard' && (
                    <Dashboard data={dayData} />
                  )}
                  {viewMode === 'timeline' && (
                    <Timeline data={dayData} />
                  )}
                  {viewMode === 'analytics' && (
                    <Analytics data={dayData} />
                  )}
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

      {/* WebConnect P2P Interactive Guide Modal */}
      <WebConnectGuideModal
        isOpen={showP2PGuide}
        onClose={() => setShowP2PGuide(false)}
        isConnected={isP2PConnected}
        peerCount={peerCount}
      />
    </div>
  );
};

export default App;