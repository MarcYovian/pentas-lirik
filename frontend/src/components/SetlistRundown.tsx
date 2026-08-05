import React, { useState } from 'react';
import { ListOrdered, Plus, Save, Trash2, ArrowUp, ArrowDown, Music, MessageSquare } from 'lucide-react';
import { Setlist, SetlistItem, Song } from '../types';

interface SetlistRundownProps {
  setlists: Setlist[];
  currentSetlist: Setlist | null;
  selectedSetlistItemId: number | null;
  onSelectSetlist: (setlist: Setlist) => void;
  onCreateNewSetlist: () => void;
  onSaveCurrentSetlist: (name: string, items: SetlistItem[]) => void;
  onSelectSetlistItem: (item: SetlistItem) => void;
  onRemoveItem: (itemId: number) => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onAddAnnouncementToSetlist: (content: string) => void;
}

export const SetlistRundown: React.FC<SetlistRundownProps> = ({
  setlists,
  currentSetlist,
  selectedSetlistItemId,
  onSelectSetlist,
  onCreateNewSetlist,
  onSaveCurrentSetlist,
  onSelectSetlistItem,
  onRemoveItem,
  onMoveItem,
  onAddAnnouncementToSetlist,
}) => {
  const [setlistName, setListName] = useState(currentSetlist?.name || 'New Event Rundown');
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Keep name in sync when currentSetlist changes
  React.useEffect(() => {
    if (currentSetlist) {
      setListName(currentSetlist.name);
    }
  }, [currentSetlist]);

  const handleSave = () => {
    if (!currentSetlist) return;
    onSaveCurrentSetlist(setlistName, currentSetlist.items);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    onAddAnnouncementToSetlist(newAnnouncementText.trim());
    setNewAnnouncementText('');
    setShowAnnouncementInput(false);
  };

  return (
    <div id="column-setlist-rundown" className="flex flex-col h-full bg-[#121212] border-r border-white/10 overflow-hidden">
      {/* Header */}
      <div id="setlist-header" className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-xs text-white uppercase tracking-wider font-display">Event Rundown</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="btn-new-setlist"
            onClick={onCreateNewSetlist}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold rounded-lg border border-white/10 transition"
            title="Create Empty Setlist"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            id="btn-save-setlist"
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow transition"
            title="Save Current Setlist"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Setlist Selector & Title Edit */}
      <div id="setlist-config-panel" className="p-3 border-b border-white/10 bg-[#0F0F0F] space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
            Setlist:
          </label>
          <select
            id="setlist-select-dropdown"
            value={currentSetlist?.id || ''}
            onChange={(e) => {
              const target = setlists.find((s) => s.id === parseInt(e.target.value, 10));
              if (target) onSelectSetlist(target);
            }}
            className="flex-1 bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-400/50 transition"
          >
            {setlists.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#121212] text-white">
                {s.name} ({s.items.length} items)
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            id="setlist-name-input"
            type="text"
            value={setlistName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Setlist Title..."
            className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg outline-none transition"
          />
        </div>
      </div>

      {/* Items Rundown List */}
      <div id="setlist-items-container" className="flex-1 overflow-y-auto p-2 space-y-2">
        {!currentSetlist || currentSetlist.items.length === 0 ? (
          <div className="text-center py-12 px-4 text-white/40 text-xs italic">
            Setlist is empty. Add songs from the Song Library on the left or add a custom announcement item below.
          </div>
        ) : (
          currentSetlist.items.map((item, index) => {
            const isSelected = selectedSetlistItemId === item.id;
            return (
              <div
                id={`setlist-item-${item.id}`}
                key={item.id}
                onClick={() => onSelectSetlistItem(item)}
                className={`group relative p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                }`}
              >
                {/* Index & Type Icon */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white/70 mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  {item.type === 'song' ? (
                    <Music className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-white/90'}`}>
                      {item.type === 'song' ? item.song_title : `Announcement: ${item.content}`}
                    </h4>
                    {item.type === 'song' && item.artist && (
                      <p className="text-[10px] text-white/40 truncate">{item.artist}</p>
                    )}
                  </div>
                </div>

                {/* Move & Delete Controls */}
                <div className="flex items-center gap-1">
                  <button
                    id={`btn-move-up-${item.id}`}
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveItem(index, 'up');
                    }}
                    className="p-1 hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20 rounded transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-move-down-${item.id}`}
                    disabled={index === currentSetlist.items.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveItem(index, 'down');
                    }}
                    className="p-1 hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20 rounded transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-remove-item-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition"
                    title="Remove from Setlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Announcement Item Footer */}
      <div id="setlist-footer-actions" className="p-2 border-t border-white/10 bg-[#0F0F0F] shrink-0">
        {showAnnouncementInput ? (
          <form onSubmit={handleAddAnnouncement} className="space-y-2">
            <input
              id="new-announcement-input"
              type="text"
              required
              value={newAnnouncementText}
              onChange={(e) => setNewAnnouncementText(e.target.value)}
              placeholder="e.g. Welcome & Announcements..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAnnouncementInput(false)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-[11px] rounded"
              >
                Cancel
              </button>
              <button
                id="btn-add-announcement-submit"
                type="submit"
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded"
              >
                Add to Rundown
              </button>
            </div>
          </form>
        ) : (
          <button
            id="btn-toggle-add-announcement"
            onClick={() => setShowAnnouncementInput(true)}
            className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-semibold rounded-lg border border-white/10 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Announcement Item</span>
          </button>
        )}
      </div>
    </div>
  );
};
