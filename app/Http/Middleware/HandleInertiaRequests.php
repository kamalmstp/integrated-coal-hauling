<?php

namespace App\Http\Middleware;

use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $activeSiteId = null;
        $activeSite = null;
        $accessibleSites = collect();

        if ($user) {
            $activeSiteId = session('active_site_id') ?? $user->site_id;
            if ($activeSiteId) {
                $activeSite = Site::find($activeSiteId);
            }
            $accessibleSites = $user->getAccessibleSites();
        }

        return [
            ...parent::share($request),
            'appName' => 'TAP Integrated Coal Hauling Management System',
            'flash' => [
                'notify' => fn () => $request->session()->get('notify'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'roles' => $user->roles()->pluck('name')->toArray(),
                    'permissions' => $user->getAllPermissions(),
                    'is_super_admin' => $user->hasRole('super_admin') || $user->role === 'admin',
                    'site_id' => $activeSiteId,
                    'site_name' => $activeSite?->name,
                    'default_site_id' => $user->site_id,
                    'status' => $user->status,
                ] : null,
                'active_site' => $activeSite ? [
                    'id' => $activeSite->id,
                    'name' => $activeSite->name,
                    'code' => $activeSite->code,
                    'location' => $activeSite->location,
                ] : null,
                'accessible_sites' => $accessibleSites->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                ])->toArray(),
            ],
        ];
    }
}
