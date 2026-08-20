<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'invite_code',
        'description',
    ];

    /**
     * Boot model and generate unique slug & invite_code if not set.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($org) {
            if (empty($org->slug)) {
                $baseSlug = Str::slug($org->name);
                $slug = $baseSlug;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-{$counter}";
                    $counter++;
                }
                $org->slug = $slug;
            }

            if (empty($org->invite_code)) {
                $org->invite_code = static::generateUniqueInviteCode();
            }
        });
    }

    /**
     * Generate a unique uppercase invite code (e.g. PL-A8X9K2).
     */
    public static function generateUniqueInviteCode(): string
    {
        do {
            $code = 'PL-'.strtoupper(Str::random(6));
        } while (static::where('invite_code', $code)->exists());

        return $code;
    }

    /**
     * Users belonging to this organization.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_user')
            ->withPivot(['role', 'status'])
            ->withTimestamps();
    }

    /**
     * Active users only.
     */
    public function activeUsers(): BelongsToMany
    {
        return $this->users()->wherePivot('status', 'ACTIVE');
    }

    /**
     * Pending approval users.
     */
    public function pendingUsers(): BelongsToMany
    {
        return $this->users()->wherePivot('status', 'PENDING');
    }

    /**
     * Admin users in this organization.
     */
    public function admins(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'ADMIN')->wherePivot('status', 'ACTIVE');
    }

    /**
     * Operator users in this organization.
     */
    public function operators(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'OPERATOR')->wherePivot('status', 'ACTIVE');
    }

    /**
     * Songs belonging to this organization.
     */
    public function songs(): HasMany
    {
        return $this->hasMany(Song::class);
    }

    /**
     * Setlists belonging to this organization.
     */
    public function setlists(): HasMany
    {
        return $this->hasMany(Setlist::class);
    }

    /**
     * Display settings belonging to this organization.
     */
    public function displaySettings(): HasMany
    {
        return $this->hasMany(DisplaySetting::class);
    }

    /**
     * Seed starter pack (3 sample songs + 1 default display preset) for a new organization.
     */
    public function seedStarterPack(): void
    {
        // 1. Default Display Style
        $this->displaySettings()->create([
            'name' => 'Default Style',
            'is_active' => true,
            'font_size' => 48,
            'font_weight' => '800',
            'text_transform' => 'uppercase',
            'align_items' => 'center',
            'text_color' => '#FFFFFF',
            'text_shadow_color' => 'rgba(0,0,0,0.8)',
            'text_shadow_blur' => 10,
            'text_stroke_width' => 0,
            'text_stroke_color' => '#000000',
            'show_background' => false,
            'background_color' => 'rgba(0,0,0,0.6)',
            'background_opacity' => 60,
            'padding_vertical' => 16,
            'padding_horizontal' => 32,
            'border_radius' => 12,
            'max_width' => 'max-w-7xl',
        ]);

        // 2. Starter Song 1: Amazing Grace
        $song1 = $this->songs()->create([
            'title' => 'Amazing Grace',
            'artist' => 'John Newton',
        ]);
        $song1->lyricChunks()->createMany([
            ['label' => '[VERSE 1]', 'content' => "Amazing grace! How sweet the sound\nThat saved a wretch like me!", 'order' => 1],
            ['label' => '[VERSE 2]', 'content' => "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;", 'order' => 2],
            ['label' => '[CHORUS]', 'content' => "My chains are gone, I've been set free\nMy God, my Savior has ransomed me", 'order' => 3],
        ]);

        // 3. Starter Song 2: 10,000 Reasons
        $song2 = $this->songs()->create([
            'title' => '10,000 Reasons (Bless The Lord)',
            'artist' => 'Matt Redman',
        ]);
        $song2->lyricChunks()->createMany([
            ['label' => '[CHORUS]', 'content' => "Bless the Lord, O my soul, O my soul\nWorship His holy name", 'order' => 1],
            ['label' => '[VERSE 1]', 'content' => "The sun comes up, it's a new day dawning\nIt's time to sing Your song again", 'order' => 2],
        ]);

        // 4. Starter Song 3: Goodness Of God
        $song3 = $this->songs()->create([
            'title' => 'Goodness Of God',
            'artist' => 'Bethel Music',
        ]);
        $song3->lyricChunks()->createMany([
            ['label' => '[VERSE 1]', 'content' => "I love You Lord\nFor Your mercy never fails me", 'order' => 1],
            ['label' => '[CHORUS]', 'content' => "All my life You have been faithful\nAll my life You have been so, so good", 'order' => 2],
        ]);
    }

    /**
     * Get or create default system organization.
     */
    public static function getDefault(): self
    {
        return static::firstOrCreate(
            ['slug' => 'default'],
            ['name' => 'PentasLirik Main', 'description' => 'Default Organization']
        );
    }
}
