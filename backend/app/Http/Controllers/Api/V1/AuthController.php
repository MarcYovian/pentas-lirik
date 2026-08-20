<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user with either a new organization or joining an existing one via invite code.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'invite_code' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'OPERATOR',
        ]);

        $deviceName = $request->input('device_name', $request->header('User-Agent', 'Default Device'));
        $token = $user->createToken($deviceName)->plainTextToken;

        if (! empty($validated['invite_code'])) {
            // Join existing organization via invite code
            $org = Organization::where('invite_code', strtoupper(trim($validated['invite_code'])))->first();

            if (! $org) {
                return response()->json([
                    'message' => 'Kode undangan organisasi tidak valid.',
                    'errors' => ['invite_code' => ['Kode undangan organisasi tidak ditemukan.']],
                ], 422);
            }

            $user->organizations()->attach($org->id, [
                'role' => 'OPERATOR',
                'status' => 'PENDING',
            ]);

            return response()->json([
                'message' => 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan dari Admin '.$org->name.'.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => strtolower($user->role),
                        'organizations' => $user->organizations,
                    ],
                    'token' => $token,
                    'status' => 'PENDING',
                ],
            ], 201);
        }

        // Create new organization for the user
        $orgName = $validated['organization_name'] ?? ($user->name."'s Team");
        $organization = Organization::create([
            'name' => $orgName,
            'description' => 'Organisasi dibuat oleh '.$user->name,
        ]);

        // Seed 3 starter songs & 1 default display preset
        $organization->seedStarterPack();

        // Attach creator as active ADMIN
        $user->organizations()->attach($organization->id, [
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'message' => 'Pendaftaran organisasi dan akun berhasil diselesaikan.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => strtolower($user->role),
                    'organizations' => $user->organizations,
                ],
                'organization' => $organization,
                'token' => $token,
                'status' => 'ACTIVE',
            ],
        ], 201);
    }

    /**
     * Authenticate a user and return a Sanctum access token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid login credentials.',
            ], 401);
        }

        // Generate token with device name tagging without revoking other active device tokens
        $deviceName = $request->input('device_name', $request->header('User-Agent', 'Unknown Device'));
        $token = $user->createToken($deviceName)->plainTextToken;

        $organizations = $user->organizations;
        if ($organizations->isEmpty()) {
            $default = Organization::getDefault();
            $user->organizations()->syncWithoutDetaching([
                $default->id => ['role' => $user->role ?? 'OPERATOR', 'status' => 'ACTIVE'],
            ]);
            $organizations = $user->organizations;
        }

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => strtolower($user->role),
                    'organizations' => $organizations,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Log out the current user device by deleting its specific access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out of this device.',
        ]);
    }

    /**
     * Log out the authenticated user from all active devices by deleting all access tokens.
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out of all devices.',
        ]);
    }

    /**
     * Get the authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $organizations = $user->organizations;
        if ($organizations->isEmpty()) {
            $default = Organization::getDefault();
            $user->organizations()->syncWithoutDetaching([
                $default->id => ['role' => $user->role ?? 'OPERATOR', 'status' => 'ACTIVE'],
            ]);
            $organizations = $user->organizations;
        }

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => strtolower($user->role),
                    'organizations' => $organizations,
                ],
            ],
        ]);
    }

    /**
     * Update user profile information (Self-Service).
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => strtolower($user->role),
                    'organizations' => $user->organizations,
                ],
            ],
        ]);
    }

    /**
     * Update user password (Self-Service).
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai.',
                'errors' => ['current_password' => ['Password lama yang Anda masukkan salah.']],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui.',
        ]);
    }
}
