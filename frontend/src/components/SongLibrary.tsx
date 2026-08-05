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
          <h2 className="font-bold text-xs text-white uppercase tracking-wider font-display">Song Library</h2>
          <span className="bg-white/10 text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/10 mono">
            {songs.length}
          </span>
        </div>
        <button
          id="btn-add-new-song"
          onClick={onOpenAddModal}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
          title="Add New Song to Library"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Song</span>
        </button>
      </div>

      {/* Search Bar */}
      <div id="song-search-box" className="p-3 border-b border-white/10 bg-[#0F0F0F] shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            id="song-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or artist..."
            className="w-full bg-white/5 text-white placeholder-white/30 text-xs pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition"
          />
        </div>
      </div>

      {/* Song List */}
      <div id="song-list-container" className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 px-4 text-white/40 text-xs italic">
            {searchTerm ? `No songs found matching "${searchTerm}"` : 'No songs in library. Click "New Song" to create one.'}
          </div>
        ) : (
          filteredSongs.map((song) => {
            const isSelected = selectedSongId === song.id;
            return (
              <div
                id={`song-card-${song.id}`}
                key={song.id}
                onClick={() => onSelectSong(song)}
                className={`group relative p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-md'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`font-semibold text-xs truncate ${isSelected ? 'text-blue-300' : 'text-white/90'}`}>
                      {song.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">{song.artist || 'Unknown Artist'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-white/5 text-white/60 px-1.5 py-0.5 rounded border border-white/10 mono">
                      {song.lyrics.length} {song.lyrics.length === 1 ? 'chunk' : 'chunks'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                  <button
                    id={`btn-edit-song-${song.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditModal(song);
                    }}
                    className="p-1.5 hover:bg-white/10 text-white/40 hover:text-white rounded transition"
                    title="Edit Song"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-add-to-rundown-${song.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSongToSetlist(song);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded text-[11px] font-semibold transition"
                    title="Add song to current setlist rundown"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Rundown</span>
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
