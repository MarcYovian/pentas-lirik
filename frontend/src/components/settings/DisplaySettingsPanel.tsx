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
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
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
  const [activeAccordion, setActiveAccordion] = useState<'typography' | 'color' | 'background' | 'all'>('all');

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

  // Helper numeric stepper for range sliders
  const renderNumericStepper = (
    label: string,
    val: number,
    min: number,
    max: number,
    keyName: string,
    unit = 'px'
  ) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-white/80">
        <label>{label}</label>
        <span className="font-mono text-blue-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {val}{unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ [keyName]: Math.max(min, val - 1) })}
          className="w-10 h-10 min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold flex items-center justify-center border border-slate-700 touch-manipulation active:scale-95 shrink-0"
          title="Decrease"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onChange={(e) => updateSettings({ [keyName]: parseInt(e.target.value) })}
          className="flex-1 accent-blue-500 cursor-pointer min-h-[44px]"
        />
        <button
          type="button"
          onClick={() => updateSettings({ [keyName]: Math.min(max, val + 1) })}
          className="w-10 h-10 min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold flex items-center justify-center border border-slate-700 touch-manipulation active:scale-95 shrink-0"
          title="Increase"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 bg-[#121212] text-white max-w-6xl mx-auto rounded-2xl border border-white/10 shadow-2xl overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-3 gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sliders className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>OBS Display Customization</span>
                {isSaving && <span className="text-[10px] text-blue-400 font-mono animate-pulse">Saving...</span>}
              </h2>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/60 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live: <strong>{livePresetName}</strong>
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1 text-blue-300 font-medium">
                  <Eye className="w-3 h-3 text-blue-400" /> Preview: <strong>{activePresetName}</strong>
                </span>
              </div>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white/80 rounded-lg shrink-0"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 md:pt-0">
          {selectedPresetId && (
            <button
              type="button"
              disabled={isActivating}
              onClick={() => activatePresetToLive(selectedPresetId)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-50 flex items-center gap-1 shrink-0"
              title="Publish and broadcast this theme to OBS Live immediately"
            >
              {isActivating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Apply to OBS Live</span>
            </button>
          )}

          {selectedPresetId && (
            <button
              type="button"
              disabled={isSaving}
              onClick={saveCurrentPresetChanges}
              className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1 shrink-0"
              title="Save changes to current selected preset"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Preset</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetToDefault}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shrink-0"
            title="Restore PentasLirik Default Styling"
          >
            <RotateCcw className="w-3.5 h-3.5" /> <span>Default</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hidden md:flex p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white/80 rounded-lg transition"
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

      {/* Sticky Mini OBS Live Preview Canvas */}
      <MiniOBSPreview settings={previewSettings} isStickyMobile={true} />

      {/* Low Contrast Warning Badge */}
      {isLowContrast() && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Low Contrast Warning:</strong> Text color and background color are very similar. Lyrics may be hard to read on live broadcast.
          </span>
        </div>
      )}

      {/* Form Controls Grid / Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Typography Controls */}
        <div className="flex flex-col gap-4 bg-[#18181b] p-4 rounded-xl border border-white/10">
          <div
            onClick={() => setActiveAccordion(activeAccordion === 'typography' ? 'all' : 'typography')}
            className="flex items-center justify-between text-xs font-bold text-blue-400 border-b border-white/10 pb-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Typography & Scaling</span>
            </div>
            <ChevronDown className="w-4 h-4 md:hidden text-white/50" />
          </div>

          <div className="space-y-4">
            {/* Font Size Slider with Touch Steppers */}
            {renderNumericStepper('Font Size', previewSettings.font_size, 16, 120, 'font_size')}

            {/* Font Weight Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/70">Font Weight</label>
              <select
                value={previewSettings.font_weight}
                onChange={(e) => updateSettings({ font_weight: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
              >
                <option value="400">Normal (400)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra-Bold (800)</option>
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
                    className={`py-2 text-[11px] font-medium rounded-xl border transition min-h-[44px] ${
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
                      className={`py-2 flex items-center justify-center gap-1 text-[11px] font-medium rounded-xl border transition min-h-[44px] ${
                        previewSettings.align_items === opt.val
                          ? 'bg-blue-600 border-blue-500 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Color & Effects Controls */}
        <div className="flex flex-col gap-4 bg-[#18181b] p-4 rounded-xl border border-white/10">
          <div
            onClick={() => setActiveAccordion(activeAccordion === 'color' ? 'all' : 'color')}
            className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-white/10 pb-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Colors & Text Effects</span>
            </div>
            <ChevronDown className="w-4 h-4 md:hidden text-white/50" />
          </div>

          <div className="space-y-4">
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
            {renderNumericStepper('Shadow Blur Radius', previewSettings.text_shadow_blur, 0, 30, 'text_shadow_blur')}

            {/* Outline Stroke Width */}
            {renderNumericStepper('Text Stroke / Outline Width', previewSettings.text_stroke_width, 0, 4, 'text_stroke_width')}

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
        </div>

        {/* Card 3: Background Box Controls */}
        <div className="flex flex-col gap-4 bg-[#18181b] p-4 rounded-xl border border-white/10">
          <div
            onClick={() => setActiveAccordion(activeAccordion === 'background' ? 'all' : 'background')}
            className="flex items-center justify-between text-xs font-bold text-emerald-400 border-b border-white/10 pb-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              <span>Background Box Container</span>
            </div>
            <ChevronDown className="w-4 h-4 md:hidden text-white/50" />
          </div>

          <div className="space-y-4">
            {/* Toggle Background Box */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 min-h-[48px]">
              <span className="text-xs font-medium text-white">Enable Background Box</span>
              <button
                id="btn-toggle-bg-box"
                type="button"
                onClick={() => updateSettings({ show_background: !previewSettings.show_background })}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center touch-manipulation ${
                  previewSettings.show_background ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
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
                {renderNumericStepper('Background Opacity', previewSettings.background_opacity, 0, 100, 'background_opacity', '%')}

                {/* Vertical Padding Slider */}
                {renderNumericStepper('Vertical Padding', previewSettings.padding_vertical, 0, 50, 'padding_vertical')}

                {/* Horizontal Padding Slider */}
                {renderNumericStepper('Horizontal Padding', previewSettings.padding_horizontal, 0, 100, 'padding_horizontal')}

                {/* Border Radius Slider */}
                {renderNumericStepper('Corner Border Radius', previewSettings.border_radius, 0, 50, 'border_radius')}

                {/* Container Max Width */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/70 flex items-center justify-between">
                    <span>Container Max Width</span>
                    <Maximize2 className="w-3.5 h-3.5 text-white/40" />
                  </label>
                  <select
                    value={previewSettings.max_width}
                    onChange={(e) => updateSettings({ max_width: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[44px]"
                  >
                    <option value="max-w-7xl">7XL (Wide Container)</option>
                    <option value="max-w-5xl">5XL (Medium Container)</option>
                    <option value="max-w-3xl">3XL (Compact Container)</option>
                    <option value="max-w-full">Full Width (100%)</option>
                  </select>
                </div>
              </>
            )}
          </div>
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
