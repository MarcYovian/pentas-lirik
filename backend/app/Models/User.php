<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * User has many setlists.
     */
    public function setlists(): HasMany
    {
        return $this->hasMany(Setlist::class);
    }

    /**
     * Organizations the user belongs to.
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_user')
            ->withPivot(['role', 'status'])
            ->withTimestamps();
    }

    /**
     * Active organizations the user is an approved member of.
     */
    public function activeOrganizations(): BelongsToMany
    {
        return $this->organizations()->wherePivot('status', 'ACTIVE');
    }

    /**
     * Check if user is a system-wide super administrator.
     */
    public function isSuperAdmin(): bool
    {
        return strtoupper($this->role) === 'ADMIN';
    }

    /**
     * Check if user is an admin of a specific organization.
     */
    public function isOrgAdmin(int|Organization $org): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $orgId = $org instanceof Organization ? $org->id : $org;
        $membership = $this->organizations()->where('organizations.id', $orgId)->first();

        return $membership && $membership->pivot->role === 'ADMIN' && $membership->pivot->status === 'ACTIVE';
    }

    /**
     * Get membership status in a specific organization.
     */
    public function getMembershipStatus(int|Organization $org): ?string
    {
        $orgId = $org instanceof Organization ? $org->id : $org;
        $membership = $this->organizations()->where('organizations.id', $orgId)->first();

        return $membership?->pivot?->status;
    }
}
