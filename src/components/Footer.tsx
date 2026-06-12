import React from 'react';
import { Star, ExternalLink, Heart, Play } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const ecosystemProjects = [
    {
      name: 'Only Study Gallery',
      purpose: 'Daily study screenshots and proof gallery — shows how much was studied each day.',
      live: 'https://only-study-gellery.pages.dev/',
      repo: 'https://github.com/SudhirDevOps1/ONLY-STUDY-GELLERY',
      border: 'border-pink-500/30',
      from: 'from-pink-500/10',
      badge: 'from-pink-500 to-rose-600',
      icon: '📸'
    },
    {
      name: 'My All Classes',
      purpose: 'Daily class-wise study schedule JSON data — tracks what was studied and when.',
      live: 'https://my-all-classes.pages.dev/',
      repo: 'https://github.com/SudhirDevOps1/My-All-Classes',
      border: 'border-blue-500/30',
      from: 'from-blue-500/10',
      badge: 'from-blue-500 to-cyan-600',
      icon: '📚'
    },
    {
      name: 'Ultimate Master Study Tracker',
      purpose: 'The main FlowTrack engine — precision timer, gamification, and analytics in one place.',
      live: 'https://the-ultimate-master-study-tracker.vercel.app/',
      repo: 'https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker',
      border: 'border-purple-500/30',
      from: 'from-purple-500/10',
      badge: 'from-purple-500 to-fuchsia-600',
      icon: '⚡'
    }
  ];

  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-slate-900/40 backdrop-blur-2xl mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-10 lg:py-12">

        {/* ===== TOP ROW: Brand + Author ===== */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-lg font-bold">⚡</span>
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">FlowTrack</span>
              <p className="text-xs text-gray-500 mt-0.5">Study Tracker Pro — Read-only dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/SudhirDevOps1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.08] hover:bg-white/10 transition-all group"
            >
              <GithubIcon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">@SudhirDevOps1</span>
            </a>
            <a
              href="https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all group"
            >
              <Star className="w-3.5 h-3.5 text-yellow-400 group-hover:fill-yellow-400 transition-all" />
              <span className="text-xs font-medium text-yellow-300">Star</span>
            </a>
          </div>
        </div>

        {/* ===== ECOSYSTEM SECTION ===== */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Play className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Free Open Study Ecosystem</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent ml-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ecosystemProjects.map(project => (
              <div
                key={project.name}
                className={`rounded-xl border ${project.border} bg-gradient-to-br ${project.from} via-transparent to-transparent backdrop-blur-sm p-5 group hover:bg-white/[0.04] transition-all duration-300`}
              >
                {/* Card header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {project.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-white truncate">{project.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${project.badge}`}>
                      {project.name === 'Only Study Gallery' ? 'Proof Gallery' : project.name === 'My All Classes' ? 'Schedule Data' : 'Tracker Engine'}
                    </span>
                  </div>
                </div>

                {/* Purpose */}
                <p className="text-xs text-gray-400 leading-relaxed mb-4 min-h-[2.5rem]">
                  {project.purpose}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Live Demo
                  </a>
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-all"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    Repository
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== WHOLE WORKFLOW NOTE ===== */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-gray-400">
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium text-[10px] uppercase tracking-wider">How It Works</span>
            <span>
              <strong className="text-gray-300">Only Study Gallery</strong> for daily screenshot proof →
              <strong className="text-gray-300"> My All Classes</strong> for JSON schedule data →
              <strong className="text-gray-300"> FlowTrack</strong> for the analytics dashboard. All three are free and open-source.
            </span>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {currentYear} FlowTrack Pro. Built with{' '}
            <Heart className="w-3 h-3 inline text-red-400 fill-red-400 mx-0.5" />
            for learners worldwide.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 hidden sm:inline">Powered by</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-medium text-cyan-400">React</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400">TypeScript</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-400">Tailwind</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;