<?php

namespace Tests\Feature;

use App\Models\Organization;
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
    public function test_user_can_register_new_organization_with_starter_pack(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Yohanes Marc',
            'email' => 'yohanes@kapel.org',
            'password' => 'password123',
            'organization_name' => 'Kapel St Yohanes Rasul',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'yohanes@kapel.org')
            ->assertJsonPath('data.organization.name', 'Kapel St Yohanes Rasul')
            ->assertJsonPath('data.status', 'ACTIVE');

        $orgId = $response->json('data.organization.id');
        $org = Organization::find($orgId);

        // Check starter pack seeded
        $this->assertCount(3, $org->songs);
        $this->assertCount(1, $org->displaySettings);

        // Check user is active ADMIN in this organization
        $this->assertDatabaseHas('organization_user', [
            'organization_id' => $orgId,
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);
    }

    #[Test]
    public function test_register_validates_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@kapel.org']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Duplicate User',
            'email' => 'existing@kapel.org',
            'password' => 'password123',
            'organization_name' => 'Another Church',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_user_can_register_via_invite_code_with_pending_status(): void
    {
        $org = Organization::create([
            'name' => 'Youth Fellowship',
            'slug' => 'youth-fellowship',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Volunteer',
            'email' => 'budi@volunteer.local',
            'password' => 'password123',
            'invite_code' => $org->invite_code,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'PENDING');

        $user = User::where('email', 'budi@volunteer.local')->first();
        $this->assertNotNull($user);

        $this->assertDatabaseHas('organization_user', [
            'organization_id' => $org->id,
            'user_id' => $user->id,
            'role' => 'OPERATOR',
            'status' => 'PENDING',
        ]);
    }

    #[Test]
    public function test_register_fails_with_invalid_invite_code(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ghost User',
            'email' => 'ghost@unknown.local',
            'password' => 'password123',
            'invite_code' => 'PL-NONEXIST',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['invite_code']);
    }

    #[Test]
    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'New Name',
            'email' => 'new@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.name', 'New Name')
            ->assertJsonPath('data.user.email', 'new@example.com');

        $this->assertEquals('New Name', $user->fresh()->name);
    }

    #[Test]
    public function test_update_profile_fails_if_email_taken_by_another_user(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'Attempt Duplicate',
            'email' => 'taken@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    #[Test]
    public function test_update_password_fails_if_current_password_wrong(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('actualpassword'),
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/password', [
            'current_password' => 'wrongcurrentpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    #[Test]
    public function test_update_password_fails_if_confirmation_mismatch(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('actualpassword'),
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/password', [
            'current_password' => 'actualpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'mismatchedpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
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
