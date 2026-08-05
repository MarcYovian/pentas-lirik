<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Song extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'artist',
    ];

    /**
     * A song has many lyric chunks.
     */
    public function lyricChunks(): HasMany
    {
        return $this->hasMany(LyricChunk::class)->orderBy('order');
    }

    /**
     * A song can be included in many setlist items.
     */
    public function setlistItems(): HasMany
    {
        return $this->hasMany(SetlistItem::class);
    }
}
