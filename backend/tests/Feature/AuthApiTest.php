<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@pentaslirik.local',
            'password' => Hash::make('secret123'),
            'role' => 'ADMIN',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@pentaslirik.local',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ],
            ])
            ->assertJson([
                'data' => [
                    'user' => [
                        'email' => 'admin@pentaslirik.local',
                        'role' => 'admin',
                    ],
                ],
            ]);
    }

    #[Test]
    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'admin@pentaslirik.local',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@pentaslirik.local',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid login credentials.',
            ]);
    }

    #[Test]
    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => 'operator',
                    ],
                ],
            ]);
    }

    #[Test]
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Successfully logged out.',
            ]);

        $this->assertCount(0, $user->tokens);
    }

    #[Test]
    public function test_admin_can_access_admin_route(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $token = $admin->createToken('admin_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Welcome Admin']);
    }

    #[Test]
    public function test_operator_cannot_access_admin_route(): void
    {
        $operator = User::factory()->create(['role' => 'OPERATOR']);
        $token = $operator->createToken('operator_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden. You do not have access to this resource.']);
    }

    #[Test]
    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }
}
