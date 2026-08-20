<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Song extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'title',
        'artist',
    ];

    /**
     * The organization this song belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

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

    /**
     * Scope a query to only include songs of a given organization.
     */
    public function scopeForOrganization(Builder $query, ?int $orgId): Builder
    {
        if ($orgId) {
            return $query->where('organization_id', $orgId);
        }

        return $query;
    }
}
