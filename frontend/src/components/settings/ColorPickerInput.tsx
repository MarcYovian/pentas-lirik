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
      <label className="text-xs font-medium text-white/70 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-white/40 font-mono">{value}</span>
      </label>

      <div className="flex items-center gap-2">
        {/* Color preview circle with hidden input[type=color] */}
        <div className="relative w-8 h-8 rounded-lg border border-white/20 overflow-hidden shrink-0 shadow-inner flex items-center justify-center cursor-pointer">
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
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 font-mono focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Preset Swatches */}
      {presetSwatches.length > 0 && (
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Palette className="w-3 h-3 text-white/30 mr-1" />
          {presetSwatches.map((swatch, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSwatchClick(swatch)}
              className="w-5 h-5 rounded border border-white/20 transition hover:scale-110 focus:outline-none"
              style={{ backgroundColor: swatch }}
              title={`Use ${swatch}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
