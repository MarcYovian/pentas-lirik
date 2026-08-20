<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class DisplaySetting extends Model
{
    use HasFactory;

    protected $table = 'display_settings';

    protected $fillable = [
        'organization_id',
        'name',
        'is_active',
        'font_size',
        'font_weight',
        'text_transform',
        'align_items',
        'text_color',
        'text_shadow_color',
        'text_shadow_blur',
        'text_stroke_width',
        'text_stroke_color',
        'show_background',
        'background_color',
        'background_opacity',
        'padding_vertical',
        'padding_horizontal',
        'border_radius',
        'max_width',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'font_size' => 'integer',
        'text_shadow_blur' => 'integer',
        'text_stroke_width' => 'integer',
        'show_background' => 'boolean',
        'background_opacity' => 'integer',
        'padding_vertical' => 'integer',
        'padding_horizontal' => 'integer',
        'border_radius' => 'integer',
    ];

    /**
     * Organization this setting belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope query to organization.
     */
    public function scopeForOrganization(Builder $query, ?int $orgId): Builder
    {
        if ($orgId) {
            return $query->where('organization_id', $orgId);
        }

        return $query;
    }

    /**
     * Get the current active display setting.
     */
    public static function getActiveSetting(?int $orgId = null): ?self
    {
        $query = self::where('is_active', true);
        if ($orgId) {
            $query->where('organization_id', $orgId);
        }

        return $query->first();
    }

    /**
     * Atomically set this display setting as the active one.
     */
    public function activate(): bool
    {
        return DB::transaction(function () {
            $query = self::where('is_active', true);
            if ($this->organization_id) {
                $query->where('organization_id', $this->organization_id);
            }
            $query->update(['is_active' => false]);
            $this->is_active = true;

            return $this->save();
        });
    }
}
