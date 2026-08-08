<?php

namespace Tests\Feature;

use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SongApiTest extends TestCase
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
    public function test_can_list_songs(): void
    {
        Song::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/songs');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'artist', 'created_at', 'updated_at'],
                ],
            ]);
    }

    #[Test]
    public function test_can_search_songs_by_title_or_artist(): void
    {
        Song::create(['title' => 'Amazing Grace', 'artist' => 'John Newton']);
        Song::create(['title' => 'Cornerstone', 'artist' => 'Hillsong']);

        $response = $this->getJson('/api/v1/songs?q=Grace');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Amazing Grace');
    }

    #[Test]
    public function test_can_create_song_with_raw_lyrics(): void
    {
        $payload = [
            'title' => 'How Great Thou Art',
            'artist' => 'Carl Boberg',
            'lyrics' => "[VERSE 1]\nO Lord my God, when I in awesome wonder\n[CHORUS]\nThen sings my soul, my Savior God to Thee",
        ];

        $response = $this->postJson('/api/v1/songs', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'How Great Thou Art')
            ->assertJsonCount(2, 'data.lyric_chunks')
            ->assertJsonPath('data.lyric_chunks.0.label', '[VERSE 1]')
            ->assertJsonPath('data.lyric_chunks.1.label', '[CHORUS]');

        $this->assertDatabaseHas('songs', ['title' => 'How Great Thou Art']);
        $this->assertDatabaseHas('lyric_chunks', ['label' => '[VERSE 1]']);
    }

    #[Test]
    public function test_can_create_song_with_lyrics_raw_param(): void
    {
        $payload = [
            'title' => 'Kami Unjukkan',
            'artist' => 'Lagu Gereja',
            'lyrics_raw' => "[BAIT 1]\nKami unjukkan kami sembahkan\nkebebasan dan kemerdekaan.\n\n[BAIT 2]\nIngatan, budi, kehendak hati\nkami serahkan pada-Mu, Tuhan.",
        ];

        $response = $this->postJson('/api/v1/songs', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Kami Unjukkan')
            ->assertJsonCount(2, 'data.lyric_chunks')
            ->assertJsonPath('data.lyric_chunks.0.label', '[BAIT 1]')
            ->assertJsonPath('data.lyric_chunks.1.label', '[BAIT 2]');

        $this->assertDatabaseHas('songs', ['title' => 'Kami Unjukkan']);
        $this->assertDatabaseHas('lyric_chunks', ['label' => '[BAIT 1]']);
    }

    #[Test]
    public function test_can_show_song_detail(): void
    {
        $song = Song::create(['title' => 'Test Song', 'artist' => 'Test Artist']);
        $song->lyricChunks()->create([
            'label' => '[VERSE 1]',
            'content' => 'Sample lyrics',
            'order' => 1,
        ]);

        $response = $this->getJson('/api/v1/songs/'.$song->id);

        $response->assertOk()
            ->assertJsonPath('data.id', $song->id)
            ->assertJsonCount(1, 'data.lyric_chunks');
    }

    #[Test]
    public function test_can_update_song_and_lyrics(): void
    {
        $song = Song::create(['title' => 'Old Title', 'artist' => 'Old Artist']);
        $song->lyricChunks()->create(['label' => '[VERSE 1]', 'content' => 'Old Content', 'order' => 1]);

        $updatePayload = [
            'title' => 'New Title',
            'artist' => 'New Artist',
            'lyrics' => "[CHORUS]\nNew Chorus Content",
        ];

        $response = $this->putJson('/api/v1/songs/'.$song->id, $updatePayload);

        $response->assertOk()
            ->assertJsonPath('data.title', 'New Title')
            ->assertJsonPath('data.lyric_chunks.0.label', '[CHORUS]');

        $this->assertDatabaseHas('songs', ['title' => 'New Title']);
        $this->assertDatabaseHas('lyric_chunks', ['label' => '[CHORUS]']);
        $this->assertDatabaseMissing('lyric_chunks', ['label' => '[VERSE 1]']);
    }

    #[Test]
    public function test_can_delete_song(): void
    {
        $song = Song::create(['title' => 'To Delete', 'artist' => 'Artist']);
        $song->lyricChunks()->create(['label' => '[VERSE 1]', 'content' => 'Content', 'order' => 1]);

        $response = $this->deleteJson('/api/v1/songs/'.$song->id);

        $response->assertOk()
            ->assertJson(['message' => 'Song deleted successfully.']);

        $this->assertDatabaseMissing('songs', ['id' => $song->id]);
        $this->assertDatabaseMissing('lyric_chunks', ['song_id' => $song->id]);
    }

    #[Test]
    public function test_unauthenticated_user_cannot_access_songs(): void
    {
        // Flush auth guard for unauthenticated request
        auth()->forgetGuards();

        $response = $this->getJson('/api/v1/songs');
        $response->assertUnauthorized();
    }
}
