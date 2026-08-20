<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add invite_code to organizations table
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('invite_code', 16)->nullable()->unique()->after('slug');
        });

        // 2. Add status to organization_user pivot table
        Schema::table('organization_user', function (Blueprint $table) {
            $table->enum('status', ['ACTIVE', 'PENDING', 'INACTIVE'])->default('ACTIVE')->after('role');
        });

        // 3. Populate invite_code for existing organizations
        $orgs = DB::table('organizations')->get();
        foreach ($orgs as $org) {
            $code = 'PL-'.strtoupper(Str::random(6));
            while (DB::table('organizations')->where('invite_code', $code)->exists()) {
                $code = 'PL-'.strtoupper(Str::random(6));
            }
            DB::table('organizations')->where('id', $org->id)->update([
                'invite_code' => $code,
            ]);
        }

        // 4. Update default admin user role to SUPER_ADMIN if needed
        $admin = DB::table('users')->where('email', 'admin@pentaslirik.local')->first();
        if ($admin) {
            DB::table('users')->where('id', $admin->id)->update(['role' => 'ADMIN']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_user', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('invite_code');
        });
    }
};
