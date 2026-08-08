<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\DisplaySettingsUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDisplayPresetRequest;
use App\Http\Requests\UpdateDisplaySettingRequest;
use App\Models\DisplaySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DisplaySettingController extends Controller
{
    /**
     * Cache key for the active display setting.
     */
    private const CACHE_KEY = 'active_display_setting';

    /**
     * Get the currently active OBS display custom styling.
     */
    public function show(): JsonResponse
    {
        $settingData = Cache::remember(self::CACHE_KEY, 86400, function () {
            $setting = DisplaySetting::getActiveSetting() ?? DisplaySetting::firstOrCreate(
                ['name' => 'Default Style'],
                [
                    'is_active' => true,
                    'font_size' => 48,
                    'font_weight' => '800',
                    'text_transform' => 'uppercase',
                    'align_items' => 'center',
                    'text_color' => '#FFFFFF',
                    'text_shadow_color' => 'rgba(0,0,0,0.8)',
                    'text_shadow_blur' => 10,
                    'text_stroke_width' => 0,
                    'text_stroke_color' => '#000000',
                    'show_background' => false,
                    'background_color' => 'rgba(0,0,0,0.6)',
                    'background_opacity' => 60,
                    'padding_vertical' => 16,
                    'padding_horizontal' => 32,
                    'border_radius' => 12,
                    'max_width' => 'max-w-7xl',
                ]
            );

            return $setting->toArray();
        });

        return response()->json([
            'data' => $settingData,
        ]);
    }

    /**
     * Update active OBS display custom styling and broadcast WebSocket event.
     */
    public function update(UpdateDisplaySettingRequest $request): JsonResponse
    {
        $setting = DisplaySetting::getActiveSetting() ?? DisplaySetting::firstOrCreate(['name' => 'Default Style']);

        $setting->update($request->validated());
        $freshSetting = $setting->fresh();

        // Invalidate and refresh cache with array representation
        Cache::forget(self::CACHE_KEY);
        Cache::put(self::CACHE_KEY, $freshSetting->toArray(), 86400);

        // Broadcast real-time styling update to active OBS Display instances
        event(new DisplaySettingsUpdatedEvent($freshSetting->toArray()));

        return response()->json([
            'message' => 'Display settings updated and broadcasted successfully.',
            'data' => $freshSetting,
        ]);
    }

    /**
     * Get list of all saved display setting presets.
     */
    public function indexPresets(): JsonResponse
    {
        $presets = DisplaySetting::orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $presets,
        ]);
    }

    /**
     * Store a new display setting preset profile.
     */
    public function storePreset(StoreDisplayPresetRequest $request): JsonResponse
    {
        $preset = DisplaySetting::create(array_merge(
            ['is_active' => false],
            $request->validated()
        ));

        return response()->json([
            'message' => 'Display preset created successfully.',
            'data' => $preset,
        ], 201);
    }

    /**
     * Update an existing display setting preset profile.
     */
    public function updatePreset(int $id, StoreDisplayPresetRequest $request): JsonResponse
    {
        $preset = DisplaySetting::findOrFail($id);
        $preset->update($request->validated());
        $freshPreset = $preset->fresh();

        // If updated preset is currently active, refresh cache and broadcast real-time event
        if ($freshPreset->is_active) {
            Cache::forget(self::CACHE_KEY);
            Cache::put(self::CACHE_KEY, $freshPreset->toArray(), 86400);
            event(new DisplaySettingsUpdatedEvent($freshPreset->toArray()));
        }

        return response()->json([
            'message' => 'Display preset updated successfully.',
            'data' => $freshPreset,
        ]);
    }

    /**
     * Atomically activate a display setting preset.
     */
    public function activatePreset(int $id): JsonResponse
    {
        $preset = DisplaySetting::findOrFail($id);

        $preset->activate();
        $freshPreset = $preset->fresh();

        // Invalidate and refresh cache
        Cache::forget(self::CACHE_KEY);
        Cache::put(self::CACHE_KEY, $freshPreset->toArray(), 86400);

        // Broadcast real-time styling update
        event(new DisplaySettingsUpdatedEvent($freshPreset->toArray()));

        return response()->json([
            'message' => 'Display preset activated and broadcasted successfully.',
            'data' => $freshPreset,
        ]);
    }

    /**
     * Delete a display setting preset profile.
     */
    public function destroyPreset(int $id): JsonResponse
    {
        $preset = DisplaySetting::findOrFail($id);

        if ($preset->is_active) {
            return response()->json([
                'message' => 'Cannot delete the currently active display preset.',
            ], 422);
        }

        $preset->delete();

        return response()->json([
            'message' => 'Display preset deleted successfully.',
        ]);
    }
}
