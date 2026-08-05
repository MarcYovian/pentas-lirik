<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Setlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

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
}
