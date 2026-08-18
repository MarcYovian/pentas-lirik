import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Music, Eye } from 'lucide-react';
import { Song, LyricChunk } from '../types';

interface SongModalProps {
  isOpen: boolean;
  song?: Song | null;
  onClose: () => void;
  onSave: (songData: { title: string; artist: string; lyrics_raw: string }) => void;
  onDelete?: (songId: number) => void;
}

export const SongModal: React.FC<SongModalProps> = ({
  isOpen,
  song,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyricsRaw, setLyricsRaw] = useState('');
  const [parsedChunks, setParsedChunks] = useState<LyricChunk[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      const initialLyrics = song.lyrics_raw || (
        song.lyrics && song.lyrics.length > 0
          ? song.lyrics
              .map((chunk) => {
                const label = chunk.label ? (chunk.label.startsWith('[') ? chunk.label : `[${chunk.label}]`) : '[VERSE]';
                return `${label}\n${chunk.content}`;
              })
              .join('\n\n')
          : ''
      );
      setLyricsRaw(initialLyrics);
    } else {
      setTitle('');
      setArtist('');
      setLyricsRaw('');
    }
    setConfirmDelete(false);
  }, [song, isOpen]);

  // Real-time lyric chunking preview
  useEffect(() => {
    if (!lyricsRaw.trim()) {
      setParsedChunks([]);
      return;
    }

    const lines = lyricsRaw.split('\n');
    const chunks: LyricChunk[] = [];
    let currentLabel = '[VERSE]';
    let currentLines: string[] = [];
    let orderCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const tagMatch = line.match(/^\[(.*)\]$/);

      if (tagMatch) {
        if (currentLines.length > 0) {
          const content = currentLines.join('\n').trim();
          if (content) {
            chunks.push({
              id: orderCounter,
              label: currentLabel,
              content,
              order: orderCounter++,
            });
          }
          currentLines = [];
        }
        currentLabel = `[${tagMatch[1].toUpperCase()}]`;
      } else {
        currentLines.push(lines[i]);
      }
    }

    if (currentLines.length > 0) {
      const content = currentLines.join('\n').trim();
      if (content) {
        chunks.push({
          id: orderCounter,
          label: currentLabel,
          content,
          order: orderCounter++,
        });
      }
    }

    setParsedChunks(chunks);
  }, [lyricsRaw]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), artist: artist.trim(), lyrics_raw: lyricsRaw });
    onClose();
  };

  return (
    <div id="song-modal-overlay" className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div id="song-modal-content" className="bg-[#121212] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div id="song-modal-header" className="px-4 md:px-6 py-3.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm md:text-base font-bold text-white font-display">
              {song ? 'Edit Lagu & Lirik' : 'Tambah Lagu Baru'}
            </h2>
          </div>
          <button
            id="close-song-modal-btn"
            onClick={onClose}
            className="text-white/40 hover:text-white transition p-2 rounded-xl hover:bg-white/10 min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            {/* Title & Artist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Judul Lagu <span className="text-red-400">*</span>
                </label>
                <input
                  id="song-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="misal: Lingkupiku (Hide Me Now)"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none transition min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Artis / Pencipta
                </label>
                <input
                  id="song-artist-input"
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="misal: Reuben Morgan / Hillsong"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none transition min-h-[44px]"
                />
              </div>
            </div>

            {/* Lyrics Input & Parsing Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Raw Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Teks Lirik (Gunakan Tag [VERSE], [CHORUS])
                  </label>
                </div>
                <textarea
                  id="song-lyrics-textarea"
                  rows={10}
                  value={lyricsRaw}
                  onChange={(e) => setLyricsRaw(e.target.value)}
                  placeholder={`[VERSE 1]\nLingkupiku dengan sayap-Mu\nNaungiku dalam kuasa-Mu\n\n[CHORUS]\nDi saat badai bergelora\nKu akan terbang bersama-Mu`}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white mono text-xs rounded-xl p-3.5 outline-none transition leading-relaxed resize-none"
                />
                <p className="text-[11px] text-white/40 mt-1.5">
                  Tips: Berikan tag pembatas seperti <code className="text-blue-300">[VERSE 1]</code> atau <code className="text-blue-300">[CHORUS]</code> untuk memisahkan bait tayang.
                </p>
              </div>

              {/* Chunk Preview */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Pratinjau Bait Live ({parsedChunks.length} bait)
                  </label>
                </div>
                <div id="lyrics-parsed-preview" className="flex-1 bg-[#0F0F0F] border border-white/10 rounded-xl p-3 overflow-y-auto max-h-[260px] space-y-2.5">
                  {parsedChunks.length === 0 ? (
                    <div className="text-center py-10 text-white/40 text-xs italic">
                      Ketik lirik dengan tag siku di sebelah kiri untuk melihat pratinjau bait...
                    </div>
                  ) : (
                    parsedChunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="bg-white/[0.02] border border-white/10 rounded-lg p-2.5 text-xs text-white/80"
                      >
                        <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 mono text-[10px] font-bold rounded mb-1">
                          {chunk.label}
                        </span>
                        <pre className="font-sans text-xs text-white whitespace-pre-wrap leading-snug">
                          {chunk.content}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Modal Actions Footer */}
          <div id="song-modal-footer" className="p-3.5 md:p-4 bg-[#0D0D0D] border-t border-white/10 flex items-center justify-between shrink-0">
            {song && onDelete ? (
              <div>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400 hidden sm:inline">Hapus lagu ini?</span>
                    <button
                      id="confirm-delete-song-btn"
                      type="button"
                      onClick={() => {
                        onDelete(song.id);
                        onClose();
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition min-h-[38px]"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl transition min-h-[38px]"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    id="delete-song-btn"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl transition min-h-[38px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                id="cancel-song-modal-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-xl transition min-h-[40px]"
              >
                Batal
              </button>
              <button
                id="save-song-btn"
                type="submit"
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition min-h-[40px] touch-manipulation active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{song ? 'Update Lagu' : 'Simpan Lagu'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
