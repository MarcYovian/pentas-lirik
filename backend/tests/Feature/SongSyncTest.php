<?php

namespace Tests\Feature;

use App\Models\Setlist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SongSyncTest extends TestCase
{
    use RefreshDatabase;

    private User $operator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->operator = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($this->operator);
    }

    #[Test]
    public function unauthenticated_user_cannot_trigger_sync(): void
    {
        auth()->forgetGuards();

        $response = $this->postJson('/api/v1/songs/sync-remote', [
            'remote_url' => 'https://vps.pentaslirik.test',
            'conflict_strategy' => 'skip',
        ]);

        $response->assertUnauthorized();
    }

    #[Test]
    public function validation_fails_if_required_fields_missing(): void
    {
        $response = $this->postJson('/api/v1/songs/sync-remote', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['remote_url', 'conflict_strategy']);
    }

    #[Test]
    public function can_sync_songs_with_email_and_password_using_skip_strategy(): void
    {
        // Existing local song
        $existing = Song::create(['title' => 'Existing Song', 'artist' => 'Artist A']);
        $existing->lyricChunks()->create([
            'label' => '[VERSE 1]',
            'content' => 'Local content stay unchanged',
            'order' => 1,
        ]);

        $remoteUrl = 'https://vps.pentaslirik.test';

        Http::fake([
            "{$remoteUrl}/api/v1/auth/login" => Http::response([
                'token' => 'dummy_remote_token',
                'user' => ['name' => 'VPS Admin', 'email' => 'admin@vps.com'],
            ], 200),

            "{$remoteUrl}/api/v1/songs?page=1" => Http::response([
                'data' => [
                    [
                        'id' => 101,
                        'title' => 'Existing Song',
                        'artist' => 'Artist A',
                        'lyrics' => [
                            ['label' => '[VERSE 1]', 'content' => 'Remote updated content', 'order' => 1],
                        ],
                    ],
                    [
                        'id' => 102,
                        'title' => 'Brand New Remote Song',
                        'artist' => 'Artist B',
                        'lyrics' => [
                            ['label' => '[CHORUS]', 'content' => 'Glory glory hallelujah', 'order' => 1],
                        ],
                    ],
                ],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/songs/sync-remote', [
            'remote_url' => $remoteUrl,
            'email' => 'admin@vps.com',
            'password' => 'secret123',
            'conflict_strategy' => 'skip',
            'sync_songs' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.total_fetched', 2)
            ->assertJsonPath('data.created', 1)
            ->assertJsonPath('data.skipped', 1)
            ->assertJsonPath('data.updated', 0)
            ->assertJsonPath('data.songs.created', 1);

        // Verify Brand New Song is created
        $this->assertDatabaseHas('songs', ['title' => 'Brand New Remote Song']);
        $this->assertDatabaseHas('lyric_chunks', ['content' => 'Glory glory hallelujah']);

        // Verify Existing Song stayed unchanged
        $this->assertDatabaseHas('lyric_chunks', ['content' => 'Local content stay unchanged']);
        $this->assertDatabaseMissing('lyric_chunks', ['content' => 'Remote updated content']);
    }

    #[Test]
    public function can_sync_songs_with_api_token_using_overwrite_strategy(): void
    {
        // Existing local song
        $existing = Song::create(['title' => 'Existing Song', 'artist' => 'Artist A']);
        $existing->lyricChunks()->create([
            'label' => '[VERSE 1]',
            'content' => 'Old content to be replaced',
            'order' => 1,
        ]);

        $remoteUrl = 'https://vps.pentaslirik.test';

        Http::fake([
            "{$remoteUrl}/api/v1/songs?page=1" => Http::response([
                'data' => [
                    [
                        'id' => 101,
                        'title' => 'Existing Song',
                        'artist' => 'Artist A',
                        'lyrics' => [
                            ['label' => '[CHORUS]', 'content' => 'Brand new remote lyric chunk', 'order' => 1],
                        ],
                    ],
                ],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/songs/sync-remote', [
            'remote_url' => $remoteUrl,
            'api_token' => 'sanctum_token_direct',
            'conflict_strategy' => 'overwrite',
            'sync_songs' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.total_fetched', 1)
            ->assertJsonPath('data.created', 0)
            ->assertJsonPath('data.skipped', 0)
            ->assertJsonPath('data.updated', 1)
            ->assertJsonPath('data.songs.updated', 1);

        // Verify Existing Song has its lyric chunks overwritten
        $this->assertDatabaseHas('lyric_chunks', ['content' => 'Brand new remote lyric chunk']);
        $this->assertDatabaseMissing('lyric_chunks', ['content' => 'Old content to be replaced']);
    }

    #[Test]
    public function can_sync_setlists_and_map_foreign_key_song_ids_correctly(): void
    {
        $remoteUrl = 'https://vps.pentaslirik.test';

        Http::fake([
            "{$remoteUrl}/api/v1/songs?page=1" => Http::response([
                'data' => [
                    [
                        'id' => 999, // Remote Song ID
                        'title' => 'Song for Setlist',
                        'artist' => 'Worship Team',
                        'lyrics' => [
                            ['label' => '[CHORUS]', 'content' => 'Holy is the Lord', 'order' => 1],
                        ],
                    ],
                ],
                'meta' => ['current_page' => 1, 'last_page' => 1],
            ], 200),

            "{$remoteUrl}/api/v1/setlists" => Http::response([
                'data' => [
                    [
                        'id' => 50,
                        'name' => 'Sunday Service Worship',
                        'items' => [
                            [
                                'id' => 1001,
                                'song_id' => 999, // References remote song 999
                                'order' => 1,
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/songs/sync-remote', [
            'remote_url' => $remoteUrl,
            'api_token' => 'sanctum_token_direct',
            'conflict_strategy' => 'overwrite',
            'sync_songs' => true,
            'sync_setlists' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.songs.created', 1)
            ->assertJsonPath('data.setlists.created', 1);

        $localSong = Song::where('title', 'Song for Setlist')->first();
        $this->assertNotNull($localSong);

        $localSetlist = Setlist::where('name', 'Sunday Service Worship')->first();
        $this->assertNotNull($localSetlist);
        $this->assertCount(1, $localSetlist->setlistItems);
        $this->assertEquals($localSong->id, $localSetlist->setlistItems->first()->song_id);
    }

    #[Test]
    public function can_sync_obs_display_presets(): void
    {
        $remoteUrl = 'https://vps.pentaslirik.test';

        Http::fake([
            "{$remoteUrl}/api/v1/display/presets" => Http::response([
                'data' => [
                    [
                        'id' => 12,
                        'name' => 'Lower Third Stage Preset',
                        'font_size' => 52,
                        'font_weight' => 'black',
                        'text_transform' => 'uppercase',
                        'align_items' => 'center',
                        'text_color' => '#FFDD00',
                        'text_shadow_color' => 'rgba(0,0,0,0.9)',
                        'text_shadow_blur' => 12,
                        'text_stroke_width' => 2,
                        'text_stroke_color' => '#000000',
                        'show_background' => true,
                        'background_color' => 'rgba(10,10,20,0.85)',
                        'background_opacity' => 85,
                        'padding_vertical' => 20,
                        'padding_horizontal' => 40,
                        'border_radius' => 16,
                        'max_width' => '90%',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/songs/sync-remote', [
            'remote_url' => $remoteUrl,
            'api_token' => 'sanctum_token_direct',
            'conflict_strategy' => 'overwrite',
            'sync_songs' => false,
            'sync_setlists' => false,
            'sync_presets' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.presets.created', 1);

        $this->assertDatabaseHas('display_settings', [
            'name' => 'Lower Third Stage Preset',
            'font_size' => 52,
            'text_color' => '#FFDD00',
            'is_active' => false,
        ]);
    }
}
