import React from 'react';
import { Star, ExternalLink, Heart, Code, Database } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-slate-900/40 backdrop-blur-2xl mt-auto">
      {/* Gradient line at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-sm font-bold">⚡</span>
              </div>
              <span className="text-lg font-bold gradient-text">FlowTrack</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              The ultimate study tracking ecosystem for relentless learners.
            </p>
          </div>

          {/* Made By */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
              Developer
            </h4>
            <a
              href="https://github.com/SudhirDevOps1"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 mb-3 hover:gap-3 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center group-hover:from-purple-500/40 group-hover:to-blue-500/40 transition-all">
                <Code className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                @SudhirDevOps1
              </span>
            </a>
            <a
              href="https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all group"
            >
              <Star className="w-3.5 h-3.5 text-yellow-400 group-hover:fill-yellow-400 transition-all" />
              <span className="text-xs font-medium text-yellow-300">Star on GitHub</span>
              <ExternalLink className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Data Source */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
              Data Source
            </h4>
            <a
              href="https://github.com/SudhirDevOps1/My-All-Classes"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-2 mb-2 hover:gap-3 transition-all"
            >
              <Database className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                  My All Classes
                </p>
                <p className="text-xs text-gray-500">Daily schedules repo</p>
              </div>
            </a>
            <p className="text-xs text-gray-500 leading-relaxed">
              JSON files auto-scanned from the data directory
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
              Useful Links
            </h4>
            <div className="space-y-2">
              <a
                href="https://the-ultimate-master-study-tracker.vercel.app/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                <span>Original Dashboard</span>
              </a>
              <a
                href="https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Source Code</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {currentYear} FlowTrack Pro. Built with{' '}
            <Heart className="w-3 h-3 inline text-red-400 fill-red-400 mx-0.5" />
            for learners worldwide.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 hidden sm:inline">Powered by</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-medium text-cyan-400">
                React
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400">
                TypeScript
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-400">
                Tailwind
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;