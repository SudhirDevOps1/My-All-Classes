import React from 'react';
import { ViewMode } from '../types';
import { format, isToday, isSameDay } from 'date-fns';
import { Calendar, BarChart3, Clock, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  availableDates: Date[];
  onDateSelect: (date: Date) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  userProfile?: { name: string; age: string; profession: string; goal: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentDate,
  availableDates,
  onDateSelect,
  viewMode,
  onViewChange,
  userProfile
}) => {
  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'timeline' as ViewMode, label: 'Timeline', icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-[100dvh] w-64 sm:w-72 lg:w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-white/[0.08] z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-3 sm:p-4">
          {/* Close button (mobile) */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <span className="text-lg font-semibold text-white">Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Profile */}
          {userProfile && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/15 via-fuchsia-500/10 to-blue-500/15 border border-white/[0.08] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userProfile.name}</p>
                <p className="text-[10px] text-purple-400 font-medium tracking-wide uppercase truncate mt-0.5">
                  {userProfile.profession} • Goal: {userProfile.goal}
                </p>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="space-y-1 mb-4 sm:mb-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium transition-all
                  ${viewMode === item.id 
                    ? 'bg-gradient-to-r from-purple-600/50 to-blue-600/50 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Date List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-2">
              Available Dates
            </h3>
            {availableDates.length === 0 ? (
              <div className="px-2 py-3 text-center">
                <p className="text-sm text-gray-500">No data available</p>
                <p className="text-xs text-gray-600 mt-1">Import a JSON file to get started</p>
              </div>
            ) : (
              <div className="space-y-0.5 sm:space-y-1 pr-1">
                {availableDates
                  .sort((a, b) => b.getTime() - a.getTime())
                  .map((date) => {
                    const isActive = isSameDay(date, currentDate);
                    const label = isToday(date) 
                      ? 'Today' 
                      : format(date, 'EEE, MMM d');
                    const dateKey = format(date, 'dd-MM-yyyy');
                    
                    return (
                      <button
                        key={dateKey}
                        onClick={() => onDateSelect(date)}
                        className={`
                          w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-lg text-sm transition-all
                          ${isActive 
                            ? 'bg-white/10 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}
                        `}
                      >
                        <div className={`
                          w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full flex-shrink-0
                          ${isActive ? 'bg-gradient-to-r from-purple-400 to-blue-400' : 'bg-gray-600'}
                        `} />
                        <span className="truncate text-xs sm:text-sm">{label}</span>
                        <span className="ml-auto text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                          {format(date, 'dd/MM')}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="pt-3 sm:pt-4 border-t border-white/[0.06] mt-3 sm:mt-4">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm">⚡</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white truncate">FlowTrack</p>
                <p className="text-[10px] sm:text-xs text-gray-500">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;