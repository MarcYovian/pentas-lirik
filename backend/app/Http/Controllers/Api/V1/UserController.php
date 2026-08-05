<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of all users (Admin only).
     */
    public function index(): JsonResponse
    {
        $users = User::orderBy('name')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => strtolower($user->role),
                'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
            ];
        });

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user account in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in(['ADMIN', 'OPERATOR', 'admin', 'operator'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => strtoupper($validated['role']),
        ]);

        return response()->json([
            'message' => 'User account created successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => strtolower($user->role),
                'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
            ],
        ], 201);
    }

    /**
     * Update the specified user account.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['sometimes', 'required', 'string', Rule::in(['ADMIN', 'OPERATOR', 'admin', 'operator'])],
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        if (isset($validated['role'])) {
            $user->role = strtoupper($validated['role']);
        }

        $user->save();

        return response()->json([
            'message' => 'User account updated successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => strtolower($user->role),
                'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
            ],
        ]);
    }

    /**
     * Remove the specified user account.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully.',
        ]);
    }
}
