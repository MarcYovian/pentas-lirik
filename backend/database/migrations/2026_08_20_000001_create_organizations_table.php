<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create organizations table
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Create organization_user pivot table
        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['ADMIN', 'OPERATOR'])->default('OPERATOR');
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
        });

        // 3. Add organization_id to songs table
        Schema::table('songs', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->after('id')->constrained('organizations')->cascadeOnDelete();
        });

        // 4. Add organization_id to setlists table
        Schema::table('setlists', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->after('id')->constrained('organizations')->cascadeOnDelete();
        });

        // 5. Add organization_id to display_settings table
        Schema::table('display_settings', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->after('id')->constrained('organizations')->cascadeOnDelete();
        });

        // 6. Data Migration: Create Default Organization & Attach Existing Records
        $now = now();
        $defaultOrgId = DB::table('organizations')->insertGetId([
            'name' => 'PentasLirik Main',
            'slug' => 'default',
            'description' => 'Default Organization',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Attach all existing users to default organization
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            DB::table('organization_user')->insertOrIgnore([
                'organization_id' => $defaultOrgId,
                'user_id' => $user->id,
                'role' => $user->role ?? 'OPERATOR',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Link existing songs, setlists, and display_settings to default organization
        DB::table('songs')->whereNull('organization_id')->update(['organization_id' => $defaultOrgId]);
        DB::table('setlists')->whereNull('organization_id')->update(['organization_id' => $defaultOrgId]);
        DB::table('display_settings')->whereNull('organization_id')->update(['organization_id' => $defaultOrgId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('display_settings', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn('organization_id');
        });

        Schema::table('setlists', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn('organization_id');
        });

        Schema::table('songs', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn('organization_id');
        });

        Schema::dropIfExists('organization_user');
        Schema::dropIfExists('organizations');
    }
};
