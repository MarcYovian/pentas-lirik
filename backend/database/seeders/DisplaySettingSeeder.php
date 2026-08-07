<?php

namespace Database\Seeders;

use App\Models\DisplaySetting;
use Illuminate\Database\Seeder;

class DisplaySettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DisplaySetting::updateOrCreate(
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
    }
}
