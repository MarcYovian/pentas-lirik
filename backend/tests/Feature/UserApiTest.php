<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $adminToken;
    private User $operator;
    private string $operatorToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'ADMIN']);
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $this->operator = User::factory()->create(['role' => 'OPERATOR']);
        $this->operatorToken = $this->operator->createToken('op_token')->plainTextToken;
    }

    #[Test]
    public function test_admin_can_list_users(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function test_admin_can_create_new_user(): void
    {
        $payload = [
            'name' => 'New Operator',
            'email' => 'newop@pentaslirik.local',
            'password' => 'secret123',
            'role' => 'operator',
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->postJson('/api/v1/users', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Operator')
            ->assertJsonPath('data.role', 'operator');

        $this->assertDatabaseHas('users', ['email' => 'newop@pentaslirik.local']);
    }

    #[Test]
    public function test_admin_can_update_user_role(): void
    {
        $targetUser = User::factory()->create(['role' => 'OPERATOR']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->putJson("/api/v1/users/{$targetUser->id}", ['role' => 'admin']);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', ['id' => $targetUser->id, 'role' => 'ADMIN']);
    }

    #[Test]
    public function test_admin_can_delete_user(): void
    {
        $targetUser = User::factory()->create(['role' => 'OPERATOR']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson("/api/v1/users/{$targetUser->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'User account deleted successfully.']);

        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
    }

    #[Test]
    public function test_admin_cannot_delete_self(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->adminToken)
            ->deleteJson("/api/v1/users/{$this->admin->id}");

        $response->assertStatus(400)
            ->assertJson(['message' => 'You cannot delete your own account.']);
    }

    #[Test]
    public function test_operator_cannot_access_user_management(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->operatorToken)
            ->getJson('/api/v1/users');

        $response->assertStatus(403);
    }
}
