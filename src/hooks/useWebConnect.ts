import { useEffect, useRef, useCallback, useState } from 'react';

interface WebConnectInstance {
  onConnect: (callback: (attr: any) => void) => void;
  onDisconnect: (callback: (attr: any) => void) => void;
  onReceive: (callback: (data: any, attr: any) => void) => void;
  Send: (event: string, data: any) => void;
  Ping: (attr: any) => Promise<any>;
  getConnection: (callback: (attr: any) => void) => void;
  // disconnect method may not exist in all versions
  disconnect?: () => void;
}

interface UseWebConnectOptions {
  topic?: string;
  enabled?: boolean;
  onMessage?: (data: any, peer: any) => void;
  onPeerConnect?: (peer: any) => void;
}

interface UseWebConnectReturn {
  isConnected: boolean;
  peerCount: number;
  peers: any[];
  broadcast: (data: any) => void;
  sendToPeer: (peerId: string, data: any) => void;
  connect: () => void;
  disconnect: () => void;
  error: string | null;
}

/**
 * WebConnect Hook - Serverless P2P synchronization
 * 
 * Uses webConnect.js library to establish WebRTC mesh peer-to-peer connections
 * without any signaling server. Leverages public protocols (Torrent, MQTT, NOSTR)
 * for automatic peer discovery.
 * 
 * Perfect for:
 * - Syncing study data across devices
 * - Real-time collaboration without backend
 * - Static hosting (GitHub Pages, Cloudflare Pages, Netlify, etc.)
 */
export const useWebConnect = (options: UseWebConnectOptions = {}): UseWebConnectReturn => {
  const {
    topic = 'flowtrack-sync',
    enabled = false,
    onMessage,
    onPeerConnect
  } = options;

  const connectRef = useRef<WebConnectInstance | null>(null);
  const isConnectedRef = useRef(false);
  const peersRef = useRef<any[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!enabled || connectRef.current) return;

    try {
      // Dynamic import to avoid SSR issues
      import('webconnect').then(({ default: webconnect }) => {
        const connectInstance = webconnect({ topic });

        connectInstance.onConnect((attr: any) => {
          console.log('[WebConnect] Connected:', attr);
          isConnectedRef.current = true;
          setIsConnected(true);
          setError(null);
        });

        connectInstance.onDisconnect((attr: any) => {
          console.log('[WebConnect] Disconnected:', attr);
          isConnectedRef.current = false;
          setIsConnected(false);
        });

        connectInstance.onReceive((data: any, attr: any) => {
          console.log('[WebConnect] Received:', data, attr);
          if (onMessage) {
            onMessage(data, attr);
          }
        });

        connectInstance.getConnection((attr: any) => {
          console.log('[WebConnect] Peer connection:', attr);
          if (!peersRef.current.find(p => p.connectId === attr.connectId)) {
            peersRef.current.push(attr);
            setPeers([...peersRef.current]);
            setPeerCount(peersRef.current.length);
            if (onPeerConnect) {
              onPeerConnect(attr);
            }
          }
        });

        connectRef.current = connectInstance;
      }).catch((err: any) => {
        console.error('[WebConnect] Failed to load:', err);
        setError('Failed to load WebConnect library');
      });
    } catch (err: any) {
      console.error('[WebConnect] Connection error:', err);
      setError('Connection failed');
    }
  }, [enabled, onMessage, onPeerConnect, topic]);

  const disconnect = useCallback(() => {
    if (connectRef.current && connectRef.current.disconnect) {
      connectRef.current.disconnect();
    }
    connectRef.current = null;
    isConnectedRef.current = false;
    setIsConnected(false);
    peersRef.current = [];
    setPeers([]);
    setPeerCount(0);
  }, []);

  const broadcast = useCallback((data: any) => {
    if (connectRef.current && isConnectedRef.current) {
      connectRef.current.Send('sync-data', data);
    }
  }, []);

  const sendToPeer = useCallback((peerId: string, data: any) => {
    if (connectRef.current && isConnectedRef.current) {
      connectRef.current.Send('peer-data', { ...data, targetPeerId: peerId });
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    peerCount,
    peers,
    broadcast,
    sendToPeer,
    connect,
    disconnect,
    error
  };
};

export default useWebConnect;