<?php

namespace App\Http\Middleware;

use App\Models\Site;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceSiteAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $activeSiteId = session('active_site_id');

            if (!$activeSiteId) {
                // Initialize default active site
                $activeSiteId = $user->site_id;
                if (!$activeSiteId && $user->sites()->exists()) {
                    $activeSiteId = $user->sites()->first()->id;
                }
                if (!$activeSiteId) {
                    $activeSiteId = Site::where('is_active', true)->value('id');
                }
                session(['active_site_id' => $activeSiteId]);
            } else {
                // Validate if user still has access
                if (!$user->canAccessSite($activeSiteId)) {
                    // Reset to user's primary site if authorized, else first accessible
                    $fallback = $user->site_id ?: $user->sites()->first()?->id;
                    if ($fallback && $user->canAccessSite($fallback)) {
                        session(['active_site_id' => $fallback]);
                    } else {
                        abort(403, 'Akses Ditolak: Anda tidak memiliki akses ke site aktif yang dipilih.');
                    }
                }
            }
        }

        return $next($request);
    }
}
