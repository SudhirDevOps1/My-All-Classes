import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, Layers, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface WebConnectGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  peerCount: number;
}

const WebConnectGuideModal: React.FC<WebConnectGuideModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  peerCount
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          >
            <div 
              className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden pointer-events-auto shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <span>WebConnect P2P Sync</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Serverless
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400">Direct Browser-to-Browser Mesh Connection</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Section */}
              <div className="p-6 bg-white/[0.02] border-b border-white/[0.05]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-500'}`} />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {isConnected ? 'P2P Mesh Network Active' : 'P2P Sync Currently Offline'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {isConnected ? `Successfully connected to ${peerCount} remote device(s)` : 'Feature is disabled by default in source code'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-white/5 px-2.5 py-1 rounded border border-white/5">
                      Topic: flowtrack-study-sync
                    </span>
                  </div>
                </div>
              </div>

              {/* Content / Guide */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {/* How to Enable */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>How to Enable on Your Remote Devices</span>
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    By default, FlowTrack runs locally for maximum privacy. To enable auto device-to-device syncing without any signaling backend server, simply set <code className="text-purple-400 bg-white/5 px-1 rounded">enabled: true</code> in <code className="text-gray-300 font-mono bg-white/5 px-1 rounded">src/App.tsx</code>:
                  </p>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono text-gray-400 overflow-x-auto">
{`const { isConnected, peerCount } = useWebConnect({
  enabled: true, // ← Enable P2P mesh network
  options: {
    appName: 'flowtrack',
    channelName: 'study-sync'
  }
});`}
                  </pre>
                </div>

                {/* How it works */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>How Serverless WebConnect Works</span>
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Normally, WebRTC peer-to-peer apps require a centralized WebSocket signaling server just to help browsers discover each other. <strong className="text-white">webConnect.js</strong> completely eliminates backend servers by leveraging existing decentralized public protocols (like BitTorrent DHT, MQTT, and NOSTR) for initial handshakes.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This allows fully static apps hosted on Cloudflare Pages, GitHub Pages, or Vercel to establish true encrypted multi-peer mesh networks automatically.
                  </p>
                </div>

                {/* Limitations */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Technical Limitations to Keep in Mind</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <h4 className="text-xs font-semibold text-amber-200">1. Active Tab Needed</h4>
                      <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                        P2P synchronization requires both browsers to be open and active. Mobile browsers may freeze WebRTC connections when sent to the background.
                      </p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <h4 className="text-xs font-semibold text-amber-200">2. Strict Firewalls</h4>
                      <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                        Symmetric corporate or university NAT/Firewalls might block direct UDP peer connections if standard STUN relays cannot traverse them.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link */}
                <div className="pt-2">
                  <a
                    href="https://webconnect.js.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Read official webConnect.js API documentation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-slate-900/50 flex items-center justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-medium text-white shadow-lg shadow-blue-500/20 transition-all"
                >
                  Got It, Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WebConnectGuideModal;