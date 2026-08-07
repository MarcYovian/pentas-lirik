export interface DisplaySetting {
  id: number;
  name: string;
  is_active: boolean;
  font_size: number;
  font_weight: '400' | '600' | '700' | '800' | string;
  text_transform: 'uppercase' | 'capitalize' | 'none' | string;
  align_items: 'left' | 'center' | 'right' | string;
  text_color: string;
  text_shadow_color: string;
  text_shadow_blur: number;
  text_stroke_width: number;
  text_stroke_color: string;
  show_background: boolean;
  background_color: string;
  background_opacity: number;
  padding_vertical: number;
  padding_horizontal: number;
  border_radius: number;
  max_width: string;
  created_at?: string;
  updated_at?: string;
}

export type UpdateDisplaySettingPayload = Partial<Omit<DisplaySetting, 'id' | 'created_at' | 'updated_at'>>;

export interface CreateDisplayPresetPayload extends UpdateDisplaySettingPayload {
  name: string;
}

export const DEFAULT_DISPLAY_SETTING: DisplaySetting = {
  id: 1,
  name: 'Default Style',
  is_active: true,
  font_size: 48,
  font_weight: '800',
  text_transform: 'uppercase',
  align_items: 'center',
  text_color: '#FFFFFF',
  text_shadow_color: 'rgba(0, 0, 0, 0.8)',
  text_shadow_blur: 10,
  text_stroke_width: 0,
  text_stroke_color: '#000000',
  show_background: false,
  background_color: 'rgba(0, 0, 0, 0.6)',
  background_opacity: 60,
  padding_vertical: 16,
  padding_horizontal: 32,
  border_radius: 12,
  max_width: 'max-w-7xl',
};
