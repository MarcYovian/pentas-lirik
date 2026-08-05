<?php

namespace Tests\Feature;

use App\Events\DisplayClearEvent;
use App\Events\DisplayUpdateEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class LiveControlApiTest extends TestCase
{
    use RefreshDatabase;

    private User $operator;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->operator = User::factory()->create(['role' => 'OPERATOR']);
        $this->token = $this->operator->createToken('test_token')->plainTextToken;
    }

    public function test_can_send_lyric_display_event_and_store_in_cache(): void
    {
        Event::fake();

        $payload = [
            'text' => 'Amazing grace! How sweet the sound',
            'chunk_id' => 10,
            'song_id' => 1,
            'song_title' => 'Amazing Grace',
            'label' => '[VERSE 1]',
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/v1/live/display', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.content', 'Amazing grace! How sweet the sound')
            ->assertJsonPath('data.song_title', 'Amazing Grace')
            ->assertJsonPath('data.type', 'lyric');

        Event::assertDispatched(DisplayUpdateEvent::class, function ($event) {
            return $event->payload['content'] === 'Amazing grace! How sweet the sound';
        });

        // Test public GET /api/v1/state/live returns updated state
        $stateResponse = $this->getJson('/api/v1/state/live');
        $stateResponse->assertStatus(200)
            ->assertJsonPath('data.content', 'Amazing grace! How sweet the sound');
    }

    public function test_can_send_clear_display_event(): void
    {
        Event::fake();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/v1/live/clear');

        $response->assertStatus(200)
            ->assertJsonPath('data.type', 'clear')
            ->assertJsonPath('data.content', null);

        Event::assertDispatched(DisplayClearEvent::class);

        // Test public GET /api/v1/state/live returns clear state
        $stateResponse = $this->getJson('/api/v1/state/live');
        $stateResponse->assertStatus(200)
            ->assertJsonPath('data.type', 'clear');
    }

    public function test_unauthenticated_user_cannot_trigger_live_display(): void
    {
        $response = $this->postJson('/api/v1/live/display', ['text' => 'Unauthorized']);
        $response->assertStatus(401);
    }
}
