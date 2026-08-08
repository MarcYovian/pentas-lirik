import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Music, Check, ChevronRight, ListMusic } from 'lucide-react';
import { Setlist, SetlistItem, Song } from '../../types';

interface SetlistQuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSetlist: Setlist | null;
  selectedSetlistItemId: number | string | null;
  selectedSongId: number | null;
  onSelectSetlistItem: (item: SetlistItem) => void;
  onSelectSongDirect?: (song: Song) => void;
  allSongs?: Song[];
}

export const SetlistQuickDrawer: React.FC<SetlistQuickDrawerProps> = ({
  isOpen,
  onClose,
  currentSetlist,
  selectedSetlistItemId,
  selectedSongId,
  onSelectSetlistItem,
  onSelectSongDirect,
  allSongs = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const items = currentSetlist?.items || [];
  const filteredItems = items.filter((item) => {
    const titleMatch = item.song?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const artistMatch = item.song?.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || artistMatch || contentMatch;
  });

  // Non-setlist songs matching search query
  const nonSetlistSongs = searchQuery.trim()
    ? allSongs.filter(
        (s) =>
          !items.some((it) => it.song_id === s.id) &&
          (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.artist?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return createPortal(
    <div className="relative z-[100]">
      {/* Backdrop */}
      <div
        id="setlist-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-200"
      />

      {/* Bottom Sheet Drawer */}
      <div
        id="setlist-quick-drawer"
        className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-slate-900 border-t border-slate-800 rounded-t-2xl z-[101] p-4 pb-safe shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
      >
        {/* Drawer Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-white font-display">
                {currentSetlist ? currentSetlist.title : 'Setlist Rundown'}
              </h3>
              <p className="text-xs text-slate-400">Pilih lagu untuk ditayangkan di Mobile Control</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close setlist drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lagu di setlist atau pustaka..."
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition min-h-[48px]"
            />
          </div>
        </div>

        {/* Setlist Item List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Belum ada lagu dalam setlist ini.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected =
                item.id === selectedSetlistItemId ||
                (item.song_id && item.song_id === selectedSongId);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSetlistItem(item);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between min-h-[60px] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700/80 text-slate-300'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {item.type === 'announcement'
                            ? `Pengumuman: ${item.content}`
                            : item.song?.title || 'Lagu Tanpa Judul'}
                        </span>
                        {item.song?.key_signature && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded mono shrink-0">
                            Key: {item.song.key_signature}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {item.type === 'announcement'
                          ? 'Item Teks Pengumuman'
                          : item.song?.artist || 'Artis/Pencipta'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                        <Check className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </button>
              );
            })
          )}

          {/* Non-Setlist Search Results */}
          {nonSetlistSongs.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Lagu Lain di Pustaka
              </div>
              {nonSetlistSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => {
                    if (onSelectSongDirect) onSelectSongDirect(song);
                    onClose();
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-slate-200 flex items-center justify-between min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-sm text-white">{song.title}</div>
                      <div className="text-xs text-slate-400">{song.artist}</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Pilih Lagu
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
