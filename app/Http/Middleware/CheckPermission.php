<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  string  ...$permissions  One or more permission names
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->guest(route('login'));
        }

        // Super Admin or legacy admin bypasses granular check
        if ($user->hasRole('super_admin') || $user->role === 'admin') {
            return $next($request);
        }

        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        abort(403, 'Akses Ditolak: Anda tidak memiliki izin untuk mengakses fitur atau tindakan ini.');
    }
}
