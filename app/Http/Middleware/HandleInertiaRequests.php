<?php

namespace App\Http\Middleware;

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
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'roles' => $user->roles()->pluck('name')->toArray(),
                    'permissions' => $user->getAllPermissions(),
                    'site_id' => $user->site_id,
                    'site_name' => $user->site?->name,
                ] : [
                    // Default fallback session for unauthenticated demo/development browsing
                    'id' => 1,
                    'name' => 'Mustapa Ahmad Kamal (Administrator)',
                    'email' => 'admin@tap-mining.com',
                    'role' => 'admin',
                    'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    'roles' => ['super_admin'],
                    'permissions' => [
                        'view_dashboard', 'manage_companies', 'manage_sites', 'manage_departments',
                        'manage_positions', 'manage_employees', 'manage_drivers', 'manage_units',
                        'manage_locations', 'manage_shifts', 'manage_vendors', 'manage_customers',
                        'manage_materials', 'manage_users', 'manage_roles', 'view_activity_logs', 'manage_settings'
                    ],
                    'site_id' => 1,
                    'site_name' => 'Site Muara Teweh',
                ],
            ],
        ];
    }
}
