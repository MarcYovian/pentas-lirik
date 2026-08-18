<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncSongsRequest;
use App\Services\SongSyncService;
use Illuminate\Http\JsonResponse;

class SongSyncController extends Controller
{
    public function __construct(
        protected SongSyncService $songSyncService
    ) {}

    /**
     * Pull and sync songs from a remote PentasLirik VPS instance.
     */
    public function sync(SyncSongsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->songSyncService->syncFromRemote(
            remoteUrl: $validated['remote_url'],
            apiToken: $validated['api_token'] ?? null,
            email: $validated['email'] ?? null,
            password: $validated['password'] ?? null,
            conflictStrategy: $validated['conflict_strategy'],
            syncSongs: $validated['sync_songs'] ?? true,
            syncSetlists: $validated['sync_setlists'] ?? false,
            syncPresets: $validated['sync_presets'] ?? false,
            userId: $request->user()?->id
        );

        return response()->json([
            'message' => 'Sinkronisasi data dari remote VPS berhasil diselesaikan.',
            'data' => $result,
        ]);
    }
}
