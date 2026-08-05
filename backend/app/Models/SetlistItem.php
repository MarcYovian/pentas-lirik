<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SetlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'setlist_id',
        'song_id',
        'order',
    ];

    /**
     * A setlist item belongs to a setlist.
     */
    public function setlist(): BelongsTo
    {
        return $this->belongsTo(Setlist::class);
    }

    /**
     * A setlist item belongs to a song.
     */
    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }
}
