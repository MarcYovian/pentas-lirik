import React, { useState, useEffect, useCallback } from 'react';
import { Song, Setlist, SetlistItem, User, LiveState, LyricChunk, WsMessage } from './types';
import { Navbar } from './components/Navbar';
import { SongLibrary } from './components/SongLibrary';
import { SetlistRundown } from './components/SetlistRundown';
import { LiveControlPanel } from './components/LiveControlPanel';
import { SongModal } from './components/SongModal';
import { UserManagementModal } from './components/UserManagementModal';
import { OBSDisplay } from './components/OBSDisplay';
import { LoginView } from './components/LoginView';

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

  // Modal States
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isUserMgmtModalOpen, setIsUserMgmtModalOpen] = useState(false);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [songsRes, setlistsRes, liveStateRes] = await Promise.all([
        fetch('/api/v1/songs').then((r) => r.json()),
        fetch('/api/v1/setlists').then((r) => r.json()),
        fetch('/api/v1/live/state').then((r) => r.json()),
      ]);

      if (songsRes.data) setSongs(songsRes.data);
      if (setlistsRes.data) {
        setSetlists(setlistsRes.data);
        if (setlistsRes.data.length > 0 && !currentSetlist) {
          setCurrentSetlist(setlistsRes.data[0]);
        }
      }
      if (liveStateRes.data) setLiveState(liveStateRes.data);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  }, [currentSetlist]);

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
      };

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          if (
            message.type === 'INIT_STATE' ||
            message.type === 'display:update' ||
            message.type === 'display:clear'
          ) {
            setLiveState(message.payload);
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
    localStorage.setItem('pentaslirik_user', JSON.stringify(loggedInUser));
    localStorage.setItem('pentaslirik_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pentaslirik_user');
    localStorage.removeItem('pentaslirik_token');
  };

  // Song Library Handlers
  const handleSaveSong = async (songData: { title: string; artist: string; lyrics_raw: string }) => {
    try {
      if (editingSong) {
        const res = await fetch(`/api/v1/songs/${editingSong.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(songData),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setSongs((prev) => prev.map((s) => (s.id === json.data.id ? json.data : s)));
          if (selectedSong?.id === json.data.id) {
            setSelectedSong(json.data);
          }
        }
      } else {
        const res = await fetch('/api/v1/songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(songData),
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
      const res = await fetch(`/api/v1/songs/${songId}`, { method: 'DELETE' });
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

  const handleSaveCurrentSetlist = async (name: string, items: SetlistItem[]) => {
    if (!currentSetlist) return;

    try {
      const res = await fetch(`/api/v1/setlists/${currentSetlist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, items }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSetlists((prev) => prev.map((s) => (s.id === json.data.id ? json.data : s)));
        setCurrentSetlist(json.data);
      } else {
        // Fallback for new unsaved setlists
        const createRes = await fetch('/api/v1/setlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, items }),
        });
        const createJson = await createRes.json();
        if (createRes.ok && createJson.data) {
          setSetlists((prev) => [createJson.data, ...prev.filter((s) => s.id !== currentSetlist.id)]);
          setCurrentSetlist(createJson.data);
        }
      }
    } catch (err) {
      console.error('Failed to save setlist:', err);
    }
  };

  const handleAddSongToSetlist = (song: Song) => {
    if (!currentSetlist) return;

    const newItem: SetlistItem = {
      id: Date.now(),
      type: 'song',
      song_id: song.id,
      song_title: song.title,
      artist: song.artist,
      order: currentSetlist.items.length + 1,
    };

    const updatedSetlist: Setlist = {
      ...currentSetlist,
      items: [...currentSetlist.items, newItem],
    };

    setCurrentSetlist(updatedSetlist);
    setSetlists((prev) => prev.map((s) => (s.id === updatedSetlist.id ? updatedSetlist : s)));
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
      await fetch('/api/v1/live/send-lyric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lyric',
          content: chunk.content,
          song_id: songId,
          song_title: songTitle,
          lyric_chunk_id: chunk.id,
          label: chunk.label,
        }),
      });
    } catch (err) {
      console.error('Error sending lyric chunk live:', err);
    }
  };

  const handleSendAnnouncement = async (content: string) => {
    try {
      await fetch('/api/v1/live/send-lyric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'announcement',
          content,
          song_id: null,
          lyric_chunk_id: null,
          label: '[ANNOUNCEMENT]',
        }),
      });
    } catch (err) {
      console.error('Error sending announcement live:', err);
    }
  };

  const handleClearScreen = async () => {
    try {
      await fetch('/api/v1/live/clear', {
        method: 'POST',
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
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="app-root-container" className="flex flex-col h-screen overflow-hidden bg-[#0F0F0F]">
      {/* Navbar Header */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenUserManagement={() => setIsUserMgmtModalOpen(true)}
        isConnected={isConnected}
        liveStateActive={liveState.type !== 'clear' && !!liveState.content}
      />

      {/* Main 3-Column Operator Dashboard Grid */}
      <main id="operator-dashboard-grid" className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
        {/* Column 1: Song Library (Left - 3 Cols) */}
        <div className="md:col-span-3 h-full min-h-0">
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
          />
        </div>

        {/* Column 2: Setlist Rundown (Center - 4 Cols) */}
        <div className="md:col-span-4 h-full min-h-0">
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
        <div className="md:col-span-5 h-full min-h-0">
          <LiveControlPanel
            selectedSong={selectedSong}
            selectedSetlistItem={selectedSetlistItem}
            liveState={liveState}
            onSendLyricChunk={handleSendLyricChunk}
            onSendAnnouncement={handleSendAnnouncement}
            onClearScreen={handleClearScreen}
            onNextChunk={handleNextChunk}
          />
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

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserMgmtModalOpen}
        currentUser={user}
        onClose={() => setIsUserMgmtModalOpen(false)}
      />
    </div>
  );
}
