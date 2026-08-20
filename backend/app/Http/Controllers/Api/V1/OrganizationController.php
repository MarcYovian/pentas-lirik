<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SetlistResource;
use App\Http\Resources\SongResource;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrganizationController extends Controller
{
    /**
     * Display a listing of user's organizations.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'ADMIN') {
            // Global admin can see all organizations
            $organizations = Organization::withCount(['songs', 'setlists', 'users'])->get();
        } else {
            $organizations = $user->organizations()->withCount(['songs', 'setlists', 'users'])->get();
        }

        // If user has no organizations attached, guarantee default organization
        if ($organizations->isEmpty()) {
            $default = Organization::getDefault();
            $user->organizations()->syncWithoutDetaching([
                $default->id => ['role' => $user->role ?? 'OPERATOR', 'status' => 'ACTIVE'],
            ]);
            $organizations = $user->organizations()->withCount(['songs', 'setlists', 'users'])->get();
        }

        return response()->json([
            'data' => $organizations,
        ]);
    }

    /**
     * Store a newly created organization.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:organizations,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $organization = Organization::create($validated);

        // Seed 3 starter songs & default display setting
        $organization->seedStarterPack();

        // Attach creator as ADMIN with status ACTIVE
        $request->user()->organizations()->attach($organization->id, [
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'message' => 'Organisasi berhasil dibuat.',
            'data' => $organization->loadCount(['songs', 'setlists', 'users']),
        ], 201);
    }

    /**
     * Display the specified organization.
     */
    public function show(Organization $organization): JsonResponse
    {
        return response()->json([
            'data' => $organization->loadCount(['songs', 'setlists', 'users']),
        ]);
    }

    /**
     * Update the specified organization.
     */
    public function update(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();
        if (! $user->isSuperAdmin() && ! $user->isOrgAdmin($organization)) {
            return response()->json([
                'message' => 'Hanya Admin Organisasi yang dapat mengubah informasi organisasi.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $organization->update($validated);

        return response()->json([
            'message' => 'Organisasi berhasil diperbarui.',
            'data' => $organization->loadCount(['songs', 'setlists', 'users']),
        ]);
    }

    /**
     * Display a listing of songs specifically for this organization.
     */
    public function songs(Organization $organization, Request $request): AnonymousResourceCollection
    {
        $query = $organization->songs()->with('lyricChunks');

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('artist', 'like', "%{$search}%");
            });
        }

        $songs = $query->orderBy('title')->paginate(50);

        return SongResource::collection($songs);
    }

    /**
     * Display a listing of setlists specifically for this organization.
     */
    public function setlists(Organization $organization): AnonymousResourceCollection
    {
        $setlists = $organization->setlists()
            ->with(['setlistItems.song.lyricChunks'])
            ->orderBy('created_at', 'desc')
            ->get();

        return SetlistResource::collection($setlists);
    }

    /**
     * Display a listing of display presets specifically for this organization.
     */
    public function presets(Organization $organization): JsonResponse
    {
        $presets = $organization->displaySettings()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $presets,
        ]);
    }
}
