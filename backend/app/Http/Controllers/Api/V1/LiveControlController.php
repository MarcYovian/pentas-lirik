<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\DisplayClearEvent;
use App\Events\DisplayUpdateEvent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LiveControlController extends Controller
{
    private const CACHE_KEY = 'live_display_state';

    /**
     * Send new text content to live display and broadcast to WebSocket clients.
     */
    public function display(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'chunk_id' => ['nullable', 'integer'],
            'lyric_chunk_id' => ['nullable', 'integer'],
            'song_id' => ['nullable', 'integer'],
            'song_title' => ['nullable', 'string'],
            'label' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
        ]);

        $text = $validated['content'] ?? $validated['text'] ?? '';
        if ($text === '' && !isset($validated['content']) && !isset($validated['text'])) {
            return response()->json([
                'message' => 'The text or content field is required.',
                'errors' => ['text' => ['The text field is required.']],
            ], 422);
        }

        $chunkId = $validated['lyric_chunk_id'] ?? $validated['chunk_id'] ?? null;

        $payload = [
            'type' => $validated['type'] ?? 'lyric',
            'content' => $text,
            'text' => $text,
            'chunk_id' => $chunkId,
            'lyric_chunk_id' => $chunkId,
            'song_id' => $validated['song_id'] ?? null,
            'song_title' => $validated['song_title'] ?? null,
            'label' => $validated['label'] ?? null,
            'updated_at' => now()->toIso8601String(),
        ];

        // Store live state in Redis cache indefinitely
        Cache::put(self::CACHE_KEY, $payload);

        // Broadcast event to WebSocket clients via Laravel Reverb
        event(new DisplayUpdateEvent($payload));

        return response()->json([
            'message' => 'Display state updated.',
            'data' => $payload,
        ]);
    }

    /**
     * Clear the live display screen and broadcast clear event.
     */
    public function clear(): JsonResponse
    {
        $payload = [
            'type' => 'clear',
            'content' => null,
            'chunk_id' => null,
            'song_id' => null,
            'song_title' => null,
            'label' => null,
            'updated_at' => now()->toIso8601String(),
        ];

        // Store cleared state in Redis cache
        Cache::put(self::CACHE_KEY, $payload);

        // Broadcast clear event
        event(new DisplayClearEvent($payload));

        return response()->json([
            'message' => 'Display cleared.',
            'data' => $payload,
        ]);
    }

    /**
     * Get the current live display state (public endpoint for initial OBS sync).
     */
    public function getLiveState(): JsonResponse
    {
        $state = Cache::get(self::CACHE_KEY, [
            'type' => 'clear',
            'content' => null,
            'chunk_id' => null,
            'song_id' => null,
            'song_title' => null,
            'label' => null,
            'updated_at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'data' => $state,
        ]);
    }
}
