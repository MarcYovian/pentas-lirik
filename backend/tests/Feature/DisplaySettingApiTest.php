<?php

namespace Tests\Feature;

use App\Events\DisplaySettingsUpdatedEvent;
use App\Models\DisplaySetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DisplaySettingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Event::fake([DisplaySettingsUpdatedEvent::class]);
    }

    #[Test]
    public function test_can_get_active_display_settings(): void
    {
        $setting = DisplaySetting::create([
            'name' => 'Default Style',
            'is_active' => true,
            'font_size' => 48,
            'text_color' => '#FFFFFF',
        ]);

        $response = $this->getJson('/api/v1/display/settings');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'is_active',
                    'font_size',
                    'font_weight',
                    'text_transform',
                    'align_items',
                    'text_color',
                    'text_shadow_color',
                    'text_shadow_blur',
                    'text_stroke_width',
                    'text_stroke_color',
                    'show_background',
                    'background_color',
                    'background_opacity',
                    'padding_vertical',
                    'padding_horizontal',
                    'border_radius',
                    'max_width',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $setting->id,
                    'font_size' => 48,
                    'text_color' => '#FFFFFF',
                ],
            ]);
    }

    #[Test]
    public function test_can_update_display_settings(): void
    {
        Event::fake();

        $user = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($user);

        DisplaySetting::create([
            'name' => 'Default Style',
            'is_active' => true,
            'font_size' => 48,
            'text_color' => '#FFFFFF',
        ]);

        $updatePayload = [
            'font_size' => 60,
            'font_weight' => '700',
            'text_transform' => 'uppercase',
            'text_color' => '#FFD700',
            'show_background' => true,
            'background_color' => 'rgba(0,0,0,0.8)',
            'background_opacity' => 80,
            'padding_vertical' => 20,
            'padding_horizontal' => 40,
            'border_radius' => 16,
        ];

        $response = $this->putJson('/api/v1/display/settings', $updatePayload);

        $response->assertOk()
            ->assertJson([
                'message' => 'Display settings updated and broadcasted successfully.',
                'data' => [
                    'font_size' => 60,
                    'text_color' => '#FFD700',
                    'show_background' => true,
                    'background_opacity' => 80,
                ],
            ]);

        $this->assertDatabaseHas('display_settings', [
            'is_active' => true,
            'font_size' => 60,
            'text_color' => '#FFD700',
            'show_background' => true,
        ]);

        Event::assertDispatched(DisplaySettingsUpdatedEvent::class, function ($event) {
            return $event->payload['font_size'] === 60 && $event->payload['text_color'] === '#FFD700';
        });
    }

    #[Test]
    public function test_validates_display_settings_input(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($user);

        // Test invalid font_size (5px is below minimum 16px)
        $responseLowFontSize = $this->putJson('/api/v1/display/settings', [
            'font_size' => 5,
        ]);

        $responseLowFontSize->assertUnprocessable()
            ->assertJsonValidationErrors(['font_size']);

        // Test invalid font_size (200px is above maximum 120px)
        $responseHighFontSize = $this->putJson('/api/v1/display/settings', [
            'font_size' => 200,
        ]);

        $responseHighFontSize->assertUnprocessable()
            ->assertJsonValidationErrors(['font_size']);

        // Test invalid color string
        $responseInvalidColor = $this->putJson('/api/v1/display/settings', [
            'text_color' => 'not-a-color',
        ]);

        $responseInvalidColor->assertUnprocessable()
            ->assertJsonValidationErrors(['text_color']);
    }

    #[Test]
    public function test_caches_active_display_settings_in_redis(): void
    {
        $setting = DisplaySetting::create([
            'name' => 'Default Style',
            'is_active' => true,
            'font_size' => 48,
            'text_color' => '#FFFFFF',
        ]);

        // GET endpoint should populate cache
        $this->getJson('/api/v1/display/settings');

        $this->assertTrue(Cache::has('active_display_setting'));
        $cachedValue = Cache::get('active_display_setting');
        $this->assertEquals($setting->id, is_array($cachedValue) ? $cachedValue['id'] : $cachedValue->id);

        // Update endpoint should update cache
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', [
                'font_size' => 64,
            ]);

        $this->assertTrue(Cache::has('active_display_setting'));
        $updatedCachedValue = Cache::get('active_display_setting');
        $fontSize = is_array($updatedCachedValue) ? $updatedCachedValue['font_size'] : $updatedCachedValue->font_size;
        $this->assertEquals(64, $fontSize);
    }

    #[Test]
    public function test_returns_default_settings_when_no_records_exist(): void
    {
        // Table is empty in setUp
        $this->assertEquals(0, DisplaySetting::count());

        $response = $this->getJson('/api/v1/display/settings');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Default Style',
                    'is_active' => true,
                    'font_size' => 48,
                    'text_color' => '#FFFFFF',
                ],
            ]);

        $this->assertEquals(1, DisplaySetting::count());
    }

    #[Test]
    public function test_unauthenticated_user_cannot_update_display_settings(): void
    {
        $response = $this->putJson('/api/v1/display/settings', [
            'font_size' => 64,
        ]);

        $response->assertStatus(401);
    }

    #[Test]
    public function test_partial_update_preserves_other_attributes(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $setting = DisplaySetting::create([
            'name' => 'Custom Preset',
            'is_active' => true,
            'font_size' => 48,
            'font_weight' => '800',
            'text_color' => '#00EEEE',
            'show_background' => true,
            'background_color' => 'rgba(0,0,0,0.5)',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', [
                'font_size' => 72,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'font_size' => 72,
                    'font_weight' => '800',
                    'text_color' => '#00EEEE',
                    'show_background' => true,
                    'background_color' => 'rgba(0,0,0,0.5)',
                ],
            ]);
    }

    #[Test]
    public function test_validates_extreme_boundary_values(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        // Invalid font_weight
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', ['font_weight' => 'ultra-bold'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['font_weight']);

        // Invalid text_transform
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', ['text_transform' => 'lowercase'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['text_transform']);

        // Invalid align_items
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', ['align_items' => 'justify'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['align_items']);

        // Invalid background_opacity (negative & out of range)
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', ['background_opacity' => -10])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['background_opacity']);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', ['background_opacity' => 150])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['background_opacity']);
    }

    #[Test]
    public function test_accepts_boundary_minimum_and_maximum_values(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        DisplaySetting::create([
            'name' => 'Default Style',
            'is_active' => true,
        ]);

        // Minimum boundaries
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', [
                'font_size' => 16,
                'text_shadow_blur' => 0,
                'text_stroke_width' => 0,
                'background_opacity' => 0,
                'padding_vertical' => 0,
                'border_radius' => 0,
            ])
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'font_size' => 16,
                    'text_shadow_blur' => 0,
                    'text_stroke_width' => 0,
                    'background_opacity' => 0,
                    'padding_vertical' => 0,
                    'border_radius' => 0,
                ],
            ]);

        // Maximum boundaries
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', [
                'font_size' => 120,
                'text_shadow_blur' => 100,
                'text_stroke_width' => 10,
                'background_opacity' => 100,
                'padding_vertical' => 100,
                'border_radius' => 100,
            ])
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'font_size' => 120,
                    'text_shadow_blur' => 100,
                    'text_stroke_width' => 10,
                    'background_opacity' => 100,
                    'padding_vertical' => 100,
                    'border_radius' => 100,
                ],
            ]);
    }

    #[Test]
    public function test_validates_various_color_formats(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        DisplaySetting::create(['name' => 'Default Style', 'is_active' => true]);

        // Valid colors: short hex, 6-digit hex, rgb, rgba
        $validColors = ['#FFF', '#FFFFFF', '#ffd700', 'rgb(255, 255, 255)', 'rgba(0,0,0,0.8)', 'rgba(255, 215, 0, 0.5)'];

        foreach ($validColors as $color) {
            $this->withHeader('Authorization', 'Bearer '.$token)
                ->putJson('/api/v1/display/settings', ['text_color' => $color])
                ->assertStatus(200);
        }

        // Invalid colors: XSS attempt, bad hex, malformed rgba
        $invalidColors = ['javascript:alert(1)', '#GGGGGG', 'rgba(255,255)', 'red'];

        foreach ($invalidColors as $invalidColor) {
            $this->withHeader('Authorization', 'Bearer '.$token)
                ->putJson('/api/v1/display/settings', ['text_color' => $invalidColor])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['text_color']);
        }
    }

    #[Test]
    public function test_atomic_single_active_setting_guarantee(): void
    {
        $s1 = DisplaySetting::create(['name' => 'Preset 1', 'is_active' => true]);
        $s2 = DisplaySetting::create(['name' => 'Preset 2', 'is_active' => false]);

        $this->assertEquals(1, DisplaySetting::where('is_active', true)->count());

        // Activate S2
        $s2->activate();

        $this->assertEquals(1, DisplaySetting::where('is_active', true)->count());
        $this->assertTrue($s2->fresh()->is_active);
        $this->assertFalse($s1->fresh()->is_active);
    }

    #[Test]
    public function test_only_one_display_setting_can_be_active_system_wide(): void
    {
        // Create 3 display setting presets in database
        $preset1 = DisplaySetting::create(['name' => 'Minimal White', 'is_active' => true]);
        $preset2 = DisplaySetting::create(['name' => 'Lower Third Yellow', 'is_active' => false]);
        $preset3 = DisplaySetting::create(['name' => 'Neon Broadcast', 'is_active' => false]);

        // Assert initial state: exactly 1 active setting
        $this->assertEquals(1, DisplaySetting::where('is_active', true)->count());
        $this->assertEquals($preset1->id, DisplaySetting::getActiveSetting()->id);

        // Activate preset2
        $preset2->activate();

        // Assert system-wide active count strictly equals 1
        $this->assertEquals(1, DisplaySetting::where('is_active', true)->count());
        $this->assertTrue($preset2->fresh()->is_active);
        $this->assertFalse($preset1->fresh()->is_active);
        $this->assertFalse($preset3->fresh()->is_active);

        // Perform PUT update on active setting via API
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/display/settings', ['font_size' => 80]);

        // Assert system-wide active count strictly remains 1
        $this->assertEquals(1, DisplaySetting::where('is_active', true)->count());
        $this->assertEquals($preset2->id, DisplaySetting::getActiveSetting()->id);
        $this->assertEquals(80, DisplaySetting::getActiveSetting()->font_size);
    }

    #[Test]
    public function test_can_get_display_presets_list(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        DisplaySetting::create(['name' => 'Preset 1', 'is_active' => true]);
        DisplaySetting::create(['name' => 'Preset 2', 'is_active' => false]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/display/presets');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function test_can_create_new_display_preset(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/display/presets', [
                'name' => 'Neon Broadcast',
                'font_size' => 56,
                'text_color' => '#00EEEE',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'Neon Broadcast',
                    'font_size' => 56,
                    'text_color' => '#00EEEE',
                    'is_active' => false,
                ],
            ]);

        $this->assertDatabaseHas('display_settings', [
            'name' => 'Neon Broadcast',
            'font_size' => 56,
        ]);
    }

    #[Test]
    public function test_can_update_existing_display_preset(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $preset = DisplaySetting::create([
            'name' => 'Original Preset',
            'font_size' => 40,
            'is_active' => false,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/display/presets/{$preset->id}", [
                'name' => 'Updated Preset Name',
                'font_size' => 64,
                'text_color' => '#FF0055',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Display preset updated successfully.',
                'data' => [
                    'id' => $preset->id,
                    'name' => 'Updated Preset Name',
                    'font_size' => 64,
                    'text_color' => '#FF0055',
                ],
            ]);

        $this->assertDatabaseHas('display_settings', [
            'id' => $preset->id,
            'name' => 'Updated Preset Name',
            'font_size' => 64,
        ]);
    }

    #[Test]
    public function test_can_activate_display_preset_and_broadcast_event(): void
    {
        Event::fake();

        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $preset1 = DisplaySetting::create(['name' => 'Default Style', 'is_active' => true, 'font_size' => 48]);
        $preset2 = DisplaySetting::create(['name' => 'Yellow Box', 'is_active' => false, 'font_size' => 60]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/display/presets/{$preset2->id}/activate");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Display preset activated and broadcasted successfully.',
                'data' => [
                    'id' => $preset2->id,
                    'is_active' => true,
                    'font_size' => 60,
                ],
            ]);

        $this->assertEquals(1, DisplaySetting::where('is_active', true)->count());
        $this->assertTrue($preset2->fresh()->is_active);
        $this->assertFalse($preset1->fresh()->is_active);

        Event::assertDispatched(DisplaySettingsUpdatedEvent::class, function ($event) use ($preset2) {
            return $event->payload['id'] === $preset2->id && $event->payload['font_size'] === 60;
        });
    }

    #[Test]
    public function test_cannot_delete_currently_active_display_preset(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $activePreset = DisplaySetting::create(['name' => 'Active Theme', 'is_active' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/display/presets/{$activePreset->id}");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot delete the currently active display preset.',
            ]);

        $this->assertDatabaseHas('display_settings', ['id' => $activePreset->id]);
    }

    #[Test]
    public function test_can_delete_inactive_display_preset(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        DisplaySetting::create(['name' => 'Active Theme', 'is_active' => true]);
        $inactivePreset = DisplaySetting::create(['name' => 'Old Theme', 'is_active' => false]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/display/presets/{$inactivePreset->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Display preset deleted successfully.',
            ]);

        $this->assertDatabaseMissing('display_settings', ['id' => $inactivePreset->id]);
    }
}
