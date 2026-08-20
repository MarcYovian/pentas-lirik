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

class OrganizationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $operator;

    protected Organization $orgA;

    protected Organization $orgB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->orgA = Organization::create([
            'name' => 'Kapel St Yohanes',
            'slug' => 'kapel-st-yohanes',
        ]);

        $this->orgB = Organization::create([
            'name' => 'Youth Ministry',
            'slug' => 'youth-ministry',
        ]);

        $this->admin = User::factory()->create([
            'role' => 'ADMIN',
        ]);
        $this->admin->organizations()->attach($this->orgA->id, ['role' => 'ADMIN', 'status' => 'ACTIVE']);

        $this->operator = User::factory()->create([
            'role' => 'OPERATOR',
        ]);
        $this->operator->organizations()->attach($this->orgA->id, ['role' => 'OPERATOR', 'status' => 'ACTIVE']);
    }

    public function test_user_can_list_their_organizations(): void
    {
        Sanctum::actingAs($this->operator);

        $response = $this->getJson('/api/v1/organizations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'kapel-st-yohanes');
    }

    public function test_admin_can_view_all_organizations(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/organizations');

        $response->assertOk();
        $slugs = collect($response->json('data'))->pluck('slug')->all();
        $this->assertContains('kapel-st-yohanes', $slugs);
        $this->assertContains('youth-ministry', $slugs);
    }

    public function test_user_can_create_new_organization(): void
    {
        Sanctum::actingAs($this->operator);

        $response = $this->postJson('/api/v1/organizations', [
            'name' => 'Acoustic Band Community',
            'description' => 'Komunitas Band Akustik',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Acoustic Band Community')
            ->assertJsonPath('data.slug', 'acoustic-band-community');

        $newOrgId = $response->json('data.id');

        // Operator should be attached as ADMIN with status ACTIVE to the newly created organization
        $this->assertDatabaseHas('organization_user', [
            'organization_id' => $newOrgId,
            'user_id' => $this->operator->id,
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_create_organization_validates_required_name(): void
    {
        Sanctum::actingAs($this->operator);

        $response = $this->postJson('/api/v1/organizations', [
            'name' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_organization_validates_unique_slug(): void
    {
        Sanctum::actingAs($this->operator);

        $response = $this->postJson('/api/v1/organizations', [
            'name' => 'Duplicate Name',
            'slug' => 'kapel-st-yohanes', // Already exists in setUp
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_songs_are_isolated_by_organization(): void
    {
        Song::create([
            'organization_id' => $this->orgA->id,
            'title' => 'Song of Org A',
            'artist' => 'Artist A',
        ]);

        Song::create([
            'organization_id' => $this->orgB->id,
            'title' => 'Song of Org B',
            'artist' => 'Artist B',
        ]);

        Sanctum::actingAs($this->operator);

        // Request with Org A scope
        $resA = $this->withHeader('X-Organization-Id', (string) $this->orgA->id)
            ->getJson('/api/v1/songs');

        $resA->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Song of Org A');

        // Request with Org B scope
        $resB = $this->withHeader('X-Organization-Id', (string) $this->orgB->id)
            ->getJson('/api/v1/songs');

        $resB->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Song of Org B');
    }

    public function test_song_search_is_isolated_to_organization_and_does_not_leak(): void
    {
        Song::create([
            'organization_id' => $this->orgA->id,
            'title' => 'Grace Greater Than Our Sin',
            'artist' => 'Julia Johnston',
        ]);

        Song::create([
            'organization_id' => $this->orgB->id,
            'title' => 'Grace Unmeasured',
            'artist' => 'Sovereign Grace',
        ]);

        Sanctum::actingAs($this->operator);

        // Search for 'Grace' specifically in Org A
        $resA = $this->withHeader('X-Organization-Id', (string) $this->orgA->id)
            ->getJson('/api/v1/songs?q=Grace');

        $resA->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Grace Greater Than Our Sin');
    }

    public function test_setlists_are_isolated_by_organization(): void
    {
        Setlist::create([
            'organization_id' => $this->orgA->id,
            'user_id' => $this->operator->id,
            'name' => 'Setlist Org A',
        ]);

        Setlist::create([
            'organization_id' => $this->orgB->id,
            'user_id' => $this->operator->id,
            'name' => 'Setlist Org B',
        ]);

        Sanctum::actingAs($this->operator);

        $resA = $this->withHeader('X-Organization-Id', (string) $this->orgA->id)
            ->getJson('/api/v1/setlists');

        $resA->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Setlist Org A');
    }

    public function test_display_presets_are_isolated_by_organization(): void
    {
        DisplaySetting::create([
            'organization_id' => $this->orgA->id,
            'name' => 'Preset Org A',
            'is_active' => true,
        ]);

        DisplaySetting::create([
            'organization_id' => $this->orgB->id,
            'name' => 'Preset Org B',
            'is_active' => false,
        ]);

        Sanctum::actingAs($this->operator);

        $resA = $this->withHeader('X-Organization-Id', (string) $this->orgA->id)
            ->getJson('/api/v1/display/presets');

        $resA->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Preset Org A');
    }

    public function test_empty_organization_returns_empty_songs_and_setlists_array(): void
    {
        $emptyOrg = Organization::create([
            'name' => 'Empty Org',
            'slug' => 'empty-org',
        ]);

        Sanctum::actingAs($this->operator);

        $res = $this->getJson("/api/v1/organizations/{$emptyOrg->id}/songs");
        $res->assertOk()->assertJsonCount(0, 'data');

        $resSetlists = $this->getJson("/api/v1/organizations/{$emptyOrg->id}/setlists");
        $resSetlists->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_public_can_view_organization_by_slug(): void
    {
        $response = $this->getJson('/api/v1/organizations/public/kapel-st-yohanes');

        $response->assertOk()
            ->assertJsonPath('data.slug', 'kapel-st-yohanes')
            ->assertJsonPath('data.name', 'Kapel St Yohanes');
    }
}
