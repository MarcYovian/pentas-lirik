import React from 'react';
import { DisplaySetting } from '../types/DisplaySetting';

/**
 * Compute RGBA background color string with given opacity percentage (0 - 100).
 */
export function computeRgbaWithOpacity(colorStr: string, opacityPercent: number): string {
  if (!colorStr) return 'transparent';
  const opacity = Math.min(100, Math.max(0, opacityPercent)) / 100;

  if (colorStr.startsWith('rgba')) {
    return colorStr.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/\d+/g);
    if (match && match.length >= 3) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${opacity})`;
    }
  }
  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return colorStr;
}

/**
 * Build inline React CSSProperties object from DisplaySetting for 1080p OBS display canvas.
 */
export function buildDisplayInlineStyles(settings: DisplaySetting): React.CSSProperties {
  const showBg = !!settings.show_background;

  return {
    fontSize: `${settings.font_size || 48}px`,
    fontWeight: (settings.font_weight || '800') as any,
    textTransform: (settings.text_transform === 'none' ? 'none' : settings.text_transform || 'uppercase') as any,
    textAlign: (settings.align_items || 'center') as any,
    color: settings.text_color || '#FFFFFF',
    textShadow: settings.text_shadow_blur > 0
      ? `0px 0px ${settings.text_shadow_blur}px ${settings.text_shadow_color || 'rgba(0,0,0,0.8)'}`
      : 'none',
    WebkitTextStroke: (settings.text_stroke_width && settings.text_stroke_width > 0)
      ? `${settings.text_stroke_width}px ${settings.text_stroke_color || '#000000'}`
      : undefined,
    backgroundColor: showBg
      ? computeRgbaWithOpacity(settings.background_color || 'rgba(0,0,0,0.6)', settings.background_opacity ?? 60)
      : 'transparent',
    padding: showBg
      ? `${settings.padding_vertical ?? 16}px ${settings.padding_horizontal ?? 32}px`
      : '0px',
    borderRadius: showBg ? `${settings.border_radius ?? 12}px` : '0px',
    display: 'inline-block',
    maxWidth: '100%',
    transition: 'all 0.15s ease-out',
  };
}
