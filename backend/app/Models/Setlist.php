<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Setlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'user_id',
        'name',
    ];

    /**
     * The organization this setlist belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * A setlist belongs to a creator user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A setlist has many items.
     */
    public function setlistItems(): HasMany
    {
        return $this->hasMany(SetlistItem::class)->orderBy('order');
    }

    /**
     * Scope a query to only include setlists of a given organization.
     */
    public function scopeForOrganization(Builder $query, ?int $orgId): Builder
    {
        if ($orgId) {
            return $query->where('organization_id', $orgId);
        }

        return $query;
    }
}
