<?php

namespace App\Services;

use App\Models\DisplaySetting;
use App\Models\Setlist;
use App\Models\Song;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class SongSyncService
{
    /**
     * Authenticate or prepare headers for the remote PentasLirik VPS instance.
     *
     * @throws ValidationException
     */
    protected function resolveApiToken(string $remoteUrl, ?string $apiToken, ?string $email, ?string $password): string
    {
        if (! empty($apiToken)) {
            return trim($apiToken);
        }

        if (empty($email) || empty($password)) {
            throw ValidationException::withMessages([
                'auth' => ['Harap masukkan API Token atau kombinasi Email dan Password remote VPS.'],
            ]);
        }

        $loginUrl = rtrim($remoteUrl, '/').'/api/v1/auth/login';

        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->post($loginUrl, [
                    'email' => $email,
                    'password' => $password,
                ]);
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'remote_url' => ['Gagal menghubungi remote VPS: '.$e->getMessage()],
            ]);
        }

        if (! $response->successful()) {
            $errorMsg = $response->json('message') ?? 'Autentikasi remote VPS gagal (HTTP '.$response->status().').';
            throw ValidationException::withMessages([
                'auth' => [$errorMsg],
            ]);
        }

        $token = $response->json('token') ?? $response->json('data.token');
        if (empty($token)) {
            throw ValidationException::withMessages([
                'auth' => ['Token tidak ditemukan pada respon remote VPS.'],
            ]);
        }

        return $token;
    }

    /**
     * Pull data from remote VPS and sync into local database.
     *
     * @return array{
     *     songs?: array{total: int, created: int, updated: int, skipped: int},
     *     setlists?: array{total: int, created: int, updated: int, skipped: int},
     *     presets?: array{total: int, created: int, updated: int, skipped: int},
     *     total_fetched: int,
     *     created: int,
     *     updated: int,
     *     skipped: int
     * }
     *
     * @throws ValidationException
     */
    public function syncFromRemote(
        string $remoteUrl,
        ?string $apiToken,
        ?string $email,
        ?string $password,
        string $conflictStrategy = 'skip',
        bool $syncSongs = true,
        bool $syncSetlists = false,
        bool $syncPresets = false,
        ?int $userId = null
    ): array {
        $token = $this->resolveApiToken($remoteUrl, $apiToken, $email, $password);
        $baseUrl = rtrim($remoteUrl, '/');

        // If syncing setlists, we must also sync songs first to guarantee valid foreign keys
        if ($syncSetlists) {
            $syncSongs = true;
        }

        $songStats = ['total' => 0, 'created' => 0, 'updated' => 0, 'skipped' => 0];
        $setlistStats = ['total' => 0, 'created' => 0, 'updated' => 0, 'skipped' => 0];
        $presetStats = ['total' => 0, 'created' => 0, 'updated' => 0, 'skipped' => 0];

        $remoteToLocalSongMap = [];

        // 1. Sync Songs & Lyric Chunks
        if ($syncSongs) {
            $songSyncResult = $this->syncSongsInternal($baseUrl, $token, $conflictStrategy);
            $songStats = $songSyncResult['stats'];
            $remoteToLocalSongMap = $songSyncResult['map'];
        }

        // 2. Sync Setlists & Rundown items
        if ($syncSetlists) {
            $setlistStats = $this->syncSetlistsInternal($baseUrl, $token, $conflictStrategy, $remoteToLocalSongMap, $userId);
        }

        // 3. Sync OBS Display Presets
        if ($syncPresets) {
            $presetStats = $this->syncPresetsInternal($baseUrl, $token, $conflictStrategy);
        }

        $totalFetched = $songStats['total'] + $setlistStats['total'] + $presetStats['total'];
        $totalCreated = $songStats['created'] + $setlistStats['created'] + $presetStats['created'];
        $totalUpdated = $songStats['updated'] + $setlistStats['updated'] + $presetStats['updated'];
        $totalSkipped = $songStats['skipped'] + $setlistStats['skipped'] + $presetStats['skipped'];

        return [
            'songs' => $songStats,
            'setlists' => $setlistStats,
            'presets' => $presetStats,
            'total_fetched' => $totalFetched,
            'created' => $totalCreated,
            'updated' => $totalUpdated,
            'skipped' => $totalSkipped,
        ];
    }

    /**
     * Sync songs and lyric chunks from remote VPS.
     *
     * @return array{
     *     stats: array{total: int, created: int, updated: int, skipped: int},
     *     map: array<int, int>
     * }
     *
     * @throws ValidationException
     */
    protected function syncSongsInternal(string $baseUrl, string $token, string $conflictStrategy): array
    {
        $currentPage = 1;
        $lastPage = 1;
        $totalFetched = 0;
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $map = [];

        do {
            $apiUrl = "{$baseUrl}/api/v1/songs?page={$currentPage}";

            try {
                $response = Http::timeout(20)
                    ->withToken($token)
                    ->acceptJson()
                    ->get($apiUrl);
            } catch (Exception $e) {
                throw ValidationException::withMessages([
                    'sync' => ["Gagal mengambil data lagu halaman {$currentPage}: ".$e->getMessage()],
                ]);
            }

            if (! $response->successful()) {
                throw ValidationException::withMessages([
                    'sync' => ["Gagal mengambil data dari remote VPS (HTTP {$response->status()})."],
                ]);
            }

            $json = $response->json();
            $remoteSongs = $json['data'] ?? [];
            $lastPage = $json['meta']['last_page'] ?? $json['last_page'] ?? 1;

            foreach ($remoteSongs as $remoteSong) {
                $totalFetched++;
                $remoteId = $remoteSong['id'] ?? null;
                $title = trim($remoteSong['title'] ?? '');
                $artist = trim($remoteSong['artist'] ?? '');

                if (empty($title)) {
                    continue;
                }

                // Check existing local song by title & artist (case-insensitive)
                $existingSong = Song::whereRaw('LOWER(TRIM(title)) = ?', [mb_strtolower($title)])
                    ->whereRaw('LOWER(TRIM(artist)) = ?', [mb_strtolower($artist)])
                    ->first();

                $rawChunks = $remoteSong['lyric_chunks'] ?? $remoteSong['lyrics'] ?? [];

                if ($existingSong) {
                    if ($remoteId) {
                        $map[$remoteId] = $existingSong->id;
                    }

                    if ($conflictStrategy === 'skip') {
                        $skipped++;

                        continue;
                    }

                    // Overwrite mode: Update song metadata and replace lyric chunks
                    DB::transaction(function () use ($existingSong, $title, $artist, $rawChunks) {
                        $existingSong->update([
                            'title' => $title,
                            'artist' => $artist,
                        ]);

                        $existingSong->lyricChunks()->delete();

                        foreach ($rawChunks as $index => $chunk) {
                            $existingSong->lyricChunks()->create([
                                'label' => $chunk['label'] ?? '[LYRICS]',
                                'content' => $chunk['content'] ?? '',
                                'order' => $chunk['order'] ?? ($index + 1),
                            ]);
                        }
                    });

                    $updated++;
                } else {
                    // Create new local song
                    $newSong = DB::transaction(function () use ($title, $artist, $rawChunks) {
                        $createdSong = Song::create([
                            'title' => $title,
                            'artist' => $artist,
                        ]);

                        foreach ($rawChunks as $index => $chunk) {
                            $createdSong->lyricChunks()->create([
                                'label' => $chunk['label'] ?? '[LYRICS]',
                                'content' => $chunk['content'] ?? '',
                                'order' => $chunk['order'] ?? ($index + 1),
                            ]);
                        }

                        return $createdSong;
                    });

                    if ($remoteId) {
                        $map[$remoteId] = $newSong->id;
                    }

                    $created++;
                }
            }

            $currentPage++;
        } while ($currentPage <= $lastPage);

        return [
            'stats' => [
                'total' => $totalFetched,
                'created' => $created,
                'updated' => $updated,
                'skipped' => $skipped,
            ],
            'map' => $map,
        ];
    }

    /**
     * Sync setlists and items from remote VPS.
     *
     * @param  array<int, int>  $remoteToLocalSongMap
     * @return array{total: int, created: int, updated: int, skipped: int}
     *
     * @throws ValidationException
     */
    protected function syncSetlistsInternal(
        string $baseUrl,
        string $token,
        string $conflictStrategy,
        array $remoteToLocalSongMap,
        ?int $userId
    ): array {
        $apiUrl = "{$baseUrl}/api/v1/setlists";

        try {
            $response = Http::timeout(20)
                ->withToken($token)
                ->acceptJson()
                ->get($apiUrl);
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'sync' => ['Gagal mengambil data setlist dari remote VPS: '.$e->getMessage()],
            ]);
        }

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'sync' => ["Gagal mengambil data setlist dari remote VPS (HTTP {$response->status()})."],
            ]);
        }

        $json = $response->json();
        $remoteSetlists = $json['data'] ?? [];

        $total = 0;
        $created = 0;
        $updated = 0;
        $skipped = 0;

        $targetUserId = $userId ?: (User::first()?->id ?? 1);

        foreach ($remoteSetlists as $remoteSetlist) {
            $total++;
            $name = trim($remoteSetlist['name'] ?? '');

            if (empty($name)) {
                continue;
            }

            $existingSetlist = Setlist::whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower($name)])->first();
            $items = $remoteSetlist['items'] ?? [];

            if ($existingSetlist) {
                if ($conflictStrategy === 'skip') {
                    $skipped++;

                    continue;
                }

                // Overwrite setlist items
                DB::transaction(function () use ($existingSetlist, $items, $remoteToLocalSongMap) {
                    $existingSetlist->setlistItems()->delete();
                    $this->insertSetlistItems($existingSetlist, $items, $remoteToLocalSongMap);
                });

                $updated++;
            } else {
                // Create new setlist
                DB::transaction(function () use ($name, $targetUserId, $items, $remoteToLocalSongMap) {
                    $newSetlist = Setlist::create([
                        'user_id' => $targetUserId,
                        'name' => $name,
                    ]);
                    $this->insertSetlistItems($newSetlist, $items, $remoteToLocalSongMap);
                });

                $created++;
            }
        }

        return [
            'total' => $total,
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }

    /**
     * Insert items into setlist with proper song ID mapping.
     *
     * @param  array<int, mixed>  $items
     * @param  array<int, int>  $remoteToLocalSongMap
     */
    protected function insertSetlistItems(Setlist $setlist, array $items, array $remoteToLocalSongMap): void
    {
        $order = 1;
        foreach ($items as $item) {
            $remoteSongId = $item['song_id'] ?? null;
            $localSongId = null;

            if ($remoteSongId) {
                // Check mapped ID
                if (isset($remoteToLocalSongMap[$remoteSongId])) {
                    $localSongId = $remoteToLocalSongMap[$remoteSongId];
                } else {
                    // Fallback search by song title / artist
                    $songTitle = trim($item['song_title'] ?? $item['song']['title'] ?? '');
                    $songArtist = trim($item['artist'] ?? $item['song']['artist'] ?? '');
                    if (! empty($songTitle)) {
                        $found = Song::whereRaw('LOWER(TRIM(title)) = ?', [mb_strtolower($songTitle)])
                            ->when(! empty($songArtist), function ($q) use ($songArtist) {
                                return $q->whereRaw('LOWER(TRIM(artist)) = ?', [mb_strtolower($songArtist)]);
                            })
                            ->first();
                        $localSongId = $found?->id;
                    }
                }
            }

            if ($localSongId) {
                $setlist->setlistItems()->create([
                    'song_id' => $localSongId,
                    'order' => $order++,
                ]);
            }
        }
    }

    /**
     * Sync OBS display presets from remote VPS.
     *
     * @return array{total: int, created: int, updated: int, skipped: int}
     *
     * @throws ValidationException
     */
    protected function syncPresetsInternal(string $baseUrl, string $token, string $conflictStrategy): array
    {
        $apiUrl = "{$baseUrl}/api/v1/display/presets";

        try {
            $response = Http::timeout(20)
                ->withToken($token)
                ->acceptJson()
                ->get($apiUrl);
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'sync' => ['Gagal mengambil data preset OBS dari remote VPS: '.$e->getMessage()],
            ]);
        }

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'sync' => ["Gagal mengambil data preset OBS dari remote VPS (HTTP {$response->status()})."],
            ]);
        }

        $json = $response->json();
        $remotePresets = $json['data'] ?? [];

        $total = 0;
        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($remotePresets as $remotePreset) {
            $total++;
            $name = trim($remotePreset['name'] ?? '');

            if (empty($name)) {
                continue;
            }

            $existingPreset = DisplaySetting::whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower($name)])->first();

            $presetAttributes = [
                'font_size' => $remotePreset['font_size'] ?? 48,
                'font_weight' => $remotePreset['font_weight'] ?? 'bold',
                'text_transform' => $remotePreset['text_transform'] ?? 'none',
                'align_items' => $remotePreset['align_items'] ?? 'center',
                'text_color' => $remotePreset['text_color'] ?? '#FFFFFF',
                'text_shadow_color' => $remotePreset['text_shadow_color'] ?? 'rgba(0,0,0,0.8)',
                'text_shadow_blur' => $remotePreset['text_shadow_blur'] ?? 8,
                'text_stroke_width' => $remotePreset['text_stroke_width'] ?? 0,
                'text_stroke_color' => $remotePreset['text_stroke_color'] ?? '#000000',
                'show_background' => $remotePreset['show_background'] ?? false,
                'background_color' => $remotePreset['background_color'] ?? 'rgba(0,0,0,0.6)',
                'background_opacity' => $remotePreset['background_opacity'] ?? 60,
                'padding_vertical' => $remotePreset['padding_vertical'] ?? 16,
                'padding_horizontal' => $remotePreset['padding_horizontal'] ?? 32,
                'border_radius' => $remotePreset['border_radius'] ?? 12,
                'max_width' => $remotePreset['max_width'] ?? '80%',
            ];

            if ($existingPreset) {
                if ($conflictStrategy === 'skip') {
                    $skipped++;

                    continue;
                }

                // Overwrite styling attributes (preserve is_active state)
                $existingPreset->update($presetAttributes);
                $updated++;
            } else {
                DisplaySetting::create(array_merge($presetAttributes, [
                    'name' => $name,
                    'is_active' => false,
                ]));
                $created++;
            }
        }

        return [
            'total' => $total,
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }
}
