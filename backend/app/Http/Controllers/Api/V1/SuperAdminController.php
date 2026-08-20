<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Setlist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    /**
     * Get global server statistics and overview (Super Admin only).
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Hanya Super Administrator yang dapat mengakses statistik server.',
            ], 403);
        }

        $totalOrganizations = Organization::count();
        $totalUsers = User::count();
        $totalSongs = Song::count();
        $totalSetlists = Setlist::count();

        $organizations = Organization::withCount(['users', 'songs', 'setlists'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'summary' => [
                    'total_organizations' => $totalOrganizations,
                    'total_users' => $totalUsers,
                    'total_songs' => $totalSongs,
                    'total_setlists' => $totalSetlists,
                ],
                'organizations' => $organizations,
            ],
        ]);
    }
}
