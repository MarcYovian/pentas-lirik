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
            'items' => $this->whenLoaded('setlistItems', function () {
                return $this->setlistItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'song_id' => $item->song_id,
                        'order' => $item->order,
                        'song' => new SongResource($item->song),
                    ];
                });
            }),
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
