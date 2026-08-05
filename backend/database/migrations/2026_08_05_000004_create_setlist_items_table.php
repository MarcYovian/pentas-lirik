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
        Schema::create('setlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('setlist_id')->constrained('setlists')->cascadeOnDelete();
            $table->foreignId('song_id')->constrained('songs')->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['setlist_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('setlist_items');
    }
};
