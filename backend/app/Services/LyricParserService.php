<?php

namespace App\Services;

use App\Models\Song;
use Illuminate\Support\Facades\DB;

class LyricParserService
{
    /**
     * Parse raw lyric text with [LABEL] tags into array of structured chunks.
     *
     * @param string $rawLyrics
     * @return array<int, array{label: string, content: string, order: int}>
     */
    public function parse(string $rawLyrics): array
    {
        $rawLyrics = trim($rawLyrics);
        if (empty($rawLyrics)) {
            return [];
        }

        $lines = preg_split('/\r\n|\r|\n/', $rawLyrics);
        $chunks = [];
        $currentLabel = null;
        $currentLines = [];
        $orderCounter = 1;

        foreach ($lines as $line) {
            $trimmedLine = trim($line);

            // Check if line is a bracket tag like [VERSE 1] or [CHORUS]
            if (preg_match('/^\[(.*)\]$/', $trimmedLine, $matches)) {
                // If we already accumulated lines for a previous label, save that chunk
                if (!empty($currentLines)) {
                    $content = trim(implode("\n", $currentLines));
                    if (!empty($content)) {
                        $chunks[] = [
                            'label' => $currentLabel ?? '[LYRICS]',
                            'content' => $content,
                            'order' => $orderCounter++,
                        ];
                    }
                    $currentLines = [];
                }

                // Format label tag nicely (e.g. uppercase tag name inside brackets)
                $tagContent = strtoupper(trim($matches[1]));
                $currentLabel = "[{$tagContent}]";
            } else {
                $currentLines[] = $line;
            }
        }

        // Save final accumulated chunk
        if (!empty($currentLines)) {
            $content = trim(implode("\n", $currentLines));
            if (!empty($content)) {
                $chunks[] = [
                    'label' => $currentLabel ?? '[LYRICS]',
                    'content' => $content,
                    'order' => $orderCounter++,
                ];
            }
        }

        return $chunks;
    }

    /**
     * Parse raw lyrics and sync them with the given Song model in database.
     *
     * @param Song $song
     * @param string $rawLyrics
     * @return void
     */
    public function parseAndSync(Song $song, string $rawLyrics): void
    {
        $parsedChunks = $this->parse($rawLyrics);

        DB::transaction(function () use ($song, $parsedChunks) {
            $song->lyricChunks()->delete();
            foreach ($parsedChunks as $chunk) {
                $song->lyricChunks()->create($chunk);
            }
        });
    }
}
