import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveState, WsMessage } from '../types';

export const OBSDisplay: React.FC = () => {
  const [liveState, setLiveState] = useState<LiveState>({
    type: 'clear',
    content: null,
    song_id: null,
    lyric_chunk_id: null,
  });

  // Initial Load Sync (FR-12): Fetch live state from backend to prevent blank display on reload
  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await fetch('/api/v1/state/live');
        if (!res.ok) {
          const fallbackRes = await fetch('/api/v1/live/state');
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.data) setLiveState(fallbackJson.data);
          return;
        }
        const json = await res.json();
        if (json.data) {
          setLiveState(json.data);
        }
      } catch (err) {
        console.error('Initial live state sync error:', err);
      }
    };

    fetchLiveState();
  }, []);

  // WebSocket Listener with Auto-Reconnect for Real-Time Updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);

          // Handle Laravel Reverb broadcast format
          if (messageData.event === 'display:update' || messageData.type === 'display:update') {
            const payload = typeof messageData.data === 'string' 
              ? JSON.parse(messageData.data) 
              : (messageData.payload || messageData.data);
            setLiveState(payload);
          } else if (messageData.event === 'display:clear' || messageData.type === 'display:clear') {
            setLiveState({
              type: 'clear',
              content: null,
              song_id: null,
              lyric_chunk_id: null,
            });
          } else if (messageData.type === 'INIT_STATE' && messageData.payload) {
            setLiveState(messageData.payload);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        // Auto-reconnect after 2 seconds if connection drops
        reconnectTimer = setTimeout(connectWS, 2000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        ws?.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  const isVisible = liveState.type !== 'clear' && !!liveState.content;

  return (
    <div 
      id="obs-display-canvas" 
      className="fixed inset-0 bg-transparent flex flex-col justify-end pb-16 px-12 pointer-events-none select-none z-50 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {isVisible && liveState.content && (
          <motion.div
            id="obs-lyric-container"
            key={`${liveState.song_id || 0}-${liveState.lyric_chunk_id || 0}-${liveState.updated_at || liveState.content}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto text-center"
          >
            <div id="obs-lyric-text" className="font-display font-extrabold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-wide uppercase obs-text-shadow whitespace-pre-wrap drop-shadow-2xl">
              {liveState.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
