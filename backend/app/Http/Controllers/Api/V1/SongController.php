<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSongRequest;
use App\Http\Requests\UpdateSongRequest;
use App\Http\Resources\SongResource;
use App\Models\Organization;
use App\Models\Song;
use App\Services\LyricParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SongController extends Controller
{
    public function __construct(
        protected LyricParserService $lyricParser
    ) {}

    /**
     * Display a listing of songs (with optional search query & organization scope).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Song::with('lyricChunks');

        $orgId = $request->header('X-Organization-Id')
            ?? $request->query('organization_id')
            ?? $request->query('org_id');

        if ($orgId) {
            $query->where('organization_id', $orgId);
        }

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
     * Display the specified song with its lyric chunks.
     */
    public function show(Request $request, Song $song): SongResource
    {
        $this->authorizeSongAccess($request, $song);

        $song->load('lyricChunks');

        return new SongResource($song);
    }

    /**
     * Store a newly created song in storage.
     */
    public function store(StoreSongRequest $request): JsonResponse
    {
        $orgId = $request->input('organization_id')
            ?? $request->header('X-Organization-Id')
            ?? $request->user()?->organizations()->first()?->id
            ?? Organization::getDefault()->id;

        $user = $request->user();
        if ($orgId && $user && ! $user->isSuperAdmin()) {
            $hasExplicitOrg = $request->has('organization_id') || $request->hasHeader('X-Organization-Id');
            if ($hasExplicitOrg) {
                $isMember = $user->organizations()->where('organizations.id', $orgId)->wherePivot('status', 'ACTIVE')->exists();
                if (! $isMember) {
                    abort(403, 'Anda tidak memiliki hak akses untuk menambahkan lagu di organisasi ini.');
                }
            }
        }

        $song = Song::create(array_merge(
            $request->only(['title', 'artist']),
            ['organization_id' => $orgId]
        ));

        $rawLyrics = $request->input('lyrics') ?? $request->input('lyrics_raw');
        if ($rawLyrics !== null) {
            $this->lyricParser->parseAndSync($song, (string) $rawLyrics);
        }

        $song->load('lyricChunks');

        return (new SongResource($song))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update the specified song in storage.
     */
    public function update(UpdateSongRequest $request, Song $song): SongResource
    {
        $this->authorizeSongAccess($request, $song);

        $song->update($request->only(['title', 'artist']));

        $rawLyrics = $request->input('lyrics') ?? $request->input('lyrics_raw');
        if ($rawLyrics !== null) {
            $this->lyricParser->parseAndSync($song, (string) $rawLyrics);
        }

        $song->load('lyricChunks');

        return new SongResource($song);
    }

    /**
     * Remove the specified song from storage.
     */
    public function destroy(Request $request, Song $song): JsonResponse
    {
        $this->authorizeSongAccess($request, $song);

        $song->delete();

        return response()->json([
            'message' => 'Song deleted successfully.',
        ]);
    }

    /**
     * Ensure the user has active membership in the song's organization to prevent cross-tenant IDOR attacks.
     */
    protected function authorizeSongAccess(Request $request, Song $song): void
    {
        $user = $request->user();
        if (! $user || $user->isSuperAdmin()) {
            return;
        }

        if ($song->organization_id && ! $user->organizations()->where('organizations.id', $song->organization_id)->wherePivot('status', 'ACTIVE')->exists()) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola lagu di organisasi ini.');
        }
    }
}
