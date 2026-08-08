import {
  DisplaySetting,
  UpdateDisplaySettingPayload,
  CreateDisplayPresetPayload,
  DEFAULT_DISPLAY_SETTING,
} from '../types/DisplaySetting';
import { apiClient } from '../utils/apiClient';

export const displaySettingService = {
  /**
   * Fetch currently active display setting.
   */
  async getDisplaySettings(): Promise<DisplaySetting> {
    try {
      const res = await apiClient.fetch('/api/v1/display/settings');
      if (!res.ok) {
        throw new Error(`Failed to fetch display settings (${res.status})`);
      }
      const json = await res.json();
      return json.data || DEFAULT_DISPLAY_SETTING;
    } catch (err) {
      console.warn('Error fetching display settings, using default fallback:', err);
      return DEFAULT_DISPLAY_SETTING;
    }
  },

  /**
   * Update active display setting configuration.
   */
  async updateDisplaySettings(payload: UpdateDisplaySettingPayload): Promise<DisplaySetting> {
    const res = await apiClient.fetch('/api/v1/display/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to update display settings (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch all saved display setting presets.
   */
  async getPresets(): Promise<DisplaySetting[]> {
    const res = await apiClient.fetch('/api/v1/display/presets');
    if (!res.ok) {
      throw new Error(`Failed to fetch display presets (${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Create a new display setting preset profile.
   */
  async createPreset(payload: CreateDisplayPresetPayload): Promise<DisplaySetting> {
    const res = await apiClient.fetch('/api/v1/display/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to create preset (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Update an existing display setting preset profile.
   */
  async updatePreset(id: number, payload: UpdateDisplaySettingPayload): Promise<DisplaySetting> {
    const res = await apiClient.fetch(`/api/v1/display/presets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to update preset (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Atomically activate a display setting preset.
   */
  async activatePreset(id: number): Promise<DisplaySetting> {
    const res = await apiClient.fetch(`/api/v1/display/presets/${id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to activate preset (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Delete a saved display setting preset profile.
   */
  async deletePreset(id: number): Promise<void> {
    const res = await apiClient.fetch(`/api/v1/display/presets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to delete preset (${res.status})`);
    }
  },
};

