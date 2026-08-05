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
      setLyricsRaw(song.lyrics_raw || '');
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
    <div id="song-modal-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div id="song-modal-content" className="bg-[#121212] border border-white/10 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div id="song-modal-header" className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white font-display">
              {song ? 'Edit Song & Lyrics' : 'Add New Song'}
            </h2>
          </div>
          <button
            id="close-song-modal-btn"
            onClick={onClose}
            className="text-white/40 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
                Song Title <span className="text-red-400">*</span>
              </label>
              <input
                id="song-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Amazing Grace"
                className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
                Artist / Author
              </label>
              <input
                id="song-artist-input"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. John Newton / Chris Tomlin"
                className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Lyrics Input & Parsing Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Raw Lyrics (Use [VERSE 1], [CHORUS] Tags)
                </label>
              </div>
              <textarea
                id="song-lyrics-textarea"
                rows={12}
                value={lyricsRaw}
                onChange={(e) => setLyricsRaw(e.target.value)}
                placeholder={`[VERSE 1]\nFirst line of verse\nSecond line of verse\n\n[CHORUS]\nFirst line of chorus\nSecond line of chorus`}
                className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white mono text-xs rounded-lg p-3 outline-none transition leading-relaxed resize-none"
              />
              <p className="text-[11px] text-white/40 mt-1">
                Tip: Place tags like <code className="text-blue-300">[VERSE 1]</code> or <code className="text-blue-300">[CHORUS]</code> on their own line to auto-split into display chunks.
              </p>
            </div>

            {/* Chunk Preview */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <Eye className="w-4 h-4 text-blue-400" />
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Live Chunk Preview ({parsedChunks.length} chunks)
                </label>
              </div>
              <div id="lyrics-parsed-preview" className="flex-1 bg-[#0F0F0F] border border-white/10 rounded-lg p-3 overflow-y-auto max-h-[300px] space-y-3">
                {parsedChunks.length === 0 ? (
                  <div className="text-center py-12 text-white/40 text-xs italic">
                    Start typing lyrics with bracket tags to preview generated live chunks here...
                  </div>
                ) : (
                  parsedChunks.map((chunk, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.02] border border-white/10 rounded p-2.5 text-xs text-white/80"
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

          {/* Modal Actions */}
          <div id="song-modal-footer" className="pt-4 border-t border-white/10 flex items-center justify-between">
            {song && onDelete ? (
              <div>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">Confirm deletion?</span>
                    <button
                      id="confirm-delete-song-btn"
                      type="button"
                      onClick={() => {
                        onDelete(song.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    id="delete-song-btn"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Song
                  </button>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                id="cancel-song-modal-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="save-song-btn"
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg transition"
              >
                <Save className="w-4 h-4" />
                {song ? 'Update Song' : 'Save Song'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
