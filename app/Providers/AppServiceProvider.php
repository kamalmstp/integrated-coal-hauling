<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Intercept all Gates for RBAC and permissions
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('super_admin') || $user->role === 'admin') {
                return true;
            }

            return $user->hasPermission($ability) ? true : null;
        });
    }
}
