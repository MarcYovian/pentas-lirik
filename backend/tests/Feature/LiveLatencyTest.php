<?php

namespace Tests\Feature;

use App\Events\DisplayUpdateEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LiveLatencyTest extends TestCase
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
    public function test_live_display_api_response_latency_is_under_100ms(): void
    {
        Event::fake();

        $payload = [
            'text' => 'Testing ultra-low latency broadcasting performance',
            'chunk_id' => 1,
            'song_id' => 1,
            'song_title' => 'Latency Test Song',
            'label' => '[VERSE 1]',
        ];

        $startTime = microtime(true);

        $response = $this->postJson('/api/v1/live/display', $payload);

        $endTime = microtime(true);
        $durationMs = ($endTime - $startTime) * 1000;

        $response->assertOk();

        Event::assertDispatched(DisplayUpdateEvent::class);

        // Assert response time is under 100ms threshold
        $this->assertLessThan(100, $durationMs, "Live display broadcast API latency should be < 100ms (Actual: {$durationMs}ms)");
    }

    #[Test]
    public function test_public_live_state_fetch_latency_is_under_50ms(): void
    {
        $startTime = microtime(true);

        $response = $this->getJson('/api/v1/state/live');

        $endTime = microtime(true);
        $durationMs = ($endTime - $startTime) * 1000;

        $response->assertOk();

        // Assert state fetch latency is under 50ms
        $this->assertLessThan(50, $durationMs, "Public live state fetch latency should be < 50ms (Actual: {$durationMs}ms)");
    }
}
