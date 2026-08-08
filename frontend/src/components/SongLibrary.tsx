import React, { useState } from 'react';
import { Search, Plus, Music, Edit3, PlusCircle } from 'lucide-react';
import { Song } from '../types';

interface SongLibraryProps {
  songs: Song[];
  selectedSongId: number | null;
  onSelectSong: (song: Song) => void;
  onAddSongToSetlist: (song: Song) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (song: Song) => void;
}

export const SongLibrary: React.FC<SongLibraryProps> = ({
  songs,
  selectedSongId,
  onSelectSong,
  onAddSongToSetlist,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="column-song-library" className="flex flex-col h-full bg-[#121212] border-r border-white/10 overflow-hidden">
      {/* Column Header */}
      <div id="song-library-header" className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-blue-400" />
          <h2 className="font-bold text-xs text-white uppercase tracking-wider font-display">Pustaka Lagu</h2>
          <span className="bg-white/10 text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/10 mono">
            {songs.length}
          </span>
        </div>
        <button
          id="btn-add-new-song"
          onClick={onOpenAddModal}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition min-h-[36px] touch-manipulation active:scale-95"
          title="Add New Song to Library"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lagu</span>
        </button>
      </div>

      {/* Search Bar */}
      <div id="song-search-box" className="p-3 border-b border-white/10 bg-[#0F0F0F] shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
          <input
            id="song-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul lagu atau artis..."
            className="w-full bg-white/5 text-white placeholder-white/30 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-blue-500/50 outline-none transition min-h-[42px]"
          />
        </div>
      </div>

      {/* Song List Container */}
      <div id="song-list-container" className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 px-4 text-white/40 text-xs italic">
            {searchTerm ? `Lagu dengan kata kunci "${searchTerm}" tidak ditemukan.` : 'Pustaka lagu kosong. Klik "Tambah Lagu" untuk membuat lagu baru.'}
          </div>
        ) : (
          filteredSongs.map((song) => {
            const isSelected = selectedSongId === song.id;
            return (
              <div
                id={`song-card-${song.id}`}
                key={song.id}
                onClick={() => onSelectSong(song)}
                className={`group relative p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between min-h-[64px] touch-manipulation ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className={`font-semibold text-xs sm:text-sm truncate ${isSelected ? 'text-blue-300 font-bold' : 'text-white'}`}>
                    {song.title}
                  </h3>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">{song.artist || 'Artis Tidak Diketahui'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-md border border-white/10 mono">
                      {song.lyrics?.length || 0} bait lirik
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id={`btn-edit-song-${song.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditModal(song);
                    }}
                    className="p-2 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center border border-transparent hover:border-white/10"
                    title="Edit Song"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-add-to-rundown-${song.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSongToSetlist(song);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-semibold transition min-h-[36px] touch-manipulation active:scale-95"
                    title="Add song to current setlist rundown"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Setlist</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
