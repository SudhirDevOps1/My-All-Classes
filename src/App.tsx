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
import { Menu, X, Download, Loader2, Sparkles } from 'lucide-react';

const STORAGE_PREFIX = 'flowtrack_';
const CACHE_PREFIX = 'flowtrack_cache_';
const MANIFEST_URL = '/data/file-manifest.json';

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
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const fetchedRef = useRef<Set<string>>(new Set());

  const autoScanFiles = useCallback(async () => {
    setScanning(true);
    const datesMap: DateDataMap = {};
    const dates: Date[] = [];
    const dateStrings = new Set<string>();

    let filesToScan: string[] = [];
    try {
      const manifestRes = await fetch(MANIFEST_URL);
      if (manifestRes.ok) {
        const manifest = await manifestRes.json();
        if (Array.isArray(manifest.files)) {
          filesToScan = manifest.files;
        }
      }
    } catch {
      filesToScan = availableDataFiles;
    }

    const localStorageDates: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const dateKey = key.replace(CACHE_PREFIX, '');
        if (!dateStrings.has(dateKey)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const data = JSON.parse(cached) as DayData;
              datesMap[dateKey] = data;
              const [day, month, year] = dateKey.split('-').map(Number);
              if (day && month && year) {
                dates.push(new Date(year, month - 1, day));
                dateStrings.add(dateKey);
              }
            }
          } catch {}
        }
      }
    }

    const allFiles = [...new Set([...filesToScan, ...localStorageDates])];
    setScanProgress({ current: 0, total: allFiles.length });

    const scanPromises = allFiles.map(async (filename, idx) => {
      try {
        const dateKey = filename.replace('.json', '');
        
        if (datesMap[dateKey]) {
          setScanProgress({ current: idx + 1, total: allFiles.length });
          return;
        }

        if (fetchedRef.current.has(dateKey)) {
          const cached = localStorage.getItem(CACHE_PREFIX + dateKey);
          if (cached) {
            try {
              const data = JSON.parse(cached) as DayData;
              datesMap[dateKey] = data;
              const [day, month, year] = dateKey.split('-').map(Number);
              if (day && month && year) {
                dates.push(new Date(year, month - 1, day));
                dateStrings.add(dateKey);
              }
            } catch {}
          }
          setScanProgress({ current: idx + 1, total: allFiles.length });
          return;
        }

        fetchedRef.current.add(dateKey);

        const url = `/data/${filename}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json() as DayData;
          datesMap[dateKey] = data;
          
          try {
            localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(data));
          } catch {}
          
          const [day, month, year] = dateKey.split('-').map(Number);
          if (day && month && year) {
            const date = new Date(year, month - 1, day);
            dates.push(date);
            dateStrings.add(dateKey);
          }
        }
      } catch (err) {}
      setScanProgress({ current: idx + 1, total: allFiles.length });
    });

    await Promise.all(scanPromises);

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
    setLoadedDates(datesMap);
    setScanning(false);
    
    return { datesMap, sortedDates };
  }, []);

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

  const loadDataForDate = useCallback((date: Date) => {
    const filename = formatDateForFile(date);
    
    if (loadedDates[filename]) {
      setDayData(loadedDates[filename]);
      return;
    }
    
    const stored = localStorage.getItem(STORAGE_PREFIX + filename);
    if (stored) {
      try {
        const data = JSON.parse(stored) as DayData;
        setDayData(data);
        return;
      } catch {}
    }
    
    setDayData(null);
  }, [loadedDates]);

  useEffect(() => {
    if (Object.keys(loadedDates).length > 0) {
      loadDataForDate(currentDate);
    }
  }, [currentDate, loadedDates, loadDataForDate]);

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
    
    setLoadedDates(prev => ({ ...prev, [filename]: data }));
    
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
                className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
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
    </div>
  );
};

export default App;