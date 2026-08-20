<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\DisplaySettingsUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDisplayPresetRequest;
use App\Http\Requests\UpdateDisplaySettingRequest;
use App\Models\DisplaySetting;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
    public function show(Request $request): JsonResponse
    {
        $orgId = $request->header('X-Organization-Id')
            ?? $request->query('organization_id')
            ?? $request->query('org_id');

        $cacheKey = $orgId ? self::CACHE_KEY."_{$orgId}" : self::CACHE_KEY;

        $settingData = Cache::remember($cacheKey, 86400, function () use ($orgId) {
            $setting = DisplaySetting::getActiveSetting($orgId) ?? DisplaySetting::firstOrCreate(
                ['name' => 'Default Style', 'organization_id' => $orgId],
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
        $orgId = $request->header('X-Organization-Id')
            ?? $request->query('organization_id')
            ?? $request->query('org_id');

        $user = $request->user();
        if ($user && ! $user->isSuperAdmin() && $orgId) {
            if (! $user->organizations()->where('organizations.id', $orgId)->wherePivot('status', 'ACTIVE')->exists()) {
                abort(403, 'Anda tidak memiliki hak akses untuk mengubah styling di organisasi ini.');
            }
        }

        $setting = DisplaySetting::getActiveSetting($orgId) ?? DisplaySetting::firstOrCreate(
            ['name' => 'Default Style', 'organization_id' => $orgId]
        );

        $setting->update($request->validated());
        $freshSetting = $setting->fresh();

        $cacheKey = $orgId ? self::CACHE_KEY."_{$orgId}" : self::CACHE_KEY;

        // Invalidate and refresh cache with array representation
        Cache::forget($cacheKey);
        Cache::put($cacheKey, $freshSetting->toArray(), 86400);

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
    public function indexPresets(Request $request): JsonResponse
    {
        $orgId = $request->header('X-Organization-Id')
            ?? $request->query('organization_id')
            ?? $request->query('org_id');

        $query = DisplaySetting::orderBy('created_at', 'desc');
        if ($orgId) {
            $query->where('organization_id', $orgId);
        }
        $presets = $query->get();

        return response()->json([
            'data' => $presets,
        ]);
    }

    /**
     * Store a new display setting preset profile.
     */
    public function storePreset(StoreDisplayPresetRequest $request): JsonResponse
    {
        $orgId = $request->input('organization_id')
            ?? $request->header('X-Organization-Id')
            ?? $request->user()?->organizations()->first()?->id
            ?? Organization::getDefault()->id;

        $user = $request->user();
        if ($orgId && $user && ! $user->isSuperAdmin()) {
            $hasExplicitOrg = $request->has('organization_id') || $request->hasHeader('X-Organization-Id');
            if ($hasExplicitOrg) {
                $isMember = $user->organizations()->where('organizations.id', $orgId)->wherePivot('status', 'ACTIVE')->exists();
                if (! $isMember) {
                    abort(403, 'Anda tidak memiliki hak akses untuk membuat preset di organisasi ini.');
                }
            }
        }

        $preset = DisplaySetting::create(array_merge(
            ['is_active' => false, 'organization_id' => $orgId],
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
        $this->authorizePresetAccess($request, $preset);

        $preset->update($request->validated());
        $freshPreset = $preset->fresh();

        // If updated preset is currently active, refresh cache and broadcast real-time event
        if ($freshPreset->is_active) {
            $cacheKey = $freshPreset->organization_id ? self::CACHE_KEY."_{$freshPreset->organization_id}" : self::CACHE_KEY;
            Cache::forget($cacheKey);
            Cache::put($cacheKey, $freshPreset->toArray(), 86400);
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
    public function activatePreset(Request $request, int $id): JsonResponse
    {
        $preset = DisplaySetting::findOrFail($id);
        $this->authorizePresetAccess($request, $preset);

        $preset->activate();
        $freshPreset = $preset->fresh();

        $cacheKey = $freshPreset->organization_id ? self::CACHE_KEY."_{$freshPreset->organization_id}" : self::CACHE_KEY;

        // Invalidate and refresh cache
        Cache::forget($cacheKey);
        Cache::put($cacheKey, $freshPreset->toArray(), 86400);

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
    public function destroyPreset(Request $request, int $id): JsonResponse
    {
        $preset = DisplaySetting::findOrFail($id);
        $this->authorizePresetAccess($request, $preset);

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

    /**
     * Ensure the user has active membership in the preset's organization to prevent cross-tenant IDOR attacks.
     */
    protected function authorizePresetAccess(Request $request, DisplaySetting $preset): void
    {
        $user = $request->user();
        if (! $user || $user->isSuperAdmin()) {
            return;
        }

        if ($preset->organization_id && ! $user->organizations()->where('organizations.id', $preset->organization_id)->wherePivot('status', 'ACTIVE')->exists()) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola preset di organisasi ini.');
        }
    }
}
