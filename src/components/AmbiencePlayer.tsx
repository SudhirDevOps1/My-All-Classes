import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Link2, ChevronDown, Play, Pause, SkipForward } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

export function AmbiencePlayer({ initialPlaylist = [] }: { initialPlaylist?: Array<{id: string, name: string, url: string}> }) {
  const [isMusicEnabled, setFocusMusicEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragControls = useDragControls();

  const currentTrack = initialPlaylist?.[currentPlaylistIndex] || initialPlaylist?.[0];
  const activeUrl = currentTrack?.url || "";

  // Helper to determine window bounds for dragging
  const [bounds, setBounds] = useState({ top: -500, left: -500, right: 0, bottom: 0 });
  useEffect(() => {
    const updateBounds = () => {
      if (typeof window !== 'undefined') {
        setBounds({
          top: -(window.innerHeight - 340),
          left: -(window.innerWidth - 400),
          right: 20,
          bottom: 60
        });
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(activeUrl);

  useEffect(() => {
    if (isMusicEnabled) {
      const isYoutubeVideo = activeUrl && videoId;
      
      if (isYoutubeVideo) {
        // Stop HTML audio if YouTube iframe is handling playback
        audioRef.current?.pause();
      } else {
        if (activeUrl) {
          if (audioRef.current && audioRef.current.src !== activeUrl) {
            audioRef.current.src = activeUrl;
            audioRef.current.load();
          }
          audioRef.current?.play().catch(e => {
            console.log("Audio play blocked", e);
          });
        }
      }
    } else {
      audioRef.current?.pause();
    }
  }, [isMusicEnabled, activeUrl, videoId]);

  const handleNextTrack = () => {
    if (initialPlaylist.length > 0) {
      const nextIndex = (currentPlaylistIndex + 1) % initialPlaylist.length;
      setCurrentPlaylistIndex(nextIndex);
      setFocusMusicEnabled(true);
    }
  };

  if (!initialPlaylist || initialPlaylist.length === 0 || !currentTrack) {
    return (
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-2xl p-1.5 px-3 backdrop-blur-xl opacity-50 cursor-not-allowed" title="Add 'ambience_playlist' to your JSON settings">
          <button disabled className="flex items-center justify-center p-2 rounded-xl bg-white/5 text-slate-500">
            <Play className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2.5 py-2">
            <Link2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate max-w-[120px]">
              No Playlist in JSON
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-2xl p-1.5 px-3 backdrop-blur-xl">
        {/* Play/Pause Button */}
        <button
          onClick={() => setFocusMusicEnabled(!isMusicEnabled)}
          className={`flex items-center justify-center p-2 rounded-xl transition-all ${
            isMusicEnabled 
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
          title={isMusicEnabled ? "Pause Ambience" : "Play Ambience"}
        >
          {isMusicEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Skip Button */}
        {initialPlaylist.length > 1 && (
          <button
            onClick={handleNextTrack}
            className="flex items-center justify-center p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
            title="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Sound Selection Button */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2.5 py-2 transition-colors text-slate-300 hover:text-white"
          >
            <div className="text-purple-400">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold max-w-[70px] sm:max-w-[120px] truncate">
              {currentTrack.name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 right-0 sm:-left-4 w-64 bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-64 overflow-y-auto pretty-scrollbar"
              >
                {initialPlaylist.map((track, i) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentPlaylistIndex(i);
                      setIsOpen(false);
                      setFocusMusicEnabled(true);
                    }}
                    className={`flex items-center gap-3 w-full p-3 text-sm text-left transition-colors hover:bg-white/10 ${
                      currentPlaylistIndex === i ? "text-purple-400 bg-white/5" : "text-slate-300"
                    }`}
                  >
                    <div className={`${currentPlaylistIndex === i ? "text-purple-400" : "text-slate-500"}`}>
                      <Link2 className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{track.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* Volume Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => setVolume(v => v === 0 ? 0.5 : 0)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Embedded YouTube video card */}
      {videoId && isMusicEnabled && (
        <motion.div 
          drag 
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragConstraints={bounds}
          className="fixed bottom-16 right-4 sm:bottom-8 sm:right-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-1 shadow-2xl z-[9999] w-[340px] sm:w-[380px] max-w-[90vw] backdrop-blur-xl"
        >
          <div 
            className="flex items-center justify-between p-1.5 px-2.5 cursor-move hover:bg-white/5 rounded-t-xl transition-colors touch-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 select-none pointer-events-none">
              <span className="mr-1">✥</span> Drag here
            </span>
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => setFocusMusicEnabled(false)} 
              className="text-[10px] text-rose-400 font-bold hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="pointer-events-auto border-t border-white/10 pt-1">
            <iframe
              width="100%"
              height="220"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&rel=0`}
              title="Focus YouTube Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="rounded-xl bg-black"
            ></iframe>
          </div>
        </motion.div>
      )}

      {/* HTML5 Audio element for standard tracks */}
      <audio ref={audioRef} loop />
    </div>
  );
}
