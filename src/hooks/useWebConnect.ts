import { useEffect, useRef, useCallback, useState } from 'react';

interface UseWebConnectOptions {
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

// Dynamic CDN import — the published npm package has NO built dist files
// Docs: https://webconnect.js.org/
const WEBCONNECT_CDN =
  'https://cdn.jsdelivr.net/npm/webconnect/dist/esm/webconnect.js';

async function loadWebConnect(): Promise<any> {
  // Dynamic script injection for the ESM module from CDN
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import webconnect from '${WEBCONNECT_CDN}';
      window.__webconnect_module = webconnect;
    `;
    script.onerror = () => reject(new Error('Failed to load webConnect CDN'));
    document.head.appendChild(script);

    // Poll for the module to load
    const timeout = setTimeout(() => reject(new Error('webConnect load timeout')), 10000);
    const check = setInterval(() => {
      if ((window as any).__webconnect_module) {
        clearInterval(check);
        clearTimeout(timeout);
        const mod = (window as any).__webconnect_module;
        delete (window as any).__webconnect_module;
        resolve(mod);
      }
    }, 200);
  });
}

/**
 * WebConnect Hook — Serverless P2P synchronization.
 *
 * Uses webConnect.js to establish WebRTC mesh connections
 * WITHOUT any signaling server. Uses BitTorrent DHT, MQTT, NOSTR
 * for automatic peer discovery. Works on static hosting.
 *
 * NOTE: Disabled by default (enabled=false). Set enabled=true to activate.
 */
export const useWebConnect = (options: UseWebConnectOptions = {}): UseWebConnectReturn => {
  const { enabled = false, onMessage, onPeerConnect } = options;

  const connectRef = useRef<any>(null);
  const isConnectedRef = useRef(false);
  const peersRef = useRef<any[]>([]);
  const mountedRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!enabled || connectRef.current) return;

    loadWebConnect()
      .then((webconnect: any) => {
        if (!mountedRef.current) return;
        const instance = webconnect();

        instance.onConnect(() => {
          if (!mountedRef.current) return;
          isConnectedRef.current = true;
          setIsConnected(true);
          setError(null);
        });

        instance.onDisconnect(() => {
          if (!mountedRef.current) return;
          isConnectedRef.current = false;
          setIsConnected(false);
        });

        instance.onReceive((data: any, attr: any) => {
          if (!mountedRef.current) return;
          if (onMessage) onMessage(data, attr);
        });

        instance.getConnection((attr: any) => {
          if (!mountedRef.current) return;
          if (!peersRef.current.find((p: any) => p.connectId === attr.connectId)) {
            peersRef.current.push(attr);
            setPeers([...peersRef.current]);
            setPeerCount(peersRef.current.length);
            if (onPeerConnect) onPeerConnect(attr);
          }
        });

        connectRef.current = instance;
      })
      .catch((err: any) => {
        console.error('[WebConnect] Failed:', err);
        if (mountedRef.current) setError('Failed to load webConnect from CDN');
      });
  }, [enabled, onMessage, onPeerConnect]);

  const disconnectFn = useCallback(() => {
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
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      disconnectFn();
    };
  }, [enabled, connect, disconnectFn]);

  return { isConnected, peerCount, peers, broadcast, sendToPeer, connect, disconnect: disconnectFn, error };
};

export default useWebConnect;