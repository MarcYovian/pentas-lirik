import React, { useState } from 'react';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import { MiniOBSPreview } from './MiniOBSPreview';
import { PresetSelector } from './PresetSelector';
import { SavePresetModal } from './SavePresetModal';
import { ColorPickerInput } from './ColorPickerInput';
import {
  Sliders,
  Type,
  Maximize2,
  RotateCcw,
  AlertTriangle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  Box,
  Layers,
  X,
  Radio,
  Eye,
  Save,
  Send,
} from 'lucide-react';

interface DisplaySettingsPanelProps {
  onClose?: () => void;
}

export const DisplaySettingsPanel: React.FC<DisplaySettingsPanelProps> = ({ onClose }) => {
  const {
    liveSettings,
    previewSettings,
    presets,
    selectedPresetId,
    isLoading,
    isSaving,
    isActivating,
    error,
    updateSettings,
    selectPresetForPreview,
    saveCurrentPresetChanges,
    saveAsNewPreset,
    activatePresetToLive,
    deletePreset,
    resetToDefault,
  } = useDisplaySettings();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Check low contrast ratio warning
  const isLowContrast = (): boolean => {
    if (!previewSettings.show_background) return false;
    const txt = previewSettings.text_color.toUpperCase();
    const bg = previewSettings.background_color.toUpperCase();
    if (txt === '#FFFFFF' && (bg === '#FFFFFF' || bg.includes('255,255,255'))) return true;
    if (txt === '#000000' && (bg === '#000000' || bg.includes('0,0,0'))) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-white/50 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-400" /> Loading Display Customization...
      </div>
    );
  }

  const activePresetName = presets.find((p) => p.id === selectedPresetId)?.name || previewSettings.name || 'Preset Profile';
  const livePresetName = presets.find((p) => p.id === liveSettings.id)?.name || liveSettings.name || 'Default Style';

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#121212] text-white max-w-6xl mx-auto rounded-2xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>OBS Display Layer Customization</span>
              {isSaving && <span className="text-[10px] text-blue-400 font-mono animate-pulse">Saving...</span>}
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Broadcast Theme: <strong>{livePresetName}</strong>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-blue-300 font-medium">
                <Eye className="w-3 h-3 text-blue-400" /> Sandbox Previewing: <strong>{activePresetName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Apply to OBS Live */}
          {selectedPresetId && (
            <button
              type="button"
              disabled={isActivating}
              onClick={() => activatePresetToLive(selectedPresetId)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-lg disabled:opacity-50"
              title="Publish and broadcast this theme to OBS Live immediately"
            >
              {isActivating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Apply to OBS Live
            </button>
          )}

          {/* Save Changes to Preset */}
          {selectedPresetId && (
            <button
              type="button"
              disabled={isSaving}
              onClick={saveCurrentPresetChanges}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition disabled:opacity-50"
              title="Save changes to current selected preset"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Preset
            </button>
          )}

          <button
            type="button"
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-medium transition"
            title="Restore PentasLirik Default Styling"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Selector Grid */}
      <PresetSelector
        presets={presets}
        liveSettings={liveSettings}
        previewSettings={previewSettings}
        selectedPresetId={selectedPresetId}
        isSaving={isSaving}
        isActivating={isActivating}
        onSelectPresetForPreview={selectPresetForPreview}
        onSaveCurrentPresetChanges={saveCurrentPresetChanges}
        onActivateToLive={activatePresetToLive}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onDeletePreset={deletePreset}
      />

      {/* Mini OBS Live Preview Canvas */}
      <MiniOBSPreview settings={previewSettings} />

      {/* Low Contrast Warning Badge */}
      {isLowContrast() && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Low Contrast Warning:</strong> Text color and background color are very similar. Lyrics may be hard to read on live broadcast.
          </span>
        </div>
      )}

      {/* Form Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Typography Controls */}
        <div className="flex flex-col gap-4 bg-[#18181b] p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 border-b border-white/10 pb-2">
            <Type className="w-4 h-4" />
            <span>Typography & Scaling</span>
          </div>

          {/* Font Size Slider + Number Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-white/70">
              <label>Font Size</label>
              <span className="font-mono text-blue-400">{previewSettings.font_size}px</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="16"
                max="120"
                value={previewSettings.font_size}
                onChange={(e) => updateSettings({ font_size: parseInt(e.target.value) })}
                className="flex-1 accent-blue-500 cursor-pointer"
              />
              <input
                type="number"
                min="16"
                max="120"
                value={previewSettings.font_size}
                onChange={(e) => updateSettings({ font_size: parseInt(e.target.value) || 48 })}
                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Font Weight Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/70">Font Weight</label>
            <select
              value={previewSettings.font_weight}
              onChange={(e) => updateSettings({ font_weight: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="400" className="bg-[#18181b]">Normal (400)</option>
              <option value="600" className="bg-[#18181b]">Semi-Bold (600)</option>
              <option value="700" className="bg-[#18181b]">Bold (700)</option>
              <option value="800" className="bg-[#18181b]">Extra-Bold (800)</option>
            </select>
          </div>

          {/* Text Casing */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/70">Text Transform</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'UPPERCASE', val: 'uppercase' },
                { label: 'Capitalize', val: 'capitalize' },
                { label: 'As-Is', val: 'none' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => updateSettings({ text_transform: opt.val })}
                  className={`py-1.5 text-[11px] font-medium rounded-lg border transition ${
                    previewSettings.text_transform === opt.val
                      ? 'bg-blue-600 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/70">Text Alignment</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Left', val: 'left', icon: AlignLeft },
                { label: 'Center', val: 'center', icon: AlignCenter },
                { label: 'Right', val: 'right', icon: AlignRight },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => updateSettings({ align_items: opt.val })}
                    className={`py-1.5 flex items-center justify-center gap-1 text-[11px] font-medium rounded-lg border transition ${
                      previewSettings.align_items === opt.val
                        ? 'bg-blue-600 border-blue-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Color & Effects Controls */}
        <div className="flex flex-col gap-4 bg-[#18181b] p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-white/10 pb-2">
            <Layers className="w-4 h-4" />
            <span>Colors & Text Effects</span>
          </div>

          {/* Text Color */}
          <ColorPickerInput
            label="Text Color"
            value={previewSettings.text_color}
            onChange={(color) => updateSettings({ text_color: color })}
            presetSwatches={['#FFFFFF', '#FFD700', '#00EEEE', '#FF3366', '#00FF66']}
          />

          {/* Shadow Color */}
          <ColorPickerInput
            label="Shadow Color"
            value={previewSettings.text_shadow_color}
            onChange={(color) => updateSettings({ text_shadow_color: color })}
            presetSwatches={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.3)', '#000000']}
          />

          {/* Shadow Blur Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-white/70">
              <label>Shadow Blur Radius</label>
              <span className="font-mono text-amber-400">{previewSettings.text_shadow_blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={previewSettings.text_shadow_blur}
              onChange={(e) => updateSettings({ text_shadow_blur: parseInt(e.target.value) })}
              className="accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Outline Stroke Width */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-white/70">
              <label>Text Stroke / Outline Width</label>
              <span className="font-mono text-amber-400">{previewSettings.text_stroke_width}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={previewSettings.text_stroke_width}
              onChange={(e) => updateSettings({ text_stroke_width: parseInt(e.target.value) })}
              className="accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Outline Stroke Color */}
          {previewSettings.text_stroke_width > 0 && (
            <ColorPickerInput
              label="Stroke / Outline Color"
              value={previewSettings.text_stroke_color}
              onChange={(color) => updateSettings({ text_stroke_color: color })}
              presetSwatches={['#000000', '#FFFFFF', '#FF0000', '#0000FF']}
            />
          )}
        </div>

        {/* Column 3: Background Box Controls */}
        <div className="flex flex-col gap-4 bg-[#18181b] p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-white/10 pb-2">
            <Box className="w-4 h-4" />
            <span>Background Box Container</span>
          </div>

          {/* Toggle Background Box */}
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-xs font-medium text-white">Enable Background Box</span>
            <button
              id="btn-toggle-bg-box"
              type="button"
              onClick={() => updateSettings({ show_background: !previewSettings.show_background })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                previewSettings.show_background ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  previewSettings.show_background ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {previewSettings.show_background && (
            <>
              {/* Background Color */}
              <ColorPickerInput
                label="Background Color"
                value={previewSettings.background_color}
                onChange={(color) => updateSettings({ background_color: color })}
                presetSwatches={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.8)', '#000000', '#1E1B4B', '#022C22']}
              />

              {/* Background Opacity Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-white/70">
                  <label>Background Opacity</label>
                  <span className="font-mono text-emerald-400">{previewSettings.background_opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={previewSettings.background_opacity}
                  onChange={(e) => updateSettings({ background_opacity: parseInt(e.target.value) })}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Vertical Padding Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-white/70">
                  <label>Vertical Padding</label>
                  <span className="font-mono text-emerald-400">{previewSettings.padding_vertical}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={previewSettings.padding_vertical}
                  onChange={(e) => updateSettings({ padding_vertical: parseInt(e.target.value) })}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Horizontal Padding Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-white/70">
                  <label>Horizontal Padding</label>
                  <span className="font-mono text-emerald-400">{previewSettings.padding_horizontal}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={previewSettings.padding_horizontal}
                  onChange={(e) => updateSettings({ padding_horizontal: parseInt(e.target.value) })}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Border Radius Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-white/70">
                  <label>Corner Border Radius</label>
                  <span className="font-mono text-emerald-400">{previewSettings.border_radius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={previewSettings.border_radius}
                  onChange={(e) => updateSettings({ border_radius: parseInt(e.target.value) })}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Container Max Width */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/70 flex items-center justify-between">
                  <span>Container Max Width</span>
                  <Maximize2 className="w-3 h-3 text-white/40" />
                </label>
                <select
                  value={previewSettings.max_width}
                  onChange={(e) => updateSettings({ max_width: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="max-w-7xl" className="bg-[#18181b]">7XL (Wide Container)</option>
                  <option value="max-w-5xl" className="bg-[#18181b]">5XL (Medium Container)</option>
                  <option value="max-w-3xl" className="bg-[#18181b]">3XL (Compact Container)</option>
                  <option value="max-w-full" className="bg-[#18181b]">Full Width (100%)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Preset Modal */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={saveAsNewPreset}
      />
    </div>
  );
};
