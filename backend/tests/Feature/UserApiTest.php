<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $operator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'ADMIN']);
        $this->operator = User::factory()->create(['role' => 'OPERATOR']);
    }

    #[Test]
    public function test_admin_can_list_users(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/users');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function test_admin_can_create_new_user(): void
    {
        Sanctum::actingAs($this->admin);

        $payload = [
            'name' => 'New Operator',
            'email' => 'newop@pentaslirik.local',
            'password' => 'secret123',
            'role' => 'operator',
        ];

        $response = $this->postJson('/api/v1/users', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'New Operator')
            ->assertJsonPath('data.role', 'operator');

        $this->assertDatabaseHas('users', ['email' => 'newop@pentaslirik.local']);
    }

    #[Test]
    public function test_admin_can_update_user_role(): void
    {
        Sanctum::actingAs($this->admin);

        $targetUser = User::factory()->create(['role' => 'OPERATOR']);

        $response = $this->putJson("/api/v1/users/{$targetUser->id}", ['role' => 'admin']);

        $response->assertOk()
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', ['id' => $targetUser->id, 'role' => 'ADMIN']);
    }

    #[Test]
    public function test_admin_can_delete_user(): void
    {
        Sanctum::actingAs($this->admin);

        $targetUser = User::factory()->create(['role' => 'OPERATOR']);

        $response = $this->deleteJson("/api/v1/users/{$targetUser->id}");

        $response->assertOk()
            ->assertJson(['message' => 'User account deleted successfully.']);

        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
    }

    #[Test]
    public function test_admin_cannot_delete_self(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->deleteJson("/api/v1/users/{$this->admin->id}");

        $response->assertStatus(400)
            ->assertJson(['message' => 'You cannot delete your own account.']);
    }

    #[Test]
    public function test_operator_cannot_access_user_management(): void
    {
        Sanctum::actingAs($this->operator);

        $response = $this->getJson('/api/v1/users');

        $response->assertForbidden();
    }
}
