<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class OrganizationMemberController extends Controller
{
    /**
     * Join an organization using an invite code (for currently logged-in users).
     */
    public function join(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invite_code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($validated['invite_code']));
        $org = Organization::where('invite_code', $code)->first();

        if (! $org) {
            return response()->json([
                'message' => 'Kode undangan organisasi tidak valid.',
                'errors' => ['invite_code' => ['Kode undangan organisasi tidak ditemukan.']],
            ], 422);
        }

        $user = $request->user();

        // Check if already a member
        $existing = $user->organizations()->where('organizations.id', $org->id)->first();
        if ($existing) {
            $status = $existing->pivot->status;
            if ($status === 'ACTIVE') {
                return response()->json([
                    'message' => 'Anda sudah menjadi anggota aktif di '.$org->name.'.',
                    'data' => $org,
                ]);
            }
            if ($status === 'PENDING') {
                return response()->json([
                    'message' => 'Permintaan bergabung Anda ke '.$org->name.' sedang menunggu persetujuan Admin.',
                    'data' => $org,
                ]);
            }
        }

        $user->organizations()->syncWithoutDetaching([
            $org->id => ['role' => 'OPERATOR', 'status' => 'PENDING'],
        ]);

        return response()->json([
            'message' => 'Permintaan bergabung ke '.$org->name.' berhasil dikirim dan menunggu persetujuan Admin.',
            'data' => $org,
        ], 201);
    }

    /**
     * List members of the specified organization (Admin only or member view).
     */
    public function index(Organization $organization, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isSuperAdmin() && ! $user->isOrgAdmin($organization)) {
            // Non-admin can only see active members list without sensitive management controls
            $members = $organization->activeUsers()->select('users.id', 'users.name', 'users.email')->get();

            return response()->json([
                'data' => $members,
                'is_admin' => false,
            ]);
        }

        $members = $organization->users()
            ->select('users.id', 'users.name', 'users.email', 'users.created_at')
            ->orderBy('organization_user.status')
            ->orderBy('users.name')
            ->get();

        $pendingCount = $organization->pendingUsers()->count();

        return response()->json([
            'data' => $members,
            'pending_count' => $pendingCount,
            'invite_code' => $organization->invite_code,
            'is_admin' => true,
        ]);
    }

    /**
     * Directly create and add a new user to the organization (status ACTIVE).
     */
    public function store(Organization $organization, Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isSuperAdmin() && ! $user->isOrgAdmin($organization)) {
            return response()->json([
                'message' => 'Hanya Admin Organisasi yang dapat menambahkan anggota baru.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:ADMIN,OPERATOR,admin,operator'],
        ]);

        $role = strtoupper($validated['role']);

        $targetUser = User::where('email', $validated['email'])->first();

        if (! $targetUser) {
            $targetUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'OPERATOR',
            ]);
        }

        $organization->users()->syncWithoutDetaching([
            $targetUser->id => [
                'role' => $role,
                'status' => 'ACTIVE',
            ],
        ]);

        return response()->json([
            'message' => 'Anggota tim berhasil ditambahkan ke '.$organization->name.'.',
            'data' => $targetUser,
        ], 201);
    }

    /**
     * Update member status (Approve, Suspend, Activate) or role.
     */
    public function updateStatus(Organization $organization, int $userId, Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->isSuperAdmin() && ! $authUser->isOrgAdmin($organization)) {
            return response()->json([
                'message' => 'Hanya Admin Organisasi yang dapat mengubah status anggota.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['nullable', 'in:ACTIVE,PENDING,INACTIVE'],
            'role' => ['nullable', 'in:ADMIN,OPERATOR,admin,operator'],
        ]);

        $updates = [];
        if (isset($validated['status'])) {
            $updates['status'] = $validated['status'];
        }
        if (isset($validated['role'])) {
            $updates['role'] = strtoupper($validated['role']);
        }

        if (empty($updates)) {
            return response()->json(['message' => 'Tidak ada perubahan.'], 422);
        }

        $organization->users()->updateExistingPivot($userId, $updates);

        return response()->json([
            'message' => 'Status anggota tim berhasil diperbarui.',
        ]);
    }

    /**
     * Remove a member from the organization.
     */
    public function destroy(Organization $organization, int $userId, Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->isSuperAdmin() && ! $authUser->isOrgAdmin($organization)) {
            return response()->json([
                'message' => 'Hanya Admin Organisasi yang dapat menghapus anggota.',
            ], 403);
        }

        // Prevent removing the last admin
        if ($organization->admins()->count() <= 1 && $organization->admins()->where('users.id', $userId)->exists()) {
            return response()->json([
                'message' => 'Tidak dapat menghapus satu-satunya Admin di organisasi ini.',
            ], 422);
        }

        $organization->users()->detach($userId);

        return response()->json([
            'message' => 'Anggota berhasil dihapus dari organisasi.',
        ]);
    }

    /**
     * Regenerate a new invite code for the organization.
     */
    public function regenerateInvite(Organization $organization, Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->isSuperAdmin() && ! $authUser->isOrgAdmin($organization)) {
            return response()->json([
                'message' => 'Hanya Admin Organisasi yang dapat memperbarui kode undangan.',
            ], 403);
        }

        $newCode = Organization::generateUniqueInviteCode();
        $organization->update(['invite_code' => $newCode]);

        return response()->json([
            'message' => 'Kode undangan baru berhasil dibuat.',
            'invite_code' => $newCode,
        ]);
    }
}
