<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SongResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $chunks = $this->lyricChunks ? $this->lyricChunks->map(function ($chunk) {
            return [
                'id' => $chunk->id,
                'label' => $chunk->label,
                'content' => $chunk->content,
                'order' => $chunk->order,
            ];
        })->values()->all() : [];

        return [
            'id' => $this->id,
            'title' => $this->title,
            'artist' => $this->artist,
            'lyrics' => $chunks,
            'lyric_chunks' => $chunks,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
