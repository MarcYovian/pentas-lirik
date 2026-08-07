<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SetlistResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'items' => $this->relationLoaded('setlistItems') ? $this->setlistItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'song_id' => $item->song_id,
                    'order' => $item->order,
                    'type' => $item->song_id ? 'song' : 'announcement',
                    'song_title' => $item->song ? $item->song->title : null,
                    'artist' => $item->song ? $item->song->artist : null,
                    'content' => $item->song ? null : ($item->content ?? ''),
                    'song' => $item->song ? new SongResource($item->song) : null,
                ];
            })->values() : [],
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
