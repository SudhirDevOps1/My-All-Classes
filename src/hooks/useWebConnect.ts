import { useEffect, useRef, useCallback, useState } from 'react';

interface UseWebConnectOptions {
  enabled?: boolean;
  appName?: string;
  channelName?: string;
  onMessage?: (data: any, peerId: string) => void;
  onPeerConnect?: (peerId: string) => void;
  onPeerDisconnect?: (peerId: string) => void;
}

interface UseWebConnectReturn {
  isConnected: boolean;
  peerCount: number;
  peers: string[];
  myId: string | null;
  broadcast: (data: any) => void;
  sendToPeer: (peerId: string, data: any) => void;
  pingPeer: (peerId: string) => Promise<number | null>;
  connect: () => void;
  disconnect: () => void;
  error: string | null;
}

// Official webConnect.js CDN (UMD — works everywhere)
const WEBCONNECT_CDN = 'https://cdn.jsdelivr.net/npm/webconnect/dist/umd/webconnect.js';

// Load webconnect via dynamic script injection
function loadWebConnectScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded?
    if ((window as any).webconnect) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = WEBCONNECT_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load webconnect.js from CDN'));
    document.head.appendChild(script);
  });
}

/**
 * WebConnect Hook — Serverless P2P synchronization.
 *
 * Uses webConnect.js to establish WebRTC mesh connections
 * WITHOUT any signaling server. Uses BitTorrent DHT, MQTT, NOSTR
 * for automatic peer discovery.
 *
 * Official API: https://webconnect.js.org/
 *
 * NOTE: Disabled by default (enabled=false). Set enabled=true to activate.
 */
export const useWebConnect = (options: UseWebConnectOptions = {}): UseWebConnectReturn => {
  const {
    enabled = false,
    appName = 'FlowTrack',
    channelName = 'flowtrack-study-sync',
    onMessage,
    onPeerConnect,
    onPeerDisconnect
  } = options;

  const instanceRef = useRef<any>(null);
  const peersRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<string[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePeers = useCallback(() => {
    const list = Array.from(peersRef.current);
    setPeers(list);
    setPeerCount(list.length);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || instanceRef.current) return;

    loadWebConnectScript()
      .then(() => {
        if (!mountedRef.current) return;

        const wc = (window as any).webconnect;
        if (!wc) {
          setError('webconnect.js not available on window');
          return;
        }

        // Initialize with appName + channelName per official API
        const instance = wc({ appName, channelName });

        // Get my own connection ID
        instance.getMyId((attr: { connectId: string }) => {
          if (mountedRef.current) setMyId(attr.connectId);
        });

        // Listen for new peer connections
        instance.onConnect((attr: { connectId: string }) => {
          if (!mountedRef.current) return;
          const id = attr.connectId;
          if (!peersRef.current.has(id)) {
            peersRef.current.add(id);
            updatePeers();
            if (onPeerConnect) onPeerConnect(id);
          }
          setIsConnected(true);
          setError(null);
        });

        // Listen for peer disconnections
        instance.onDisconnect((attr: { connectId: string }) => {
          if (!mountedRef.current) return;
          const id = attr.connectId;
          peersRef.current.delete(id);
          updatePeers();
          if (onPeerDisconnect) onPeerDisconnect(id);
          if (peersRef.current.size === 0) setIsConnected(false);
        });

        // Listen for incoming data
        instance.onReceive((data: any, attr: { connectId: string; metadata?: any }) => {
          if (!mountedRef.current) return;
          if (onMessage) onMessage(data, attr.connectId);
        });

        // Get existing connections in the channel
        instance.getConnection((attr: { connection: string[] }) => {
          if (!mountedRef.current) return;
          if (Array.isArray(attr.connection)) {
            attr.connection.forEach((id: string) => peersRef.current.add(id));
            updatePeers();
          }
        });

        instanceRef.current = instance;
      })
      .catch((err: any) => {
        console.error('[WebConnect] Load failed:', err);
        if (mountedRef.current) setError('Failed to load webconnect.js from CDN');
      });
  }, [enabled, appName, channelName, onMessage, onPeerConnect, onPeerDisconnect, updatePeers]);

  const disconnectFn = useCallback(() => {
    if (instanceRef.current && instanceRef.current.Disconnect) {
      instanceRef.current.Disconnect(); // NOTE: capital D per official API
    }
    instanceRef.current = null;
    peersRef.current.clear();
    setIsConnected(false);
    setPeers([]);
    setPeerCount(0);
    setMyId(null);
  }, []);

  const broadcast = useCallback((data: any) => {
    if (instanceRef.current) {
      // connectId: null = broadcast to ALL peers in channel
      instanceRef.current.Send(data, { connectId: null });
    }
  }, []);

  const sendToPeer = useCallback((peerId: string, data: any) => {
    if (instanceRef.current) {
      instanceRef.current.Send(data, { connectId: peerId });
    }
  }, []);

  const pingPeer = useCallback(async (peerId: string): Promise<number | null> => {
    if (!instanceRef.current) return null;
    try {
      return await instanceRef.current.Ping({ connectId: peerId });
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      disconnectFn();
    };
  }, [enabled, connect, disconnectFn]);

  return {
    isConnected,
    peerCount,
    peers,
    myId,
    broadcast,
    sendToPeer,
    pingPeer,
    connect,
    disconnect: disconnectFn,
    error
  };
};

export default useWebConnect;