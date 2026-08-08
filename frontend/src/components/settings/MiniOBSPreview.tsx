import React, { useState, useRef, useEffect } from 'react';
import { DisplaySetting } from '../../types/DisplaySetting';
import { Eye, EyeOff, Sun, Moon, Grid } from 'lucide-react';

interface MiniOBSPreviewProps {
  settings: DisplaySetting;
  sampleText?: string;
  isStickyMobile?: boolean;
}

export const MiniOBSPreview: React.FC<MiniOBSPreviewProps> = ({
  settings,
  sampleText = 'Haleluya Puji Tuhan Haleluya Puji Tuhan\nDi Tempat Yang Maha Tinggi Maha Tinggi',
  isStickyMobile = false,
}) => {
  const [bgMode, setBgMode] = useState<'dark' | 'light' | 'grid'>('dark');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState<number>(360);

  // Measure dynamic 16:9 frame width for exact 1080p proportional scaling (1920px base)
  useEffect(() => {
    if (!frameRef.current) return;
    const updateWidth = () => {
      if (frameRef.current) {
        setFrameWidth(frameRef.current.clientWidth || 360);
      }
    };
    updateWidth();

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setFrameWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);

  // Proportional scale factor relative to 1920px (1080p OBS canvas base)
  const scale = Math.max(0.1, frameWidth / 1920);

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

  // Build inline styles dynamically for preview with exact 1080p proportional scale
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
    <div
      className={`flex flex-col gap-2 bg-[#18181b] p-3 md:p-4 rounded-xl border border-white/10 shadow-lg ${
        isStickyMobile ? 'sticky top-0 z-30 backdrop-blur-md bg-slate-900/95 shadow-2xl border-b border-slate-800 mb-4' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <Eye className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="truncate">Mini OBS Live Preview (16:9 1080p Ratio)</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle Collapsed state for mobile */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 shrink-0"
          >
            {isCollapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? 'Show' : 'Hide'}</span>
          </button>

          {/* Toggleable background test patterns */}
          {!isCollapsed && (
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setBgMode('dark')}
                className={`p-1 sm:px-2 sm:py-1 rounded flex items-center gap-1 transition ${
                  bgMode === 'dark' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
                title="Dark Camera Feed Pattern"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setBgMode('light')}
                className={`p-1 sm:px-2 sm:py-1 rounded flex items-center gap-1 transition ${
                  bgMode === 'light' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
                title="Bright Camera Feed Pattern"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bright</span>
              </button>
              <button
                type="button"
                onClick={() => setBgMode('grid')}
                className={`p-1 sm:px-2 sm:py-1 rounded flex items-center gap-1 transition ${
                  bgMode === 'grid' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
                title="Transparent OBS Checker Grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulated 16:9 Frame */}
      {!isCollapsed && (
        <div
          ref={frameRef}
          className={`relative w-full aspect-video rounded-lg overflow-hidden border border-white/20 flex flex-col justify-end p-3 sm:p-6 select-none transition ${
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
          <div className={`w-full ${getPreviewMaxWidthClass(settings.max_width || 'max-w-7xl')} mx-auto flex justify-center z-10 px-1 sm:px-2 transition-all duration-200`}>
            <div id="mini-obs-preview-text" className="max-w-full leading-tight whitespace-pre-line" style={textStyle}>
              {sampleText}
            </div>
          </div>

          {/* Watermark Overlay */}
          <div className="absolute top-2 left-2 bg-black/60 text-[10px] text-white/60 px-2 py-0.5 rounded font-mono pointer-events-none border border-white/10">
            OBS 1080p Preview ({Math.round(frameWidth)}px)
          </div>
        </div>
      )}
    </div>
  );
};
