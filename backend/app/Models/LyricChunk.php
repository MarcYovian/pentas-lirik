<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LyricChunk extends Model
{
    use HasFactory;

    protected $fillable = [
        'song_id',
        'label',
        'content',
        'order',
    ];

    /**
     * A lyric chunk belongs to a song.
     */
    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }
}
