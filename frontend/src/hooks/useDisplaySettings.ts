import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DisplaySetting,
  UpdateDisplaySettingPayload,
  DEFAULT_DISPLAY_SETTING,
} from '../types/DisplaySetting';
import { displaySettingService } from '../services/displaySettingService';

export function useDisplaySettings() {
  // Live Settings: Currently active theme broadcasted to OBS Studio
  const [liveSettings, setLiveSettings] = useState<DisplaySetting>(() => {
    const saved = localStorage.getItem('obs_display_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_DISPLAY_SETTING;
  });

  // Preview Settings: Sandbox state currently being inspected/edited on Mini OBS Preview
  const [previewSettings, setPreviewSettings] = useState<DisplaySetting>(() => {
    const saved = localStorage.getItem('obs_display_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_DISPLAY_SETTING;
  });

  const [presets, setPresets] = useState<DisplaySetting[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync settings to localStorage for OBS Display client instant load
  const updateLocalStorage = (newSettings: DisplaySetting) => {
    try {
      localStorage.setItem('obs_display_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to update localStorage obs_display_settings:', e);
    }
  };

  // Fetch initial active settings & presets list
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [activeSetting, presetsList] = await Promise.all([
        displaySettingService.getDisplaySettings(),
        displaySettingService.getPresets().catch(() => []),
      ]);

      setLiveSettings(activeSetting);
      setPreviewSettings(activeSetting);
      setSelectedPresetId(activeSetting.id);
      updateLocalStorage(activeSetting);
      setPresets(presetsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load display settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket Listener for display:settings-updated real-time broadcast
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        try {
          ws?.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'display' } }));
        } catch (e) {}
      };

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          const evtName = messageData.event || messageData.type;

          if (evtName === 'display:settings-updated' || evtName === 'App\\Events\\DisplaySettingsUpdatedEvent') {
            const updatedPayload = messageData.data;
            if (updatedPayload && updatedPayload.font_size) {
              setLiveSettings(updatedPayload);
              updateLocalStorage(updatedPayload);
              setPresets((prev) =>
                prev.map((p) => ({
                  ...p,
                  is_active: p.id === updatedPayload.id,
                }))
              );
            }
          }
        } catch (e) {}
      };
    };

    connect();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Update preview settings in sandbox (with debounced save if target is active live theme)
  const updateSettings = useCallback(
    (payload: UpdateDisplaySettingPayload) => {
      setPreviewSettings((prev) => {
        const next = { ...prev, ...payload };
        return next;
      });

      // Update preset attributes in local presets list
      if (selectedPresetId) {
        setPresets((prev) =>
          prev.map((p) => (p.id === selectedPresetId ? { ...p, ...payload } : p))
        );
      }
    },
    [selectedPresetId]
  );

  // Inspect / Select a preset profile for preview sandbox without changing OBS Live broadcast
  const selectPresetForPreview = (preset: DisplaySetting) => {
    setPreviewSettings(preset);
    setSelectedPresetId(preset.id);
  };

  // Save changes to current selected preset profile
  const saveCurrentPresetChanges = async () => {
    if (!selectedPresetId) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await displaySettingService.updatePreset(selectedPresetId, previewSettings);
      setPreviewSettings(updated);
      setPresets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      
      // If updating the active live theme, update liveSettings as well
      if (updated.is_active || updated.id === liveSettings.id) {
        setLiveSettings(updated);
        updateLocalStorage(updated);
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update preset.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Save current preview styling as a new named preset
  const saveAsNewPreset = async (name: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const newPreset = await displaySettingService.createPreset({
        ...previewSettings,
        name,
      });
      setPresets((prev) => [newPreset, ...prev]);
      setPreviewSettings(newPreset);
      setSelectedPresetId(newPreset.id);
      return newPreset;
    } catch (err: any) {
      setError(err.message || 'Failed to save preset.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // One-click activate preset to OBS Live broadcast
  const activatePresetToLive = async (id: number) => {
    setIsActivating(true);
    setError(null);
    try {
      const activated = await displaySettingService.activatePreset(id);
      setLiveSettings(activated);
      setPreviewSettings(activated);
      setSelectedPresetId(activated.id);
      updateLocalStorage(activated);
      setPresets((prev) =>
        prev.map((p) => ({
          ...p,
          is_active: p.id === activated.id,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to activate preset.');
    } finally {
      setIsActivating(false);
    }
  };

  // Delete an inactive preset
  const deletePreset = async (id: number) => {
    setError(null);
    try {
      await displaySettingService.deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
      if (selectedPresetId === id) {
        setPreviewSettings(liveSettings);
        setSelectedPresetId(liveSettings.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete preset.');
    }
  };

  // Reset preview options to system default styling
  const resetToDefault = useCallback(() => {
    updateSettings({
      font_size: DEFAULT_DISPLAY_SETTING.font_size,
      font_weight: DEFAULT_DISPLAY_SETTING.font_weight,
      text_transform: DEFAULT_DISPLAY_SETTING.text_transform,
      align_items: DEFAULT_DISPLAY_SETTING.align_items,
      text_color: DEFAULT_DISPLAY_SETTING.text_color,
      text_shadow_color: DEFAULT_DISPLAY_SETTING.text_shadow_color,
      text_shadow_blur: DEFAULT_DISPLAY_SETTING.text_shadow_blur,
      text_stroke_width: DEFAULT_DISPLAY_SETTING.text_stroke_width,
      text_stroke_color: DEFAULT_DISPLAY_SETTING.text_stroke_color,
      show_background: DEFAULT_DISPLAY_SETTING.show_background,
      background_color: DEFAULT_DISPLAY_SETTING.background_color,
      background_opacity: DEFAULT_DISPLAY_SETTING.background_opacity,
      padding_vertical: DEFAULT_DISPLAY_SETTING.padding_vertical,
      padding_horizontal: DEFAULT_DISPLAY_SETTING.padding_horizontal,
      border_radius: DEFAULT_DISPLAY_SETTING.border_radius,
      max_width: DEFAULT_DISPLAY_SETTING.max_width,
    });
  }, [updateSettings]);

  return {
    liveSettings,
    previewSettings,
    settings: previewSettings, // Compatibility alias
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
    activatePreset: activatePresetToLive, // Compatibility alias
    deletePreset,
    resetToDefault,
    refetch: loadData,
  };
}
