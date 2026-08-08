import React, { useState } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presetSwatches?: string[];
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  label,
  value,
  onChange,
  presetSwatches = ['#FFFFFF', '#FFD700', '#00EEEE', '#FF3366', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)'],
}) => {
  const [textInput, setTextInput] = useState(value);

  // Convert hex or rgba to simple hex for the input[type=color] if needed
  const getPickerHex = (val: string): string => {
    if (val.startsWith('#')) return val;
    if (val.startsWith('rgba') || val.startsWith('rgb')) {
      const match = val.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]).toString(16).padStart(2, '0');
        const g = parseInt(match[1]).toString(16).padStart(2, '0');
        const b = parseInt(match[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    }
    return '#FFFFFF';
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setTextInput(newText);
    onChange(newText);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.toUpperCase();
    setTextInput(newHex);
    onChange(newHex);
  };

  const handleSwatchClick = (color: string) => {
    setTextInput(color);
    onChange(color);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/80 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-blue-300 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{value}</span>
      </label>

      <div className="flex items-center gap-2">
        {/* Color preview circle with hidden input[type=color] */}
        <div className="relative w-10 h-10 min-w-[40px] rounded-xl border border-white/20 overflow-hidden shrink-0 shadow-inner flex items-center justify-center cursor-pointer touch-manipulation">
          <div
            className="w-full h-full"
            style={{ backgroundColor: value || '#FFFFFF' }}
          />
          <input
            type="color"
            value={getPickerHex(value)}
            onChange={handlePickerChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>

        {/* Text Input for HEX or RGBA string */}
        <input
          type="text"
          value={textInput}
          onChange={handleTextChange}
          placeholder="#FFFFFF or rgba(0,0,0,0.8)"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 font-mono focus:outline-none focus:border-blue-500 transition min-h-[44px]"
        />
      </div>

      {/* Preset Swatches */}
      {presetSwatches.length > 0 && (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Palette className="w-3.5 h-3.5 text-white/40 mr-0.5" />
          {presetSwatches.map((swatch, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSwatchClick(swatch)}
              className="w-7 h-7 min-w-[28px] rounded-lg border border-white/30 transition hover:scale-110 active:scale-95 focus:outline-none touch-manipulation shadow-sm"
              style={{ backgroundColor: swatch }}
              title={`Use ${swatch}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
