import { useEffect, useRef, useCallback, useState } from 'react';

// Official webConnect.js types based on actual source code from CDN
// Source: https://cdn.jsdelivr.net/npm/webconnect/dist/esm/webconnect.js

interface WebConnectOptions {
  appName?: string;
  channelName?: string;
  connectPassword?: string;
  iceConfiguration?: RTCConfiguration;
  torrentTrackers?: string[];
  nostrRelays?: string[];
  mqttBrokers?: string[];
}

interface WebConnectInstance {
  // Event listeners (callbacks)
  onConnect: (callback: (attr: { connectId: string }) => void) => void;
  onDisconnect: (callback: (attr: { connectId: string }) => void) => void;
  onReceive: (callback: (data: any, attr: { connectId: string; metadata?: any }) => void) => void;
  onSendProgress: (callback: (attr: { percent: number; connectId: string; metadata?: any }) => void) => void;
  onReceiveProgress: (callback: (attr: { percent: number; connectId: string; metadata?: any }) => void) => void;
  onStreaming: (callback: (stream: MediaStream, attr: { connectId: string; metadata?: any }) => void) => void;
  
  // Actions
  Send: (data: any, attribute: { connectId: string | string[] | null; metadata?: any }) => void;
  openStreaming: (stream: MediaStream, attribute: { connectId: string | null; metadata?: any }) => void;
  closeStreaming: (stream: MediaStream, attribute: { connectId: string | null }) => void;
  Ping: (attribute: { connectId: string }) => Promise<number>;
  Disconnect: () => void;
  getConnection: (callback: (attr: { connection: string[]; connections: any }) => void) => void;
  getMyId: (callback: (attr: { connectId: string }) => void) => void;
}

interface UseWebConnectOptions {
  enabled?: boolean;
  options?: WebConnectOptions;
  onMessage?: (data: any, peer: { connectId: string; metadata?: any }) => void;
  onPeerConnect?: (peer: { connectId: string }) => void;
  onPeerDisconnect?: (peer: { connectId: string }) => void;
}

interface UseWebConnectReturn {
  isConnected: boolean;
  peerCount: number;
  peers: string[];
  myId: string | null;
  broadcast: (data: any, metadata?: any) => void;
  sendToPeer: (peerId: string | string[], data: any, metadata?: any) => void;
  ping: (peerId: string) => Promise<number>;
  connect: () => void;
  disconnect: () => void;
  error: string | null;
}

// Official CDN URL (verified from webconnect.js.org)
const WEBCONNECT_CDN = 'https://cdn.jsdelivr.net/npm/webconnect/dist/esm/webconnect.js';

/**
 * Load webConnect.js from official CDN
 * The npm package has no dist files, so CDN is required
 */
async function loadWebConnect(): Promise<any> {
  // Dynamic import from CDN - cast to any to bypass TypeScript module resolution
  return (await import(/* @vite-ignore */ WEBCONNECT_CDN)) as any;
}

/**
 * WebConnect Hook - Serverless P2P synchronization
 * 
 * Official API from https://webconnect.js.org/
 * 
 * Features:
 * - Auto WebRTC mesh P2P connection
 * - No signaling server required
 * - Uses BitTorrent DHT, MQTT, NOSTR for peer discovery
 * - Works on static hosting (GitHub Pages, Cloudflare, Netlify, etc.)
 */
export const useWebConnect = (options: UseWebConnectOptions = {}): UseWebConnectReturn => {
  const { 
    enabled = false, 
    options: connectOptions = {},
    onMessage,
    onPeerConnect,
    onPeerDisconnect
  } = options;

  const connectRef = useRef<WebConnectInstance | null>(null);
  const isConnectedRef = useRef(false);
  const peersRef = useRef<string[]>([]);
  const mountedRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<string[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize webConnect instance
   */
  const connect = useCallback(() => {
    if (!enabled || connectRef.current) return;

    loadWebConnect()
      .then((module) => {
        if (!mountedRef.current) return;

        const { default: webconnect } = module;
        
        // Create instance with options
        // Official API: webconnect(options)
        const instance: WebConnectInstance = webconnect(connectOptions);

        // Get my own connection ID
        instance.getMyId((attr) => {
          if (mountedRef.current) {
            setMyId(attr.connectId);
          }
        });

        // Listen for peer connections
        instance.onConnect((attr) => {
          if (!mountedRef.current) return;
          
          isConnectedRef.current = true;
          setIsConnected(true);
          setError(null);

          // Update peer list
          if (!peersRef.current.includes(attr.connectId)) {
            peersRef.current = [...peersRef.current, attr.connectId];
            setPeers(peersRef.current);
            setPeerCount(peersRef.current.length);
          }

          if (onPeerConnect) {
            onPeerConnect(attr);
          }
        });

        // Listen for peer disconnections
        instance.onDisconnect((attr) => {
          if (!mountedRef.current) return;

          peersRef.current = peersRef.current.filter(id => id !== attr.connectId);
          setPeers(peersRef.current);
          setPeerCount(peersRef.current.length);

          if (peersRef.current.length === 0) {
            isConnectedRef.current = false;
            setIsConnected(false);
          }

          if (onPeerDisconnect) {
            onPeerDisconnect(attr);
          }
        });

        // Listen for incoming data
        instance.onReceive((data, attr) => {
          if (!mountedRef.current) return;
          if (onMessage) {
            onMessage(data, attr);
          }
        });

        // Get initial connection list
        instance.getConnection((attr) => {
          if (!mountedRef.current) return;
          const peerList = attr.connection || [];
          if (peerList.length > 0) {
            peersRef.current = peerList;
            setPeers(peerList);
            setPeerCount(peerList.length);
            isConnectedRef.current = true;
            setIsConnected(true);
          }
        });

        connectRef.current = instance;
      })
      .catch((err: any) => {
        console.error('[WebConnect] Failed to initialize:', err);
        if (mountedRef.current) {
          setError(`Failed to load webConnect: ${err.message}`);
        }
      });
  }, [enabled, connectOptions, onMessage, onPeerConnect, onPeerDisconnect]);

  /**
   * Disconnect from all peers
   */
  const disconnectFn = useCallback(() => {
    if (connectRef.current) {
      connectRef.current.Disconnect();
    }
    connectRef.current = null;
    isConnectedRef.current = false;
    setIsConnected(false);
    peersRef.current = [];
    setPeers([]);
    setPeerCount(0);
    setMyId(null);
  }, []);

  /**
   * Broadcast data to all connected peers
   * Official API: Send(data, { connectId: null })
   */
  const broadcast = useCallback((data: any, metadata?: any) => {
    if (connectRef.current && isConnectedRef.current) {
      connectRef.current.Send(data, { connectId: null, metadata });
    }
  }, []);

  /**
   * Send data to specific peer(s)
   * Official API: Send(data, { connectId: peerId })
   * connectId can be: single peerId, array of peerIds, or null (broadcast)
   */
  const sendToPeer = useCallback((peerId: string | string[], data: any, metadata?: any) => {
    if (connectRef.current && isConnectedRef.current) {
      connectRef.current.Send(data, { connectId: peerId, metadata });
    }
  }, []);

  /**
   * Get latency to a specific peer
   * Official API: Ping({ connectId }) returns Promise<number>
   */
  const ping = useCallback((peerId: string): Promise<number> => {
    if (!connectRef.current || !isConnectedRef.current) {
      return Promise.reject(new Error('Not connected'));
    }
    return connectRef.current.Ping({ connectId: peerId });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      connect();
    }
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
    ping,
    connect,
    disconnect: disconnectFn,
    error
  };
};

export default useWebConnect;