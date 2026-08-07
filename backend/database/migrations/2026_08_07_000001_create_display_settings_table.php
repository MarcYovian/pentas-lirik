<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('display_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Style');
            $table->boolean('is_active')->default(true)->index();

            // Font & Typography
            $table->integer('font_size')->default(48);
            $table->string('font_weight')->default('800');
            $table->string('text_transform')->default('uppercase');
            $table->string('align_items')->default('center');

            // Text Color & Effects
            $table->string('text_color')->default('#FFFFFF');
            $table->string('text_shadow_color')->default('rgba(0,0,0,0.8)');
            $table->integer('text_shadow_blur')->default(10);
            $table->integer('text_stroke_width')->default(0);
            $table->string('text_stroke_color')->default('#000000');

            // Background Box Settings
            $table->boolean('show_background')->default(false);
            $table->string('background_color')->default('rgba(0,0,0,0.6)');
            $table->integer('background_opacity')->default(60);
            $table->integer('padding_vertical')->default(16);
            $table->integer('padding_horizontal')->default(32);
            $table->integer('border_radius')->default(12);
            $table->string('max_width')->default('max-w-7xl');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('display_settings');
    }
};
