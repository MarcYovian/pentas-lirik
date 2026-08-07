import React, { useState, useEffect } from 'react';
import { Play, Square, MessageSquare, Music, Sparkles, Send, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Song, SetlistItem, LiveState, LyricChunk } from '../types';

interface LiveControlPanelProps {
  selectedSong: Song | null;
  selectedSetlistItem: SetlistItem | null;
  liveState: LiveState;
  onSendLyricChunk: (chunk: LyricChunk, songTitle: string, songId: number) => void;
  onSendAnnouncement: (content: string) => void;
  onClearScreen: () => void;
  onNextChunk: () => void;
}

export const LiveControlPanel: React.FC<LiveControlPanelProps> = ({
  selectedSong,
  selectedSetlistItem,
  liveState,
  onSendLyricChunk,
  onSendAnnouncement,
  onClearScreen,
  onNextChunk,
}) => {
  const [customAnnouncementText, setCustomAnnouncementText] = useState('');
  const [showPreview, setShowPreview] = useState(true);

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

  // Keyboard Shortcuts Handler (Spacebar = Next, Escape = Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing inside an input or textarea
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

  return (
    <div id="column-live-control-panel" className="flex flex-col h-full bg-[#0F0F0F] overflow-hidden">
      {/* Column Header */}
      <div id="live-panel-header" className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          <h2 className="font-bold text-xs text-white uppercase tracking-wider font-display">Live Control Panel</h2>
        </div>

        {/* Preview Toggle & Shortcut Legend */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-preview-mode-btn"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showPreview
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
            title="Toggle Next Chunk Preview"
          >
            {showPreview ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-white/40" />}
            <span>Preview {showPreview ? 'ON' : 'OFF'}</span>
            <span className={`w-2 h-2 rounded-full ${showPreview ? 'bg-blue-400' : 'bg-white/20'}`} />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-[10px] text-white/50">
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
              <kbd className="mono text-blue-400 font-bold">Space</kbd> Next
            </span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
              <kbd className="mono text-red-400 font-bold">Esc</kbd> Clear
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Live Status & Master Clear Screen Action Bar */}
      <div id="live-status-action-bar" className="p-3 border-b border-white/10 bg-[#121212] space-y-3 shrink-0">
        {/* On Air Status Indicator Box */}
        <div className={`p-3 rounded-lg border flex items-center justify-between transition ${
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
                  <span className="text-white/40 italic">No text displayed (Transparent Screen)</span>
                )}
              </div>
            </div>
          </div>

          {/* Master Clear Screen Button */}
          <button
            id="btn-master-clear-screen"
            onClick={onClearScreen}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0 ${
              isLiveActive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/10'
            }`}
            title="Clear all text from live stream (Shortcut: Escape)"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Clear Screen</span>
            <kbd className="ml-1 bg-black/40 px-1.5 py-0.5 rounded text-[10px] mono">Esc</kbd>
          </button>
        </div>

        {/* Live Preview Box for Next Chunk when Preview Toggle is ON */}
        {showPreview && selectedSong && selectedSong.lyrics.length > 0 && (
          <div id="next-chunk-preview-panel" className="p-3 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-blue-950/20 border border-blue-500/30 rounded-lg shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 font-display">
                  Next Chunk Preview
                </span>
                {nextChunk ? (
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 mono text-[10px] font-bold rounded">
                    {nextChunk.label}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 mono text-[10px] font-bold rounded">
                    [END OF SONG - CLEAR SCREEN NEXT]
                  </span>
                )}
              </div>
              {nextChunk && (
                <button
                  id="btn-push-preview-live"
                  onClick={() => onSendLyricChunk(nextChunk, selectedSong.title, selectedSong.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-md shadow transition"
                  title="Push this previewed chunk directly to OBS live screen"
                >
                  <Send className="w-3 h-3" />
                  <span>Push Live</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {nextChunk ? (
              <pre className="font-sans text-xs md:text-sm text-white/90 bg-[#0F0F0F]/80 p-2.5 rounded border border-white/10 whitespace-pre-wrap leading-relaxed">
                {nextChunk.content}
              </pre>
            ) : (
              <p className="text-xs text-white/40 italic p-1">
                At the end of lyrics. Pressing Next or Spacebar will clear the live display.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area: Lyric Chunks or Announcement Item */}
      <div id="live-chunks-scroll-area" className="flex-1 overflow-y-auto p-3 space-y-4">
        {selectedSong ? (
          <div>
            {/* Active Song Banner */}
            <div id="active-song-banner" className="mb-3 p-3 bg-white/[0.03] border border-white/10 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
                  Selected Song Rundown
                </span>
                <h3 className="font-bold text-sm text-white">{selectedSong.title}</h3>
                <p className="text-xs text-white/60">{selectedSong.artist}</p>
              </div>

              {/* Quick Next Button */}
              <button
                id="btn-trigger-next-chunk"
                onClick={onNextChunk}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition"
                title="Advance to Next Lyric Chunk (Shortcut: Spacebar)"
              >
                <span>Next</span>
                <kbd className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] mono">Space</kbd>
              </button>
            </div>

            {/* Lyric Chunks Grid / List */}
            <div id="lyric-chunks-list" className="space-y-3">
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
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Send Announcement Live</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-16 px-4 text-white/40 text-xs italic bg-white/[0.01] rounded-xl border border-white/5">
            <Music className="w-8 h-8 text-white/20 mx-auto mb-2" />
            Select a song from the Event Rundown in Column 2 to display its live lyric chunks here.
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
                placeholder="Type temporary live message (e.g. Please join us for coffee after service)..."
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
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Live Overlay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
