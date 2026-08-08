<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSongRequest;
use App\Http\Requests\UpdateSongRequest;
use App\Http\Resources\SongResource;
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
     * Display a listing of songs (with optional search query).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Song::with('lyricChunks');

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
    public function show(Song $song): SongResource
    {
        $song->load('lyricChunks');

        return new SongResource($song);
    }

    /**
     * Store a newly created song in storage.
     */
    public function store(StoreSongRequest $request): JsonResponse
    {
        $song = Song::create($request->only(['title', 'artist']));

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
    public function destroy(Song $song): JsonResponse
    {
        $song->delete();

        return response()->json([
            'message' => 'Song deleted successfully.',
        ]);
    }
}
