<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizationMemberTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $operator;

    protected Organization $org;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::create([
            'name' => 'Kapel St Yohanes',
            'slug' => 'kapel-st-yohanes',
        ]);

        $this->admin = User::factory()->create(['role' => 'ADMIN']);
        $this->admin->organizations()->attach($this->org->id, ['role' => 'ADMIN', 'status' => 'ACTIVE']);

        $this->operator = User::factory()->create(['role' => 'OPERATOR']);
        $this->operator->organizations()->attach($this->org->id, ['role' => 'OPERATOR', 'status' => 'ACTIVE']);
    }

    public function test_user_can_join_organization_via_invite_code(): void
    {
        $newUser = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($newUser);

        $response = $this->postJson('/api/v1/organizations/join', [
            'invite_code' => $this->org->invite_code,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.slug', 'kapel-st-yohanes');

        $this->assertDatabaseHas('organization_user', [
            'organization_id' => $this->org->id,
            'user_id' => $newUser->id,
            'status' => 'PENDING',
        ]);
    }

    public function test_cannot_join_with_invalid_invite_code(): void
    {
        $newUser = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($newUser);

        $response = $this->postJson('/api/v1/organizations/join', [
            'invite_code' => 'INVALID-CODE-99',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['invite_code']);
    }

    public function test_joining_already_active_organization_is_idempotent(): void
    {
        Sanctum::actingAs($this->operator);

        $response = $this->postJson('/api/v1/organizations/join', [
            'invite_code' => $this->org->invite_code,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Anda sudah menjadi anggota aktif di '.$this->org->name.'.');
    }

    public function test_admin_can_list_members_and_pending_count(): void
    {
        $pendingUser = User::factory()->create(['role' => 'OPERATOR']);
        $pendingUser->organizations()->attach($this->org->id, ['role' => 'OPERATOR', 'status' => 'PENDING']);

        Sanctum::actingAs($this->admin);

        $response = $this->getJson("/api/v1/organizations/{$this->org->id}/members");

        $response->assertOk()
            ->assertJsonPath('pending_count', 1)
            ->assertJsonPath('is_admin', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_directly_add_new_member(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/organizations/{$this->org->id}/members", [
            'name' => 'Michael Angelo',
            'email' => 'michael@kapel.local',
            'password' => 'password123',
            'role' => 'OPERATOR',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('organization_user', [
            'organization_id' => $this->org->id,
            'role' => 'OPERATOR',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_add_member_validates_required_fields(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/organizations/{$this->org->id}/members", [
            'name' => '',
            'email' => 'not-an-email',
            'password' => '123', // min 6
            'role' => 'INVALID_ROLE',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    public function test_non_admin_cannot_add_or_manage_members(): void
    {
        Sanctum::actingAs($this->operator);

        $resAdd = $this->postJson("/api/v1/organizations/{$this->org->id}/members", [
            'name' => 'Should Fail',
            'email' => 'fail@kapel.local',
            'password' => 'password123',
            'role' => 'OPERATOR',
        ]);
        $resAdd->assertForbidden();

        $resRegen = $this->postJson("/api/v1/organizations/{$this->org->id}/regenerate-invite");
        $resRegen->assertForbidden();
    }

    public function test_admin_can_approve_pending_member(): void
    {
        $pendingUser = User::factory()->create(['role' => 'OPERATOR']);
        $pendingUser->organizations()->attach($this->org->id, ['role' => 'OPERATOR', 'status' => 'PENDING']);

        Sanctum::actingAs($this->admin);

        $response = $this->patchJson("/api/v1/organizations/{$this->org->id}/members/{$pendingUser->id}/status", [
            'status' => 'ACTIVE',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('organization_user', [
            'organization_id' => $this->org->id,
            'user_id' => $pendingUser->id,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_admin_can_remove_member(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->deleteJson("/api/v1/organizations/{$this->org->id}/members/{$this->operator->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('organization_user', [
            'organization_id' => $this->org->id,
            'user_id' => $this->operator->id,
        ]);
    }

    public function test_cannot_remove_last_admin_from_organization(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->deleteJson("/api/v1/organizations/{$this->org->id}/members/{$this->admin->id}");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Tidak dapat menghapus satu-satunya Admin di organisasi ini.');
    }

    public function test_admin_can_regenerate_invite_code(): void
    {
        $oldCode = $this->org->invite_code;

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/organizations/{$this->org->id}/regenerate-invite");

        $response->assertOk()
            ->assertJsonStructure(['invite_code']);

        $newCode = $response->json('invite_code');
        $this->assertNotEquals($oldCode, $newCode);
        $this->assertEquals($newCode, $this->org->fresh()->invite_code);
    }

    public function test_can_get_songs_and_setlists_by_organization(): void
    {
        $this->org->seedStarterPack();

        Sanctum::actingAs($this->operator);

        // Get songs of organization
        $songRes = $this->getJson("/api/v1/organizations/{$this->org->id}/songs");
        $songRes->assertOk()
            ->assertJsonCount(3, 'data');

        // Get presets of organization
        $presetRes = $this->getJson("/api/v1/organizations/{$this->org->id}/presets");
        $presetRes->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
