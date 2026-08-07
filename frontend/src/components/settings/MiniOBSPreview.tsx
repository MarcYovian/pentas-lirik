import React, { useState } from 'react';
import { DisplaySetting } from '../../types/DisplaySetting';
import { Eye, Sun, Moon, Grid } from 'lucide-react';

interface MiniOBSPreviewProps {
  settings: DisplaySetting;
  sampleText?: string;
}

export const MiniOBSPreview: React.FC<MiniOBSPreviewProps> = ({
  settings,
  sampleText = 'Haleluya Puji Tuhan Haleluya Puji Tuhan\nDi Tempat Yang Maha Tinggi Maha Tinggi',
}) => {
  const [bgMode, setBgMode] = useState<'dark' | 'light' | 'grid'>('dark');

  // Compute RGBA background box color with opacity
  const computeBgColor = (colorStr: string, opacityPercent: number): string => {
    if (!settings.show_background) return 'transparent';
    const opacity = opacityPercent / 100;
    if (colorStr.startsWith('rgba')) {
      return colorStr.replace(/[\d\.]+\)$/g, `${opacity})`);
    }
    if (colorStr.startsWith('#')) {
      const hex = colorStr.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return colorStr;
  };

  // Map Tailwind max-width classes to proportional percentage for the scaled preview frame
  const getPreviewMaxWidthClass = (maxWidthStr: string): string => {
    if (!settings.show_background) {
      return 'max-w-full';
    }
    switch (maxWidthStr) {
      case 'max-w-3xl':
        return 'max-w-[42%]'; // ~768px in 1920px screen
      case 'max-w-5xl':
        return 'max-w-[58%]'; // ~1024px in 1920px screen
      case 'max-w-7xl':
        return 'max-w-[75%]'; // ~1280px in 1920px screen
      case 'max-w-full':
      default:
        return 'max-w-full';  // 100% of screen
    }
  };

  // Proportional scale factor (Preview canvas vs real 1080p OBS canvas)
  const scale = 0.45;

  // Build inline styles dynamically for preview
  const textStyle: React.CSSProperties = {
    fontSize: `${(settings.font_size * scale).toFixed(1)}px`,
    fontWeight: settings.font_weight as any,
    textTransform: (settings.text_transform === 'none' ? 'none' : settings.text_transform) as any,
    textAlign: (settings.align_items || 'center') as any,
    color: settings.text_color || '#FFFFFF',
    textShadow: `0px 0px ${Math.max(1, settings.text_shadow_blur * scale)}px ${settings.text_shadow_color || 'rgba(0,0,0,0.8)'}`,
    WebkitTextStroke: settings.text_stroke_width > 0 ? `${(settings.text_stroke_width * scale).toFixed(1)}px ${settings.text_stroke_color}` : undefined,
    backgroundColor: computeBgColor(settings.background_color, settings.background_opacity),
    padding: `${(settings.padding_vertical * scale).toFixed(1)}px ${(settings.padding_horizontal * scale).toFixed(1)}px`,
    borderRadius: `${(settings.border_radius * scale).toFixed(1)}px`,
    display: 'inline-block',
    maxWidth: '100%',
    transition: 'all 0.15s ease-out',
  };

  return (
    <div className="flex flex-col gap-2 bg-[#18181b] p-4 rounded-xl border border-white/10 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <Eye className="w-4 h-4 text-blue-400" />
          <span>Mini OBS Live Preview (16:9 Canvas)</span>
        </div>

        {/* Toggleable background test patterns */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setBgMode('dark')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              bgMode === 'dark' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
            title="Dark Camera Feed Pattern"
          >
            <Moon className="w-3.5 h-3.5" /> Dark Feed
          </button>
          <button
            type="button"
            onClick={() => setBgMode('light')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              bgMode === 'light' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
            title="Bright Camera Feed Pattern"
          >
            <Sun className="w-3.5 h-3.5" /> Bright Feed
          </button>
          <button
            type="button"
            onClick={() => setBgMode('grid')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              bgMode === 'grid' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
            title="Transparent OBS Checker Grid"
          >
            <Grid className="w-3.5 h-3.5" /> Transp. Grid
          </button>
        </div>
      </div>

      {/* Simulated 16:9 Frame */}
      <div
        className={`relative w-full aspect-video rounded-lg overflow-hidden border border-white/20 flex flex-col justify-end p-6 select-none transition ${
          bgMode === 'dark'
            ? 'bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950'
            : bgMode === 'light'
            ? 'bg-gradient-to-t from-amber-100 via-sky-100 to-amber-50'
            : 'bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900'
        }`}
      >
        {/* Simulated Stage Lighting Overlay */}
        {bgMode === 'dark' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-red-900/30 pointer-events-none" />
        )}

        {/* Lower Third Lyric Container with Proportional Max Width */}
        <div className={`w-full ${getPreviewMaxWidthClass(settings.max_width || 'max-w-7xl')} mx-auto flex justify-center z-10 px-2 transition-all duration-200`}>
          <div id="mini-obs-preview-text" className="max-w-full leading-tight whitespace-pre-line" style={textStyle}>
            {sampleText}
          </div>
        </div>

        {/* Watermark Overlay */}
        <div className="absolute top-3 left-3 bg-black/50 text-[10px] text-white/50 px-2 py-0.5 rounded font-mono pointer-events-none">
          OBS Studio Browser Source Preview (1080p)
        </div>
      </div>
    </div>
  );
};
