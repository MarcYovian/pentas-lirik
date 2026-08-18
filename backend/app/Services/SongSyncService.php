<?php

namespace App\Services;

use App\Models\Song;
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
     * Pull songs from remote VPS and sync into local database.
     *
     * @return array{
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
        string $conflictStrategy = 'skip'
    ): array {
        $token = $this->resolveApiToken($remoteUrl, $apiToken, $email, $password);

        $baseUrl = rtrim($remoteUrl, '/');
        $currentPage = 1;
        $lastPage = 1;
        $totalFetched = 0;
        $created = 0;
        $updated = 0;
        $skipped = 0;

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
                    DB::transaction(function () use ($title, $artist, $rawChunks) {
                        $newSong = Song::create([
                            'title' => $title,
                            'artist' => $artist,
                        ]);

                        foreach ($rawChunks as $index => $chunk) {
                            $newSong->lyricChunks()->create([
                                'label' => $chunk['label'] ?? '[LYRICS]',
                                'content' => $chunk['content'] ?? '',
                                'order' => $chunk['order'] ?? ($index + 1),
                            ]);
                        }
                    });

                    $created++;
                }
            }

            $currentPage++;
        } while ($currentPage <= $lastPage);

        return [
            'total_fetched' => $totalFetched,
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }
}
