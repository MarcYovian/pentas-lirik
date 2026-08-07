import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveState } from '../types';
import { DisplaySetting, DEFAULT_DISPLAY_SETTING } from '../types/DisplaySetting';
import { buildDisplayInlineStyles } from '../utils/styleUtils';

export const OBSDisplay: React.FC = () => {
  // Live State for lyric and announcement text content
  const [liveState, setLiveState] = useState<LiveState>({
    type: 'clear',
    content: null,
    song_id: null,
    lyric_chunk_id: null,
  });

  // Display Styling State with localStorage zero-flicker caching
  const [displaySetting, setDisplaySetting] = useState<DisplaySetting>(() => {
    const saved = localStorage.getItem('obs_display_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_DISPLAY_SETTING;
  });

  // Initial Load Sync for Live State & Display Styling Settings
  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Sync Live State
      try {
        const res = await fetch('/api/v1/state/live');
        if (res.ok) {
          const json = await res.json();
          if (json.data) setLiveState(json.data);
        } else {
          const fallbackRes = await fetch('/api/v1/live/state');
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.data) setLiveState(fallbackJson.data);
        }
      } catch (err) {
        console.error('Initial live state sync error:', err);
      }

      // 2. Sync Display Setting Customization
      try {
        const settingsRes = await fetch('/api/v1/display/settings');
        if (settingsRes.ok) {
          const settingsJson = await settingsRes.json();
          if (settingsJson.data) {
            setDisplaySetting(settingsJson.data);
            localStorage.setItem('obs_display_settings', JSON.stringify(settingsJson.data));
          }
        }
      } catch (err) {
        console.error('Initial display settings sync error:', err);
      }
    };

    fetchInitialData();
    const pollInterval = setInterval(fetchInitialData, 500);
    return () => clearInterval(pollInterval);
  }, []);

  // Real-Time WebSocket Listener (Reverb / Echo Engine)
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        try {
          ws?.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'display' } }));
        } catch (e) {}
      };

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          const evt = messageData.event || messageData.type;

          // Handle Lyric Content Updates
          if (evt === 'display:update' || evt === 'App\\Events\\DisplayUpdateEvent') {
            const rawData = messageData.data || messageData.payload;
            const payload = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            if (payload) setLiveState(payload);
          } else if (evt === 'display:clear' || evt === 'App\\Events\\DisplayClearEvent') {
            setLiveState({
              type: 'clear',
              content: null,
              song_id: null,
              lyric_chunk_id: null,
            });
          } else if (messageData.type === 'INIT_STATE' && messageData.payload) {
            setLiveState(messageData.payload);
          }
          
          // Handle Real-Time Styling Updates (Zero-Flicker)
          if (evt === 'display:settings-updated' || evt === 'App\\Events\\DisplaySettingsUpdatedEvent') {
            const updatedPayload = messageData.data;
            if (updatedPayload && updatedPayload.font_size) {
              setDisplaySetting(updatedPayload);
              localStorage.setItem('obs_display_settings', JSON.stringify(updatedPayload));
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
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

  // Compute dynamic inline styles (memoized for performance)
  const inlineStyles = useMemo(() => {
    return buildDisplayInlineStyles(displaySetting);
  }, [displaySetting]);

  // Compute outer container max width class
  const outerMaxWidthClass = useMemo(() => {
    if (!displaySetting.show_background) {
      return 'max-w-full';
    }
    return displaySetting.max_width || 'max-w-7xl';
  }, [displaySetting.show_background, displaySetting.max_width]);

  const isVisible = liveState.type !== 'clear' && !!liveState.content;

  return (
    <div
      id="obs-display-canvas"
      className="fixed inset-0 bg-transparent flex flex-col justify-end pb-16 px-12 pointer-events-none select-none z-50 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {isVisible && liveState.content && (
          <motion.div
            id="obs-lyric-wrapper"
            key={`${liveState.song_id || 0}-${liveState.lyric_chunk_id || 0}-${liveState.updated_at || liveState.content}`}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full ${outerMaxWidthClass} mx-auto flex justify-center text-center`}
          >
            <div
              id="obs-lyric-text"
              className="font-display leading-tight whitespace-pre-wrap transition-all duration-150"
              style={inlineStyles}
            >
              {liveState.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
