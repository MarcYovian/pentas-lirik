import React, { useState, useEffect } from 'react';
import { Play, Square, MessageSquare, Music, Sparkles, Send, Eye, EyeOff, ArrowRight, ListMusic, ChevronDown } from 'lucide-react';
import { Song, Setlist, SetlistItem, LiveState, LyricChunk } from '../types';
import { SetlistQuickDrawer } from './mobile/SetlistQuickDrawer';
import { MobileStanzaCard } from './mobile/MobileStanzaCard';
import { MobileStepper } from './mobile/MobileStepper';

interface LiveControlPanelProps {
  selectedSong: Song | null;
  selectedSetlistItem: SetlistItem | null;
  liveState: LiveState;
  onSendLyricChunk: (chunk: LyricChunk, songTitle: string, songId: number) => void;
  onSendAnnouncement: (content: string) => void;
  onClearScreen: () => void;
  onNextChunk: () => void;
  currentSetlist?: Setlist | null;
  onSelectSetlistItem?: (item: SetlistItem) => void;
  onSelectSongDirect?: (song: Song) => void;
  allSongs?: Song[];
  isModalOpen?: boolean;
}

export const LiveControlPanel: React.FC<LiveControlPanelProps> = ({
  selectedSong,
  selectedSetlistItem,
  liveState,
  onSendLyricChunk,
  onSendAnnouncement,
  onClearScreen,
  onNextChunk,
  currentSetlist = null,
  onSelectSetlistItem,
  onSelectSongDirect,
  allSongs = [],
  isModalOpen = false,
}) => {

  const [customAnnouncementText, setCustomAnnouncementText] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isSetlistDrawerOpen, setIsSetlistDrawerOpen] = useState(false);

  // Compute current live chunk index and upcoming next chunk
  const currentLiveIndex = selectedSong
    ? selectedSong.lyrics.findIndex(
        (c) =>
          liveState.type === 'lyric' &&
          liveState.song_id === selectedSong.id &&
          liveState.lyric_chunk_id === c.id
      )
    : -1;

  const nextChunk =
    selectedSong && selectedSong.lyrics && selectedSong.lyrics.length > 0
      ? currentLiveIndex === -1
        ? selectedSong.lyrics[0]
        : currentLiveIndex < selectedSong.lyrics.length - 1
        ? selectedSong.lyrics[currentLiveIndex + 1]
        : null
      : null;

  const handlePrevChunk = () => {
    if (!selectedSong || !selectedSong.lyrics || selectedSong.lyrics.length === 0) return;
    if (currentLiveIndex > 0) {
      const prevChunk = selectedSong.lyrics[currentLiveIndex - 1];
      onSendLyricChunk(prevChunk, selectedSong.title, selectedSong.id);
    }
  };

  // Auto-scroll active stanza card into view on mobile
  useEffect(() => {
    if (liveState.type === 'lyric' && liveState.lyric_chunk_id) {
      const el = document.getElementById(`mobile-stanza-card-${liveState.lyric_chunk_id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [liveState]);

  // Keyboard Shortcuts Handler (Spacebar = Next, Escape = Clear)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onNextChunk();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClearScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextChunk, onClearScreen]);

  const handleCustomAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAnnouncementText.trim()) return;
    onSendAnnouncement(customAnnouncementText.trim());
  };

  const isLiveActive = liveState.type !== 'clear' && !!liveState.content;

  // Active setlist song index
  const activeSetlistIndex = currentSetlist?.items?.findIndex(
    (item) =>
      item.id === selectedSetlistItem?.id ||
      (item.song_id && item.song_id === selectedSong?.id)
  ) ?? -1;

  return (
    <div id="live-control-panel-inner" className="flex flex-col h-full bg-[#0F0F0F] overflow-hidden">
      {/* Column Header (Desktop Only) */}
      <div id="live-panel-header" className="hidden md:flex p-3 border-b border-white/10 bg-white/[0.02] items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          <h2 className="font-bold text-xs text-white uppercase tracking-wider font-display">Live Control Panel</h2>
        </div>

        {/* Preview Toggle & Shortcut Legend */}
        <div className="flex items-center gap-2.5">
          <button
            id="toggle-preview-mode-btn"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition min-h-[36px] touch-manipulation ${
              showPreview
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
            title="Toggle Next Chunk Preview"
          >
            {showPreview ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-white/40" />}
            <span>Preview {showPreview ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
              <kbd className="mono text-blue-400 font-bold">Space</kbd> Next
            </span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
              <kbd className="mono text-red-400 font-bold">Esc</kbd> Clear
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Streamlined Control Header (Visible on mobile < md) */}
      <div id="mobile-control-header" className="p-2.5 bg-slate-900/90 border-b border-slate-800 space-y-2 md:hidden shrink-0">
        {/* Setlist Quick Selector Button */}
        <button
          id="mobile-top-setlist-switcher-pill"
          onClick={() => setIsSetlistDrawerOpen(true)}
          className="w-full flex items-center justify-between p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold text-xs transition shadow-md min-h-[44px] touch-manipulation active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ListMusic className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0 text-left">
              <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                {currentSetlist ? currentSetlist.title : 'Setlist Active'}
              </div>
              <div className="text-xs font-bold text-white truncate">
                {selectedSong
                  ? `🎵 #${activeSetlistIndex >= 0 ? activeSetlistIndex + 1 : '?'}: ${selectedSong.title}`
                  : selectedSetlistItem?.type === 'announcement'
                  ? `📢 ${selectedSetlistItem.content}`
                  : 'Pilih Lagu dari Setlist...'}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />
        </button>

        {/* Compact Live Status & Clear Screen Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLiveActive ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {isLiveActive ? (
                <>
                  <span className="text-red-400 font-bold mono mr-1">{liveState.label || 'LIVE'}</span>
                  "{liveState.content}"
                </>
              ) : (
                <span className="text-slate-400 italic">Layar Clear</span>
              )}
            </span>
          </div>

          <button
            onClick={onClearScreen}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
              isLiveActive ? 'bg-red-600 text-white shadow-md shadow-red-900/40 animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Clear</span>
          </button>
        </div>

        {/* Mobile Compact Next Chunk Preview */}
        {showPreview && selectedSong && nextChunk && (
          <div className="bg-slate-950/80 border border-blue-500/30 rounded-lg p-2 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold mono shrink-0">
                {nextChunk.label}
              </span>
              <span className="text-slate-300 truncate text-[11px]">
                {nextChunk.content.replace(/\n/g, ' ')}
              </span>
            </div>
            <button
              onClick={() => onSendLyricChunk(nextChunk, selectedSong.title, selectedSong.id)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] shrink-0 min-h-[30px]"
            >
              Push Live
            </button>
          </div>
        )}
      </div>

      {/* Real-time Live Status & Master Clear Screen Action Bar (Desktop Only) */}
      <div id="live-status-action-bar" className="hidden md:block p-3 border-b border-white/10 bg-[#121212] space-y-3 shrink-0">
        {/* On Air Status Indicator Box */}
        <div className={`p-3 rounded-xl border flex items-center justify-between transition ${
          isLiveActive
            ? 'bg-red-950/40 border-red-500/80 shadow-lg'
            : 'bg-white/[0.02] border-white/10'
        }`}>
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className={`w-3 h-3 rounded-full shrink-0 ${
              isLiveActive ? 'bg-red-500 animate-ping' : 'bg-white/20'
            }`} />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                {isLiveActive ? 'OBS Output: LIVE ON AIR' : 'OBS Output: CLEAR'}
              </div>
              <div className="text-xs font-semibold text-white truncate max-w-md">
                {isLiveActive ? (
                  <>
                    <span className="text-red-400 mono mr-1">{liveState.label || '[LIVE]'}</span>
                    "{liveState.content}"
                  </>
                ) : (
                  <span className="text-white/40 italic">Layar Kosong (Transparent Overlay)</span>
                )}
              </div>
            </div>
          </div>

          {/* Master Clear Screen Button */}
          <button
            id="btn-master-clear-screen"
            onClick={onClearScreen}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0 min-h-[44px] touch-manipulation active:scale-95 ${
              isLiveActive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/10'
            }`}
            title="Clear all text from live stream (Shortcut: Escape)"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Clear Screen</span>
          </button>
        </div>

        {/* Live Preview Box for Next Chunk when Preview Toggle is ON */}
        {showPreview && selectedSong && selectedSong.lyrics.length > 0 && (
          <div id="next-chunk-preview-panel" className="p-3 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-blue-950/20 border border-blue-500/30 rounded-xl shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 font-display truncate">
                  Next Chunk Preview
                </span>
                {nextChunk ? (
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 mono text-[10px] font-bold rounded shrink-0">
                    {nextChunk.label}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 mono text-[10px] font-bold rounded shrink-0">
                    [END]
                  </span>
                )}
              </div>
              {nextChunk && (
                <button
                  id="btn-push-preview-live"
                  onClick={() => onSendLyricChunk(nextChunk, selectedSong.title, selectedSong.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg shadow transition shrink-0 min-h-[36px] touch-manipulation"
                  title="Push this previewed chunk directly to OBS live screen"
                >
                  <Send className="w-3 h-3" />
                  <span>Push Live</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {nextChunk ? (
              <pre className="font-sans text-xs md:text-sm text-white/90 bg-[#0F0F0F]/80 p-2.5 rounded-lg border border-white/10 whitespace-pre-wrap leading-relaxed">
                {nextChunk.content}
              </pre>
            ) : (
              <p className="text-xs text-white/40 italic p-1">
                At the end of lyrics. Pressing Next will clear the live display.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area: Lyric Chunks or Announcement Item */}
      <div id="live-chunks-scroll-area" className="flex-1 overflow-y-auto p-3 space-y-4">
        {selectedSong ? (
          <div>
            {/* Active Song Banner (Desktop Only) */}
            <div id="active-song-banner" className="hidden md:flex mb-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                  Lagu Aktif Ditayangkan
                </span>
                <h3 className="font-bold text-sm md:text-base text-white">{selectedSong.title}</h3>
                <p className="text-xs text-slate-400">{selectedSong.artist}</p>
              </div>

              {/* Quick Next Button */}
              <button
                id="btn-trigger-next-chunk"
                onClick={onNextChunk}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition min-h-[40px] touch-manipulation active:scale-95"
                title="Advance to Next Lyric Chunk"
              >
                <span>Bait Berikutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile View: Dedicated Mobile Stanza Cards */}
            <div className="block md:hidden">
              {!selectedSong.lyrics || selectedSong.lyrics.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800">
                  Lagu ini belum memiliki lirik. Edit lagu untuk menambahkan lirik.
                </div>
              ) : (
                selectedSong.lyrics.map((chunk) => {
                  const isChunkLive =
                    liveState.type === 'lyric' &&
                    liveState.song_id === selectedSong.id &&
                    liveState.lyric_chunk_id === chunk.id;

                  const isNextChunk = showPreview && nextChunk?.id === chunk.id && !isChunkLive;

                  return (
                    <MobileStanzaCard
                      key={chunk.id}
                      chunk={chunk}
                      isLive={isChunkLive}
                      isNext={isNextChunk}
                      onSendLive={(c) => onSendLyricChunk(c, selectedSong.title, selectedSong.id)}
                    />
                  );
                })
              )}
            </div>

            {/* Desktop View: Standard Desktop Lyric Chunk List */}
            <div id="lyric-chunks-list-desktop" className="hidden md:block space-y-3">
              {!selectedSong.lyrics || selectedSong.lyrics.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs italic bg-white/[0.02] rounded-lg border border-white/10">
                  This song has no lyric chunks saved. Edit the song to add lyrics.
                </div>
              ) : (
                selectedSong.lyrics.map((chunk) => {
                  const isChunkLive =
                    liveState.type === 'lyric' &&
                    liveState.song_id === selectedSong.id &&
                    liveState.lyric_chunk_id === chunk.id;

                  const isNextChunk = showPreview && nextChunk?.id === chunk.id && !isChunkLive;

                  return (
                    <button
                      id={`lyric-chunk-btn-${chunk.id}`}
                      key={chunk.id}
                      onClick={() => onSendLyricChunk(chunk, selectedSong.title, selectedSong.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all transform duration-150 relative overflow-hidden group ${
                        isChunkLive
                          ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-950/60 ring-2 ring-red-400 font-bold scale-[1.01]'
                          : isNextChunk
                          ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/40 hover:border-amber-400'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-white/90 hover:border-blue-500/50'
                      }`}
                    >
                      {/* Chunk Header Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2.5 py-0.5 mono text-xs font-bold rounded uppercase tracking-wider ${
                            isChunkLive
                              ? 'bg-blue-500 text-white'
                              : isNextChunk
                              ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                              : 'bg-white/10 text-blue-300 border border-white/10'
                          }`}
                        >
                          {chunk.label}
                        </span>

                        {isChunkLive ? (
                          <span className="flex items-center gap-1 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            LIVE ON AIR
                          </span>
                        ) : isNextChunk ? (
                          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Eye className="w-3 h-3 text-amber-400" />
                            NEXT UP
                          </span>
                        ) : (
                          <span className="text-[11px] text-white/40 group-hover:text-blue-300 transition flex items-center gap-1">
                            <span>Click to Send Live</span>
                            <Send className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Lyric Text Lines */}
                      <pre className="font-sans text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed tracking-wide text-white">
                        {chunk.content}
                      </pre>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : selectedSetlistItem?.type === 'announcement' ? (
          <div className="p-6 bg-white/[0.03] border border-amber-500/40 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Announcement Item</h3>
            </div>
            <p className="text-sm text-amber-200 bg-[#0F0F0F] p-4 rounded-lg border border-white/10 whitespace-pre-wrap">
              {selectedSetlistItem.content}
            </p>
            <button
              id="btn-send-rundown-announcement"
              onClick={() => onSendAnnouncement(selectedSetlistItem.content || '')}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition min-h-[48px] touch-manipulation"
            >
              <Send className="w-4 h-4" />
              <span>Send Announcement Live</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-16 px-4 text-white/40 text-xs italic bg-white/[0.01] rounded-xl border border-white/5">
            <Music className="w-8 h-8 text-white/20 mx-auto mb-2" />
            Pilih lagu dari setlist untuk menayangkan lirik secara live di layar OBS.
          </div>
        )}

        {/* Custom Ad-Hoc Announcement Input Module */}
        <div id="custom-announcement-module" className="pt-4 border-t border-white/10">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs text-white uppercase tracking-wider font-display">
                  Quick Ad-Hoc Announcement
                </h3>
              </div>
              <span className="text-[10px] text-white/40">On-the-fly text overlay</span>
            </div>

            <form onSubmit={handleCustomAnnouncementSubmit} className="space-y-2">
              <textarea
                id="custom-announcement-textarea"
                rows={2}
                value={customAnnouncementText}
                onChange={(e) => setCustomAnnouncementText(e.target.value)}
                placeholder="Tulis pesan sementara (misal: Harap parkir mobil di area B)..."
                className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-400/50 text-white text-xs p-2.5 rounded-lg outline-none transition resize-none"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCustomAnnouncementText('')}
                  className="text-[11px] text-white/40 hover:text-white transition"
                >
                  Clear Text
                </button>
                <button
                  id="btn-send-custom-announcement"
                  type="submit"
                  disabled={!customAnnouncementText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow transition min-h-[40px] touch-manipulation"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Live Overlay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Setlist Quick Selector Drawer Modal */}
      <SetlistQuickDrawer
        isOpen={isSetlistDrawerOpen}
        onClose={() => setIsSetlistDrawerOpen(false)}
        currentSetlist={currentSetlist}
        selectedSetlistItemId={selectedSetlistItem?.id || null}
        selectedSongId={selectedSong?.id || null}
        onSelectSetlistItem={(item) => {
          if (onSelectSetlistItem) onSelectSetlistItem(item);
        }}
        onSelectSongDirect={onSelectSongDirect}
        allSongs={allSongs}
      />

      {/* Mobile Floating Thumb Stepper Action Bar */}
      <MobileStepper
        currentChunkIndex={currentLiveIndex}
        totalChunks={selectedSong?.lyrics?.length || 0}
        onNext={onNextChunk}
        onPrev={handlePrevChunk}
        onClear={onClearScreen}
        isLiveActive={isLiveActive}
        hasSelectedSong={!!selectedSong}
        isModalOpen={isModalOpen || isSetlistDrawerOpen}
      />
    </div>
  );
};

