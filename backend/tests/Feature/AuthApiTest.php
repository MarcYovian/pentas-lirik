<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
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
            'device_name' => 'MacBook Pro Chrome',
        ]);

        $response->assertOk()
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

        $this->assertEquals('MacBook Pro Chrome', $user->fresh()->tokens->first()->name);
    }

    #[Test]
    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'admin_invalid@pentaslirik.local',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin_invalid@pentaslirik.local',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Invalid login credentials.',
            ]);
    }

    #[Test]
    public function test_user_can_login_from_multiple_devices_simultaneously(): void
    {
        $user = User::factory()->create([
            'email' => 'operator_multi@pentaslirik.local',
            'password' => Hash::make('password123'),
        ]);

        // Login Device 1
        $res1 = $this->postJson('/api/v1/auth/login', [
            'email' => 'operator_multi@pentaslirik.local',
            'password' => 'password123',
            'device_name' => 'Desktop Operator',
        ]);
        $res1->assertOk();
        $token1 = $res1->json('data.token');

        // Login Device 2
        $res2 = $this->postJson('/api/v1/auth/login', [
            'email' => 'operator_multi@pentaslirik.local',
            'password' => 'password123',
            'device_name' => 'Mobile Operator Phone',
        ]);
        $res2->assertOk();
        $token2 = $res2->json('data.token');

        // Verify both tokens are active and valid
        $this->withHeader('Authorization', 'Bearer '.$token1)
            ->getJson('/api/v1/auth/me')
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$token2)
            ->getJson('/api/v1/auth/me')
            ->assertOk();

        $this->assertCount(2, $user->fresh()->tokens);
    }

    #[Test]
    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk()
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
    public function test_user_can_logout_single_device(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('Desktop Token')->plainTextToken;
        $token2 = $user->createToken('Mobile Token')->plainTextToken;

        // Logout using token1
        $response = $this->withHeader('Authorization', 'Bearer '.$token1)
            ->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJson([
                'message' => 'Successfully logged out of this device.',
            ]);

        // Forget cached auth guards in test process
        auth()->forgetGuards();

        // token1 is now invalid
        $this->withHeader('Authorization', 'Bearer '.$token1)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();

        // token2 remains valid
        $this->withHeader('Authorization', 'Bearer '.$token2)
            ->getJson('/api/v1/auth/me')
            ->assertOk();

        $this->assertCount(1, $user->fresh()->tokens);
    }

    #[Test]
    public function test_user_can_logout_all_devices(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('Desktop Token')->plainTextToken;
        $token2 = $user->createToken('Mobile Token')->plainTextToken;

        // Logout all using token1
        $response = $this->withHeader('Authorization', 'Bearer '.$token1)
            ->postJson('/api/v1/auth/logout-all');

        $response->assertOk()
            ->assertJson([
                'message' => 'Successfully logged out of all devices.',
            ]);

        // Forget cached auth guards in test process
        auth()->forgetGuards();

        // Both tokens are now invalid
        $this->withHeader('Authorization', 'Bearer '.$token1)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();

        auth()->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$token2)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();

        $this->assertCount(0, $user->fresh()->tokens);
    }

    #[Test]
    public function test_admin_can_access_admin_route(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/dashboard');

        $response->assertOk()
            ->assertJson(['message' => 'Welcome Admin']);
    }

    #[Test]
    public function test_operator_cannot_access_admin_route(): void
    {
        $operator = User::factory()->create(['role' => 'OPERATOR']);
        Sanctum::actingAs($operator);

        $response = $this->getJson('/api/v1/admin/dashboard');

        $response->assertForbidden()
            ->assertJson(['message' => 'Forbidden. You do not have access to this resource.']);
    }

    #[Test]
    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertUnauthorized();
    }
}
