<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

abstract class Controller
{
    /**
     * Check whether the authenticated user is a global administrator.
     */
    protected function isGlobalAdminUser(): bool
    {
        $user = Auth::user();
        if (!$user) {
            return true;
        }

        return in_array($user->role, ['admin', 'super_admin'], true)
            || (method_exists($user, 'hasRole') && $user->hasRole(['super_admin', 'admin']));
    }

    /**
     * Enforce site isolation / IDOR prevention when an authenticated non-admin user is assigned to a specific site.
     */
    protected function authorizeSiteAccess(?int $targetSiteId, string $field = 'site_id'): void
    {
        $user = Auth::user();
        if (!$user || !$user->site_id || $targetSiteId === null) {
            return;
        }

        if (!$this->isGlobalAdminUser() && (int) $user->site_id !== (int) $targetSiteId) {
            throw ValidationException::withMessages([
                $field => 'Akses ditolak (Site Isolation / IDOR Protection): Anda tidak memiliki otorisasi untuk mengakses atau memodifikasi data pada site ini.',
            ]);
        }
    }

    /**
     * Resolve effective site_id filter respecting user site lock.
     */
    protected function resolveAuthorizedSiteId($requestedSiteId): ?int
    {
        $user = Auth::user();
        if ($user && $user->site_id && !$this->isGlobalAdminUser()) {
            return (int) $user->site_id;
        }

        return $requestedSiteId !== null && $requestedSiteId !== '' ? (int) $requestedSiteId : null;
    }
}

