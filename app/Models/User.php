<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'username',
        'email',
        'role',
        'status',
        'phone',
        'avatar',
        'password',
        'employee_id',
        'site_id',
        'company_id',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_has_roles');
    }

    public function sites(): BelongsToMany
    {
        return $this->belongsToMany(Site::class, 'user_has_sites')
            ->withPivot('is_default')
            ->withTimestamps();
    }

    public function loginLogs(): HasMany
    {
        return $this->hasMany(LoginLog::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canAccessSite(int|string|null $siteId): bool
    {
        if (empty($siteId)) {
            return false;
        }

        // Super Admin and Management have global access across all sites
        if ($this->hasRole(['super_admin', 'management']) || $this->role === 'admin') {
            return true;
        }

        // Check primary site
        if ((int) $this->site_id === (int) $siteId) {
            return true;
        }

        // Check assigned sites pivot
        return $this->sites()->where('sites.id', $siteId)->exists();
    }

    public function getAccessibleSites()
    {
        if ($this->hasRole(['super_admin', 'management']) || $this->role === 'admin') {
            return Site::where('is_active', true)->orderBy('name')->get();
        }

        $siteIds = $this->sites()->pluck('sites.id');
        if ($this->site_id) {
            $siteIds->push($this->site_id);
        }

        $uniqueIds = $siteIds->filter()->unique()->values()->toArray();

        return Site::whereIn('id', $uniqueIds)->where('is_active', true)->orderBy('name')->get();
    }

    public function hasRole(string|array $roleNames): bool
    {
        $names = is_array($roleNames) ? $roleNames : [$roleNames];

        // Also check legacy string role column for backwards compatibility
        if (in_array($this->role, $names)) {
            return true;
        }

        return $this->roles()->whereIn('name', $names)->exists();
    }

    public function hasPermission(string $permissionName): bool
    {
        if ($this->hasRole('super_admin') || $this->role === 'admin') {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', fn($q) => $q->where('name', $permissionName))
            ->exists();
    }

    public function getAllPermissions(): array
    {
        if ($this->hasRole('super_admin') || $this->role === 'admin') {
            return Permission::pluck('name')->toArray();
        }

        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique()
            ->values()
            ->toArray();
    }
}
