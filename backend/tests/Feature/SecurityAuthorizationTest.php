<?php

namespace Tests\Feature;

use App\Models\DisplaySetting;
use App\Models\Organization;
use App\Models\Setlist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $userOrgA;

    protected User $adminOrgA;

    protected User $userOrgB;

    protected User $adminOrgB;

    protected User $pendingUser;

    protected Organization $orgA;

    protected Organization $orgB;

    protected Song $songOrgA;

    protected Song $songOrgB;

    protected Setlist $setlistOrgA;

    protected Setlist $setlistOrgB;

    protected DisplaySetting $presetOrgA;

    protected DisplaySetting $presetOrgB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a']);
        $this->orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b']);

        $this->userOrgA = User::factory()->create(['role' => 'OPERATOR']);
        $this->userOrgA->organizations()->attach($this->orgA->id, ['role' => 'OPERATOR', 'status' => 'ACTIVE']);

        $this->adminOrgA = User::factory()->create(['role' => 'OPERATOR']);
        $this->adminOrgA->organizations()->attach($this->orgA->id, ['role' => 'ADMIN', 'status' => 'ACTIVE']);

        $this->userOrgB = User::factory()->create(['role' => 'OPERATOR']);
        $this->userOrgB->organizations()->attach($this->orgB->id, ['role' => 'OPERATOR', 'status' => 'ACTIVE']);

        $this->adminOrgB = User::factory()->create(['role' => 'OPERATOR']);
        $this->adminOrgB->organizations()->attach($this->orgB->id, ['role' => 'ADMIN', 'status' => 'ACTIVE']);

        $this->pendingUser = User::factory()->create(['role' => 'OPERATOR']);
        $this->pendingUser->organizations()->attach($this->orgA->id, ['role' => 'OPERATOR', 'status' => 'PENDING']);

        $this->songOrgA = Song::create(['organization_id' => $this->orgA->id, 'title' => 'Song Org A', 'artist' => 'Artist A']);
        $this->songOrgB = Song::create(['organization_id' => $this->orgB->id, 'title' => 'Song Org B', 'artist' => 'Artist B']);

        $this->setlistOrgA = Setlist::create(['organization_id' => $this->orgA->id, 'user_id' => $this->userOrgA->id, 'name' => 'Setlist Org A']);
        $this->setlistOrgB = Setlist::create(['organization_id' => $this->orgB->id, 'user_id' => $this->userOrgB->id, 'name' => 'Setlist Org B']);

        $this->presetOrgA = DisplaySetting::create(['organization_id' => $this->orgA->id, 'name' => 'Preset A', 'is_active' => false]);
        $this->presetOrgB = DisplaySetting::create(['organization_id' => $this->orgB->id, 'name' => 'Preset B', 'is_active' => false]);
    }

    public function test_cross_tenant_idor_user_a_cannot_update_song_of_org_b(): void
    {
        Sanctum::actingAs($this->userOrgA);

        $response = $this->putJson("/api/v1/songs/{$this->songOrgB->id}", [
            'title' => 'Hacked Title',
            'artist' => 'Hacked Artist',
        ]);

        $response->assertForbidden();
        $this->assertEquals('Song Org B', $this->songOrgB->fresh()->title);
    }

    public function test_cross_tenant_idor_user_a_cannot_delete_song_of_org_b(): void
    {
        Sanctum::actingAs($this->userOrgA);

        $response = $this->deleteJson("/api/v1/songs/{$this->songOrgB->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('songs', ['id' => $this->songOrgB->id]);
    }

    public function test_cross_tenant_user_a_cannot_inject_song_into_org_b(): void
    {
        Sanctum::actingAs($this->userOrgA);

        $response = $this->postJson('/api/v1/songs', [
            'organization_id' => $this->orgB->id,
            'title' => 'Injected Song',
            'artist' => 'Hacker Artist',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('songs', ['title' => 'Injected Song']);
    }

    public function test_cross_tenant_idor_user_a_cannot_modify_setlist_of_org_b(): void
    {
        Sanctum::actingAs($this->userOrgA);

        // Cannot update setlist name
        $resUpdate = $this->putJson("/api/v1/setlists/{$this->setlistOrgB->id}", [
            'name' => 'Hijacked Setlist',
        ]);
        $resUpdate->assertForbidden();

        // Cannot add item to setlist of Org B
        $resAdd = $this->postJson("/api/v1/setlists/{$this->setlistOrgB->id}/items", [
            'song_id' => $this->songOrgA->id,
        ]);
        $resAdd->assertForbidden();

        // Cannot delete setlist of Org B
        $resDelete = $this->deleteJson("/api/v1/setlists/{$this->setlistOrgB->id}");
        $resDelete->assertForbidden();

        $this->assertEquals('Setlist Org B', $this->setlistOrgB->fresh()->name);
    }

    public function test_cross_tenant_user_a_cannot_inject_setlist_into_org_b(): void
    {
        Sanctum::actingAs($this->userOrgA);

        $response = $this->postJson('/api/v1/setlists', [
            'organization_id' => $this->orgB->id,
            'name' => 'Injected Setlist',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('setlists', ['name' => 'Injected Setlist']);
    }

    public function test_cross_tenant_idor_user_a_cannot_activate_or_delete_preset_of_org_b(): void
    {
        Sanctum::actingAs($this->userOrgA);

        // Cannot activate preset of Org B
        $resActivate = $this->postJson("/api/v1/display/presets/{$this->presetOrgB->id}/activate");
        $resActivate->assertForbidden();

        // Cannot delete preset of Org B
        $resDelete = $this->deleteJson("/api/v1/display/presets/{$this->presetOrgB->id}");
        $resDelete->assertForbidden();
    }

    public function test_cross_tenant_admin_a_cannot_manage_members_in_org_b(): void
    {
        Sanctum::actingAs($this->adminOrgA);

        // Admin of Org A cannot view members in Org B
        $resView = $this->getJson("/api/v1/organizations/{$this->orgB->id}/members");
        $resView->assertOk()->assertJsonPath('is_admin', false);

        // Admin of Org A cannot add member to Org B
        $resAdd = $this->postJson("/api/v1/organizations/{$this->orgB->id}/members", [
            'name' => 'Injected User',
            'email' => 'inject@example.com',
            'password' => 'password123',
            'role' => 'OPERATOR',
        ]);
        $resAdd->assertForbidden();

        // Admin of Org A cannot update organization details of Org B
        $resUpdateOrg = $this->putJson("/api/v1/organizations/{$this->orgB->id}", [
            'name' => 'Hijacked Org Name',
        ]);
        $resUpdateOrg->assertForbidden();
    }

    public function test_pending_unapproved_user_cannot_broadcast_live_display(): void
    {
        Sanctum::actingAs($this->pendingUser);

        $response = $this->postJson('/api/v1/live/send-lyric', [
            'type' => 'lyric',
            'text' => 'Unauthorized broadcast test',
        ]);

        $response->assertForbidden();
    }

    public function test_privilege_escalation_prevention_on_profile_update(): void
    {
        Sanctum::actingAs($this->userOrgA);

        // Attempt to elevate role to ADMIN or SUPER_ADMIN via profile payload
        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'Hacker Name',
            'email' => 'hacker@example.com',
            'role' => 'ADMIN',
            'is_admin' => true,
        ]);

        $response->assertOk();
        $this->assertEquals('OPERATOR', $this->userOrgA->fresh()->role);
    }

    public function test_sql_injection_payload_is_sanitized_safely(): void
    {
        Sanctum::actingAs($this->userOrgA);

        $sqlPayload = "' OR '1'='1' --";

        $response = $this->getJson('/api/v1/songs?q='.urlencode($sqlPayload));

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
