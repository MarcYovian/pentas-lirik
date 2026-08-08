<?php

namespace Tests\Feature;

use App\Models\Setlist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SetlistApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($this->user);
    }

    #[Test]
    public function test_can_list_setlists(): void
    {
        Setlist::factory()->count(2)->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/api/v1/setlists');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function test_can_create_setlist(): void
    {
        $payload = ['name' => 'Sunday Service 10 AM'];

        $response = $this->postJson('/api/v1/setlists', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Sunday Service 10 AM')
            ->assertJsonPath('data.user_id', $this->user->id);

        $this->assertDatabaseHas('setlists', ['name' => 'Sunday Service 10 AM']);
    }

    #[Test]
    public function test_can_create_setlist_with_embedded_items(): void
    {
        $song1 = Song::factory()->create(['title' => 'Amazing Grace']);
        $song2 = Song::factory()->create(['title' => 'Cornerstone']);

        $payload = [
            'name' => 'Ibadah Minggu Pagi',
            'items' => [
                ['song_id' => $song1->id, 'type' => 'song'],
                ['song_id' => $song2->id, 'type' => 'song'],
            ],
        ];

        $response = $this->postJson('/api/v1/setlists', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Ibadah Minggu Pagi')
            ->assertJsonCount(2, 'data.items')
            ->assertJsonPath('data.items.0.song_id', $song1->id)
            ->assertJsonPath('data.items.1.song_id', $song2->id);

        $this->assertDatabaseHas('setlists', ['name' => 'Ibadah Minggu Pagi']);
        $this->assertDatabaseHas('setlist_items', ['song_id' => $song1->id, 'order' => 1]);
        $this->assertDatabaseHas('setlist_items', ['song_id' => $song2->id, 'order' => 2]);
    }

    #[Test]
    public function test_can_show_setlist_details(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id, 'name' => 'Youth Gathering']);

        $response = $this->getJson("/api/v1/setlists/{$setlist->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $setlist->id)
            ->assertJsonPath('data.name', 'Youth Gathering');
    }

    #[Test]
    public function test_can_update_setlist_name_and_sync_items(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id, 'name' => 'Old Name']);
        $songA = Song::factory()->create();
        $songB = Song::factory()->create();

        $updatePayload = [
            'name' => 'Updated Name',
            'items' => [
                ['song_id' => $songA->id, 'type' => 'song'],
                ['song_id' => $songB->id, 'type' => 'song'],
            ],
        ];

        $response = $this->putJson("/api/v1/setlists/{$setlist->id}", $updatePayload);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonCount(2, 'data.items')
            ->assertJsonPath('data.items.0.song_id', $songA->id)
            ->assertJsonPath('data.items.1.song_id', $songB->id);

        $this->assertDatabaseHas('setlists', ['name' => 'Updated Name']);
        $this->assertDatabaseHas('setlist_items', ['setlist_id' => $setlist->id, 'song_id' => $songA->id]);
    }

    #[Test]
    public function test_can_delete_setlist(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id]);

        $response = $this->deleteJson("/api/v1/setlists/{$setlist->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Setlist deleted successfully.']);

        $this->assertDatabaseMissing('setlists', ['id' => $setlist->id]);
    }

    #[Test]
    public function test_can_add_song_to_setlist(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id]);
        $song = Song::factory()->create();

        $response = $this->postJson("/api/v1/setlists/{$setlist->id}/items", ['song_id' => $song->id]);

        $response->assertCreated()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.song_id', $song->id)
            ->assertJsonPath('data.items.0.order', 1);

        $this->assertDatabaseHas('setlist_items', [
            'setlist_id' => $setlist->id,
            'song_id' => $song->id,
            'order' => 1,
        ]);
    }

    #[Test]
    public function test_can_remove_item_from_setlist(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id]);
        $song1 = Song::factory()->create();
        $song2 = Song::factory()->create();

        $item1 = $setlist->setlistItems()->create(['song_id' => $song1->id, 'order' => 1]);
        $item2 = $setlist->setlistItems()->create(['song_id' => $song2->id, 'order' => 2]);

        $response = $this->deleteJson("/api/v1/setlists/{$setlist->id}/items/{$item1->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.song_id', $song2->id)
            ->assertJsonPath('data.items.0.order', 1);

        $this->assertDatabaseMissing('setlist_items', ['id' => $item1->id]);
        $this->assertDatabaseHas('setlist_items', ['id' => $item2->id, 'order' => 1]);
    }

    #[Test]
    public function test_can_reorder_setlist_items(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id]);
        $songA = Song::factory()->create();
        $songB = Song::factory()->create();
        $songC = Song::factory()->create();

        $item1 = $setlist->setlistItems()->create(['song_id' => $songA->id, 'order' => 1]);
        $item2 = $setlist->setlistItems()->create(['song_id' => $songB->id, 'order' => 2]);
        $item3 = $setlist->setlistItems()->create(['song_id' => $songC->id, 'order' => 3]);

        // Reorder items: item3 first, then item1, then item2
        $reorderPayload = [
            'item_ids' => [$item3->id, $item1->id, $item2->id],
        ];

        $response = $this->putJson("/api/v1/setlists/{$setlist->id}/reorder", $reorderPayload);

        $response->assertOk()
            ->assertJsonPath('data.items.0.id', $item3->id)
            ->assertJsonPath('data.items.0.order', 1)
            ->assertJsonPath('data.items.1.id', $item1->id)
            ->assertJsonPath('data.items.1.order', 2)
            ->assertJsonPath('data.items.2.id', $item2->id)
            ->assertJsonPath('data.items.2.order', 3);

        $this->assertDatabaseHas('setlist_items', ['id' => $item3->id, 'order' => 1]);
        $this->assertDatabaseHas('setlist_items', ['id' => $item1->id, 'order' => 2]);
        $this->assertDatabaseHas('setlist_items', ['id' => $item2->id, 'order' => 3]);
    }
}
