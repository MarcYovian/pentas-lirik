import React, { useState, useEffect, useCallback } from 'react';
import { Zap, ListMusic, Music } from 'lucide-react';
import { Song, Setlist, SetlistItem, User, LiveState, LyricChunk, WsMessage } from './types';
import { Navbar } from './components/Navbar';

import { SongLibrary } from './components/SongLibrary';
import { SetlistRundown } from './components/SetlistRundown';
import { LiveControlPanel } from './components/LiveControlPanel';
import { SongModal } from './components/SongModal';
import { SyncSongModal } from './components/SyncSongModal';
import { UserManagementModal } from './components/UserManagementModal';
import { DisplaySettingsPanel } from './components/settings/DisplaySettingsPanel';
import { OBSDisplay } from './components/OBSDisplay';
import { LoginView } from './components/LoginView';
import { apiClient, AUTH_UNAUTHORIZED_EVENT } from './utils/apiClient';
import {
  saveSongsToOfflineCache,
  getSongsFromOfflineCache,
  saveSetlistsToOfflineCache,
  getSetlistsFromOfflineCache,
  saveLastLiveStateToOfflineCache,
  getLastLiveStateFromOfflineCache,
} from './utils/offlineDb';

export default function App() {
  // Check if current URL is the OBS Browser Source display route
  const isDisplayRoute =
    window.location.pathname === '/display' ||
    window.location.pathname === '/display.html';

  if (isDisplayRoute) {
    return <OBSDisplay />;
  }

  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pentaslirik_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pentaslirik_token') || null;
  });

  const [authError, setAuthError] = useState<string | null>(null);

  // Global 401 Unauthorized Event Listener for Session Expiration Auto-Redirect
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setAuthError('Session expired or invalidated. Please sign in again.');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      }
    };
  }, []);

  // App Data States
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedSetlistItem, setSelectedSetlistItem] = useState<SetlistItem | null>(null);

  const [liveState, setLiveState] = useState<LiveState>({
    type: 'clear',
    content: null,
    song_id: null,
    lyric_chunk_id: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Mobile View Tab State ('live' | 'setlist' | 'library')
  const [activeMobileTab, setActiveMobileTab] = useState<'live' | 'setlist' | 'library'>('live');

  // Modal States
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isSyncSongModalOpen, setIsSyncSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isUserMgmtModalOpen, setIsUserMgmtModalOpen] = useState(false);
  const [isDisplaySettingsModalOpen, setIsDisplaySettingsModalOpen] = useState(false);

  // Fetch initial data with IndexedDB caching & fallback
  const loadData = useCallback(async () => {
    try {
      const [songsRes, setlistsRes, liveStateRes] = await Promise.all([
        apiClient.fetch('/api/v1/songs').then((r) => r.json()),
        apiClient.fetch('/api/v1/setlists').then((r) => r.json()),
        apiClient.fetch('/api/v1/live/state').then((r) => r.json()),
      ]);

      if (songsRes.data) {
        setSongs(songsRes.data);
        saveSongsToOfflineCache(songsRes.data);
      }
      if (setlistsRes.data && Array.isArray(setlistsRes.data)) {
        setSetlists(setlistsRes.data);
        saveSetlistsToOfflineCache(setlistsRes.data);
        setCurrentSetlist((prev) => {
          if (setlistsRes.data.length === 0) return null;
          if (!prev) return setlistsRes.data[0];
          if (typeof prev.id === 'number' && prev.id > 1000000000) {
            return prev;
          }
          const matched = setlistsRes.data.find((s: Setlist) => s.id === prev.id);
          return matched || setlistsRes.data[0];
        });
      }
      if (liveStateRes.data) {
        setLiveState(liveStateRes.data);
        saveLastLiveStateToOfflineCache(liveStateRes.data);
      }
      setIsOffline(false);
    } catch (err) {
      console.warn('Network request failed, attempting IndexedDB offline fallback:', err);
      setIsOffline(true);

      // Offline Fallback from IndexedDB
      try {
        const [cachedSongs, cachedSetlists, cachedLiveState] = await Promise.all([
          getSongsFromOfflineCache(),
          getSetlistsFromOfflineCache(),
          getLastLiveStateFromOfflineCache(),
        ]);

        if (cachedSongs.length > 0) setSongs(cachedSongs);
        if (cachedSetlists.length > 0) {
          setSetlists(cachedSetlists);
          setCurrentSetlist((prev) => {
            if (!prev) return cachedSetlists[0];
            const matched = cachedSetlists.find((s) => s.id === prev.id);
            return matched || cachedSetlists[0];
          });
        }
        if (cachedLiveState) setLiveState(cachedLiveState);
      } catch (dbErr) {
        console.error('Failed to load offline cache from IndexedDB:', dbErr);
      }
    }
  }, []);

  // Listen to browser Online / Offline Network Events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Connection restored: Online');
      setIsOffline(false);
      if (user) {
        loadData();
      }
    };

    const handleOffline = () => {
      console.log('[Network] Connection lost: Offline Mode Active');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, loadData]);


  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // WebSocket Connection for Dashboard State Sync
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        try {
          ws?.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'display' } }));
        } catch (e) {}
      };

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          const evt = messageData.event || messageData.type;
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
        } catch (err) {
          console.error('Error parsing dashboard WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWS, 2000);
      };

      ws.onerror = (err) => {
        setIsConnected(false);
        ws?.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, [user]);

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    setAuthError(null);
    localStorage.setItem('pentaslirik_user', JSON.stringify(loggedInUser));
    localStorage.setItem('pentaslirik_token', authToken);
  };

  const handleLogout = async () => {
    try {
      await apiClient.fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    setToken(null);
    setAuthError(null);
    localStorage.removeItem('pentaslirik_user');
    localStorage.removeItem('pentaslirik_token');
  };

  // Song Library Handlers
  const handleSaveSong = async (songData: { title: string; artist: string; lyrics_raw: string }) => {
    try {
      const payload = {
        ...songData,
        lyrics: songData.lyrics_raw,
      };
      if (editingSong) {
        const res = await apiClient.fetch(`/api/v1/songs/${editingSong.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setSongs((prev) => prev.map((s) => (s.id === json.data.id ? json.data : s)));
          if (selectedSong?.id === json.data.id) {
            setSelectedSong(json.data);
          }
        }
      } else {
        const res = await apiClient.fetch('/api/v1/songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setSongs((prev) => [json.data, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to save song:', err);
    }
  };

  const handleDeleteSong = async (songId: number) => {
    try {
      const res = await apiClient.fetch(`/api/v1/songs/${songId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== songId));
        if (selectedSong?.id === songId) {
          setSelectedSong(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete song:', err);
    }
  };

  // Setlist Rundown Handlers
  const handleSelectSetlist = (setlist: Setlist) => {
    setCurrentSetlist(setlist);
    setSelectedSong(null);
    setSelectedSetlistItem(null);
  };

  const handleCreateNewSetlist = () => {
    const newSetlist: Setlist = {
      id: Date.now(),
      name: `New Event Rundown (${new Date().toLocaleDateString()})`,
      items: [],
    };
    setSetlists((prev) => [newSetlist, ...prev]);
    setCurrentSetlist(newSetlist);
    setSelectedSong(null);
    setSelectedSetlistItem(null);
  };

  const handleSaveCurrentSetlist = async (name: string, items: SetlistItem[], setlistId?: number) => {
    const targetId = setlistId ?? currentSetlist?.id;
    if (!targetId && !name) return;

    try {
      const isNewSetlist = !targetId || targetId > 1000000000;
      if (isNewSetlist) {
        const createRes = await apiClient.fetch('/api/v1/setlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, items }),
        });
        const createJson = await createRes.json();
        if (createRes.ok && createJson.data) {
          setSetlists((prev) => [createJson.data, ...prev.filter((s) => s.id !== targetId)]);
          setCurrentSetlist(createJson.data);
        }
      } else {
        const res = await apiClient.fetch(`/api/v1/setlists/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, items }),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setSetlists((prev) => prev.map((s) => (s.id === json.data.id ? json.data : s)));
          setCurrentSetlist(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to save setlist:', err);
    }
  };

  const handleAddSongToSetlist = (song: Song) => {
    let targetSetlist = currentSetlist;

    // Fallback: pick existing setlist if currentSetlist is null
    if (!targetSetlist) {
      if (setlists.length > 0) {
        targetSetlist = setlists[0];
      } else {
        targetSetlist = {
          id: Date.now(),
          name: `New Event Rundown (${new Date().toLocaleDateString()})`,
          items: [],
        };
        setSetlists([targetSetlist]);
      }
    }

    const newItem: SetlistItem = {
      id: Date.now(),
      type: 'song',
      song_id: song.id,
      song_title: song.title,
      artist: song.artist,
      order: (targetSetlist.items?.length || 0) + 1,
    };

    const updatedSetlist: Setlist = {
      ...targetSetlist,
      items: [...(targetSetlist.items || []), newItem],
    };

    setCurrentSetlist(updatedSetlist);
    setSetlists((prev) => {
      const exists = prev.some((s) => s.id === updatedSetlist.id);
      if (exists) {
        return prev.map((s) => (s.id === updatedSetlist.id ? updatedSetlist : s));
      }
      return [updatedSetlist, ...prev];
    });
  };

  const handleAddAnnouncementToSetlist = (content: string) => {
    if (!currentSetlist) return;

    const newItem: SetlistItem = {
      id: Date.now(),
      type: 'announcement',
      content,
      order: currentSetlist.items.length + 1,
    };

    const updatedSetlist: Setlist = {
      ...currentSetlist,
      items: [...currentSetlist.items, newItem],
    };

    setCurrentSetlist(updatedSetlist);
    setSetlists((prev) => prev.map((s) => (s.id === updatedSetlist.id ? updatedSetlist : s)));
  };

  const handleSelectSetlistItem = (item: SetlistItem) => {
    setSelectedSetlistItem(item);
    if (item.type === 'song' && item.song_id) {
      const song = songs.find((s) => s.id === item.song_id);
      if (song) {
        setSelectedSong(song);
      }
    } else {
      setSelectedSong(null);
    }
  };

  const handleRemoveSetlistItem = (itemId: number) => {
    if (!currentSetlist) return;
    const updatedItems = currentSetlist.items
      .filter((i) => i.id !== itemId)
      .map((item, idx) => ({ ...item, order: idx + 1 }));

    const updatedSetlist = { ...currentSetlist, items: updatedItems };
    setCurrentSetlist(updatedSetlist);
    setSetlists((prev) => prev.map((s) => (s.id === updatedSetlist.id ? updatedSetlist : s)));
  };

  const handleMoveSetlistItem = (index: number, direction: 'up' | 'down') => {
    if (!currentSetlist) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSetlist.items.length) return;

    const items = [...currentSetlist.items];
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const reordered = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    const updatedSetlist = { ...currentSetlist, items: reordered };
    setCurrentSetlist(updatedSetlist);
    setSetlists((prev) => prev.map((s) => (s.id === updatedSetlist.id ? updatedSetlist : s)));
  };

  // Live Control Actions
  const handleSendLyricChunk = async (chunk: LyricChunk, songTitle: string, songId: number) => {
    try {
      const res = await apiClient.fetch('/api/v1/live/send-lyric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lyric',
          text: chunk.content,
          content: chunk.content,
          song_id: songId,
          song_title: songTitle,
          chunk_id: chunk.id,
          lyric_chunk_id: chunk.id,
          label: chunk.label,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setLiveState(json.data);
      }
    } catch (err) {
      console.error('Error sending lyric chunk live:', err);
    }
  };

  const handleSendAnnouncement = async (content: string) => {
    try {
      const res = await apiClient.fetch('/api/v1/live/send-lyric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'announcement',
          text: content,
          content,
          song_id: null,
          lyric_chunk_id: null,
          label: '[ANNOUNCEMENT]',
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setLiveState(json.data);
      }
    } catch (err) {
      console.error('Error sending announcement live:', err);
    }
  };

  const handleClearScreen = async () => {
    try {
      await apiClient.fetch('/api/v1/live/clear', {
        method: 'POST',
      });
      setLiveState({
        type: 'clear',
        content: null,
        song_id: null,
        lyric_chunk_id: null,
      });
    } catch (err) {
      console.error('Error clearing screen:', err);
    }
  };

  // Spacebar next chunk handler (FR-07.1)
  const handleNextChunk = () => {
    if (!selectedSong || selectedSong.lyrics.length === 0) return;

    const lyrics = selectedSong.lyrics;
    // Check if current live chunk belongs to selected song
    if (
      liveState.type === 'lyric' &&
      liveState.song_id === selectedSong.id &&
      liveState.lyric_chunk_id
    ) {
      const currentIndex = lyrics.findIndex((c) => c.id === liveState.lyric_chunk_id);
      if (currentIndex !== -1 && currentIndex < lyrics.length - 1) {
        // Send next chunk
        const nextChunk = lyrics[currentIndex + 1];
        handleSendLyricChunk(nextChunk, selectedSong.title, selectedSong.id);
      } else {
        // At last chunk -> clear screen
        handleClearScreen();
      }
    } else {
      // Screen is clear or different song -> send 1st chunk
      handleSendLyricChunk(lyrics[0], selectedSong.title, selectedSong.id);
    }
  };

  // Render Login View if not authenticated
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} authError={authError} />;
  }


  return (
    <div id="app-root-container" className="flex flex-col min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden bg-[#0F0F0F] text-slate-100 no-select">
      {/* Top Header Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenUserManagement={() => setIsUserMgmtModalOpen(true)}
        onOpenDisplaySettings={() => setIsDisplaySettingsModalOpen(true)}
        isConnected={isConnected}
        liveStateActive={liveState.type === 'lyric' || liveState.type === 'announcement'}
        isOffline={isOffline}
        activeMobileTab={activeMobileTab}
        onSelectMobileTab={setActiveMobileTab}
      />

      {/* Mobile Quick Tab Navigation Bar (Visible only on viewports < md) */}
      <div id="mobile-tab-navigation" className="flex md:hidden items-center justify-around bg-slate-900/90 backdrop-blur border-b border-slate-800 px-2 py-1.5 shrink-0 z-30 select-none">
        <button
          id="mobile-tab-live"
          onClick={() => setActiveMobileTab('live')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition min-h-[44px] touch-manipulation active:scale-95 ${
            activeMobileTab === 'live'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Live Control</span>
        </button>
        <button
          id="mobile-tab-setlist"
          onClick={() => setActiveMobileTab('setlist')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition min-h-[44px] touch-manipulation active:scale-95 ${
            activeMobileTab === 'setlist'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ListMusic className="w-4 h-4 text-indigo-400" />
          <span>Setlist</span>
        </button>
        <button
          id="mobile-tab-library"
          onClick={() => setActiveMobileTab('library')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition min-h-[44px] touch-manipulation active:scale-95 ${
            activeMobileTab === 'library'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Music className="w-4 h-4 text-emerald-400" />
          <span>Pustaka Lagu</span>
        </button>
      </div>

      {/* Main Dashboard Layout */}
      <main id="dashboard-main-layout" className="flex-1 p-3 md:p-4 min-h-0 overflow-y-auto md:overflow-hidden">
        {/* Mobile View: Render active tab */}
        <div className="block md:hidden h-full pb-20">
          {activeMobileTab === 'live' && (
            <LiveControlPanel
              selectedSong={selectedSong}
              selectedSetlistItem={selectedSetlistItem}
              liveState={liveState}
              onSendLyricChunk={handleSendLyricChunk}
              onSendAnnouncement={handleSendAnnouncement}
              onClearScreen={handleClearScreen}
              onNextChunk={handleNextChunk}
              currentSetlist={currentSetlist}
              onSelectSetlistItem={handleSelectSetlistItem}
              onSelectSongDirect={(song) => {
                setSelectedSong(song);
                setSelectedSetlistItem(null);
              }}
              allSongs={songs}
              isModalOpen={isDisplaySettingsModalOpen || isSongModalOpen || isUserMgmtModalOpen}
            />
          )}

          {activeMobileTab === 'setlist' && (
            <SetlistRundown
              setlists={setlists}
              currentSetlist={currentSetlist}
              selectedSetlistItemId={selectedSetlistItem?.id || null}
              onSelectSetlist={handleSelectSetlist}
              onCreateNewSetlist={handleCreateNewSetlist}
              onSaveCurrentSetlist={handleSaveCurrentSetlist}
              onSelectSetlistItem={(item) => {
                handleSelectSetlistItem(item);
                // Optionally switch to live control panel on select
                setActiveMobileTab('live');
              }}
              onRemoveItem={handleRemoveSetlistItem}
              onMoveItem={handleMoveSetlistItem}
              onAddAnnouncementToSetlist={handleAddAnnouncementToSetlist}
            />
          )}

          {activeMobileTab === 'library' && (
            <SongLibrary
              songs={songs}
              selectedSongId={selectedSong?.id || null}
              onSelectSong={(song) => {
                setSelectedSong(song);
                setSelectedSetlistItem(null);
                setActiveMobileTab('live');
              }}
              onAddSongToSetlist={handleAddSongToSetlist}
              onOpenAddModal={() => {
                setEditingSong(null);
                setIsSongModalOpen(true);
              }}
              onOpenEditModal={(song) => {
                setEditingSong(song);
                setIsSongModalOpen(true);
              }}
              onOpenSyncModal={() => setIsSyncSongModalOpen(true)}
            />
          )}
        </div>

        {/* Desktop View: Render 3-Column Grid */}
        <div className="hidden md:grid grid-cols-12 gap-4 h-full min-h-0">
          {/* Column 1: Song Library (Left - 3 Cols) */}
          <div className="col-span-3 h-full min-h-0">
            <SongLibrary
              songs={songs}
              selectedSongId={selectedSong?.id || null}
              onSelectSong={(song) => {
                setSelectedSong(song);
                setSelectedSetlistItem(null);
              }}
              onAddSongToSetlist={handleAddSongToSetlist}
              onOpenAddModal={() => {
                setEditingSong(null);
                setIsSongModalOpen(true);
              }}
              onOpenEditModal={(song) => {
                setEditingSong(song);
                setIsSongModalOpen(true);
              }}
              onOpenSyncModal={() => setIsSyncSongModalOpen(true)}
            />
          </div>

          {/* Column 2: Setlist Rundown (Center - 4 Cols) */}
          <div className="col-span-4 h-full min-h-0">
            <SetlistRundown
              setlists={setlists}
              currentSetlist={currentSetlist}
              selectedSetlistItemId={selectedSetlistItem?.id || null}
              onSelectSetlist={handleSelectSetlist}
              onCreateNewSetlist={handleCreateNewSetlist}
              onSaveCurrentSetlist={handleSaveCurrentSetlist}
              onSelectSetlistItem={handleSelectSetlistItem}
              onRemoveItem={handleRemoveSetlistItem}
              onMoveItem={handleMoveSetlistItem}
              onAddAnnouncementToSetlist={handleAddAnnouncementToSetlist}
            />
          </div>

          {/* Column 3: Live Control Panel (Right - 5 Cols) */}
          <div id="column-live-control-panel" className="col-span-5 h-full min-h-0">
            <LiveControlPanel
              selectedSong={selectedSong}
              selectedSetlistItem={selectedSetlistItem}
              liveState={liveState}
              onSendLyricChunk={handleSendLyricChunk}
              onSendAnnouncement={handleSendAnnouncement}
              onClearScreen={handleClearScreen}
              onNextChunk={handleNextChunk}
              currentSetlist={currentSetlist}
              onSelectSetlistItem={handleSelectSetlistItem}
              onSelectSongDirect={(song) => {
                setSelectedSong(song);
                setSelectedSetlistItem(null);
              }}
              allSongs={songs}
            />
          </div>
        </div>
      </main>

      {/* Song Modal */}
      <SongModal
        isOpen={isSongModalOpen}
        song={editingSong}
        onClose={() => {
          setIsSongModalOpen(false);
          setEditingSong(null);
        }}
        onSave={handleSaveSong}
        onDelete={handleDeleteSong}
      />

      {/* Sync Song from VPS Modal */}
      <SyncSongModal
        isOpen={isSyncSongModalOpen}
        onClose={() => setIsSyncSongModalOpen(false)}
        onSyncSuccess={loadData}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserMgmtModalOpen}
        currentUser={user}
        onClose={() => setIsUserMgmtModalOpen(false)}
      />

      {/* Display Settings Customization Modal */}
      {isDisplaySettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-6xl my-auto">
            <DisplaySettingsPanel onClose={() => setIsDisplaySettingsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

