<?php

namespace Tests\Feature;

use App\Models\Setlist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SetlistApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'OPERATOR']);
        $this->token = $this->user->createToken('test_token')->plainTextToken;
    }

    #[Test]
    public function test_can_list_setlists(): void
    {
        Setlist::factory()->count(2)->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/v1/setlists');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function test_can_create_setlist(): void
    {
        $payload = ['name' => 'Sunday Service 10 AM'];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/v1/setlists', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Sunday Service 10 AM')
            ->assertJsonPath('data.user_id', $this->user->id);

        $this->assertDatabaseHas('setlists', ['name' => 'Sunday Service 10 AM']);
    }

    #[Test]
    public function test_can_show_setlist_details(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id, 'name' => 'Youth Gathering']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson("/api/v1/setlists/{$setlist->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $setlist->id)
            ->assertJsonPath('data.name', 'Youth Gathering');
    }

    #[Test]
    public function test_can_update_setlist_name(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id, 'name' => 'Old Name']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson("/api/v1/setlists/{$setlist->id}", ['name' => 'Updated Name']);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('setlists', ['name' => 'Updated Name']);
    }

    #[Test]
    public function test_can_delete_setlist(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->deleteJson("/api/v1/setlists/{$setlist->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Setlist deleted successfully.']);

        $this->assertDatabaseMissing('setlists', ['id' => $setlist->id]);
    }

    #[Test]
    public function test_can_add_song_to_setlist(): void
    {
        $setlist = Setlist::factory()->create(['user_id' => $this->user->id]);
        $song = Song::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson("/api/v1/setlists/{$setlist->id}/items", ['song_id' => $song->id]);

        $response->assertStatus(201)
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

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->deleteJson("/api/v1/setlists/{$setlist->id}/items/{$item1->id}");

        $response->assertStatus(200)
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

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->putJson("/api/v1/setlists/{$setlist->id}/reorder", $reorderPayload);

        $response->assertStatus(200)
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
