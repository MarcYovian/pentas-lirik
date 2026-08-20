<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $regularOperator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => 'ADMIN']);
        $this->regularOperator = User::factory()->create(['role' => 'OPERATOR']);

        $org = Organization::create([
            'name' => 'Kapel St Yohanes',
            'slug' => 'kapel-st-yohanes',
        ]);
        $org->seedStarterPack();
        $this->regularOperator->organizations()->attach($org->id, ['role' => 'OPERATOR', 'status' => 'ACTIVE']);
    }

    public function test_super_admin_can_view_global_stats(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/super-admin/stats');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'total_organizations',
                        'total_users',
                        'total_songs',
                        'total_setlists',
                    ],
                    'organizations',
                ],
            ]);
    }

    public function test_regular_operator_cannot_view_super_admin_stats(): void
    {
        Sanctum::actingAs($this->regularOperator);

        $response = $this->getJson('/api/v1/super-admin/stats');

        $response->assertStatus(403);
    }
}
