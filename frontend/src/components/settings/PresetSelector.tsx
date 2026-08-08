import React from 'react';
import { DisplaySetting } from '../../types/DisplaySetting';
import { Sparkles, CheckCircle2, Eye, Plus, Trash2, Radio, Save, Send, Loader2 } from 'lucide-react';

interface PresetSelectorProps {
  presets: DisplaySetting[];
  liveSettings: DisplaySetting;
  previewSettings: DisplaySetting;
  selectedPresetId: number | null;
  isSaving: boolean;
  isActivating: boolean;
  onSelectPresetForPreview: (preset: DisplaySetting) => void;
  onSaveCurrentPresetChanges: () => Promise<any>;
  onActivateToLive: (id: number) => void;
  onOpenSaveModal: () => void;
  onDeletePreset: (id: number) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  liveSettings,
  previewSettings,
  selectedPresetId,
  isSaving,
  isActivating,
  onSelectPresetForPreview,
  onSaveCurrentPresetChanges,
  onActivateToLive,
  onOpenSaveModal,
  onDeletePreset,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-[#18181b] p-4 rounded-xl border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Preset Profiles Theme</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Changes to Current Preset */}
          {selectedPresetId && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveCurrentPresetChanges}
              className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-medium transition disabled:opacity-50"
              title="Save changes to existing selected preset"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes to Preset
            </button>
          )}

          {/* Save as New Preset */}
          <button
            type="button"
            onClick={onOpenSaveModal}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Save as New Preset...
          </button>
        </div>
      </div>

      {/* Presets List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-1">
        {presets
          .filter((preset, idx, self) => self.findIndex((p) => p.id === preset.id) === idx)
          .map((preset) => {
            const isLive = preset.is_active || preset.id === liveSettings.id;
            const isPreviewing = preset.id === previewSettings.id || preset.id === selectedPresetId;



          return (
            <div
              key={preset.id}
              onClick={() => onSelectPresetForPreview(preset)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                isPreviewing
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                  : isLive
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>{preset.name}</span>
                    {isLive && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-extrabold flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> LIVE ON AIR
                      </span>
                    )}
                    {isPreviewing && !isLive && (
                      <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30 font-bold flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-400" /> PREVIEWING
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-white/40 font-mono mt-1">
                    Font: {preset.font_size}px | Color: {preset.text_color}
                  </p>
                </div>

                {!isLive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                    className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition"
                    title="Delete Preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPresetForPreview(preset);
                  }}
                  className={`text-[11px] font-medium transition ${
                    isPreviewing ? 'text-blue-400 font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {isPreviewing ? '👁️ Viewing in Sandbox' : 'Inspect Preview'}
                </button>

                {!isLive ? (
                  <button
                    type="button"
                    disabled={isActivating}
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivateToLive(preset.id);
                    }}
                    className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50 shadow-sm"
                  >
                    {isActivating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" /> Apply to OBS Live
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Broadcasting Live
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
