<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Display the login page.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect($this->getDashboardRedirectForUser(Auth::user()));
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Handle incoming authentication request.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
            'remember' => 'nullable|boolean',
        ], [
            'login.required' => 'Username atau Email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $loginInput = trim($request->input('login'));
        $password = $request->input('password');
        $remember = (bool) $request->boolean('remember');

        // Rate Limiting Key: IP + Login input
        $throttleKey = Str::transliterate(Str::lower($loginInput) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            LoginLog::create([
                'user_id' => null,
                'login_input' => $loginInput,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'locked',
                'failure_reason' => 'Too many login attempts - throttled',
                'login_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'login' => ["Terlalu banyak percobaan login. Silakan coba lagi dalam {$seconds} detik."],
            ]);
        }

        // Find user by email or username
        $user = User::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            LoginLog::create([
                'user_id' => $user?->id,
                'login_input' => $loginInput,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'failed',
                'failure_reason' => !$user ? 'User not found' : 'Invalid password',
                'login_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'login' => ['Kredensial yang diberikan tidak cocok dengan data kami.'],
            ]);
        }

        // Check user active status
        if (!$user->isActive()) {
            RateLimiter::hit($throttleKey, 60);

            LoginLog::create([
                'user_id' => $user->id,
                'login_input' => $loginInput,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'inactive_blocked',
                'failure_reason' => "Account is not active (status: {$user->status})",
                'login_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'login' => ['Akun Anda dinonaktifkan atau ditangguhkan. Silakan hubungi Administrator TAP.'],
            ]);
        }

        // Successful authentication
        RateLimiter::clear($throttleKey);
        Auth::login($user, $remember);
        $request->session()->regenerate();

        // Resolve default active site
        $defaultSiteId = $user->site_id;
        if (!$defaultSiteId && $user->sites()->exists()) {
            $defaultSiteId = $user->sites()->first()->id;
        }
        if (!$defaultSiteId) {
            $defaultSiteId = Site::where('is_active', true)->value('id');
        }

        session(['active_site_id' => $defaultSiteId]);

        // Record successful login log
        $log = LoginLog::create([
            'user_id' => $user->id,
            'login_input' => $loginInput,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'success',
            'active_site_id' => $defaultSiteId,
            'login_at' => now(),
        ]);

        session(['tap_login_log_id' => $log->id]);

        $user->update(['last_login_at' => now()]);

        $redirectUrl = $this->getDashboardRedirectForUser($user);

        return redirect()->intended($redirectUrl)->with('success', "Selamat datang kembali, {$user->name}!");
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        $logId = session('tap_login_log_id');
        if ($logId) {
            LoginLog::where('id', $logId)->update(['logout_at' => now()]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('info', 'Anda telah berhasil keluar dari sistem TAP.');
    }

    /**
     * Switch user's active site session.
     */
    public function switchSite(Request $request): RedirectResponse
    {
        $request->validate([
            'site_id' => 'required|exists:sites,id',
        ]);

        $user = $request->user();
        $siteId = (int) $request->input('site_id');

        if (!$user->canAccessSite($siteId)) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang untuk mengakses data pada site ini.');
        }

        session(['active_site_id' => $siteId]);
        $site = Site::find($siteId);

        return back()->with('success', "Berhasil beralih ke {$site->name}.");
    }

    /**
     * Update user password (self-service).
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'password.min' => 'Password baru minimal 8 karakter.',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak sesuai.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password Anda berhasil diperbarui.');
    }

    /**
     * Determine role-based dashboard redirection URL.
     */
    protected function getDashboardRedirectForUser(User $user): string
    {
        if ($user->hasRole(['super_admin', 'management']) || $user->role === 'admin') {
            return route('analytics.dashboard');
        }

        if ($user->hasRole(['project_manager', 'pjo'])) {
            return route('dashboard');
        }

        if ($user->hasRole(['svp_hauling', 'admin_produksi'])) {
            return route('production.dashboard');
        }

        if ($user->hasRole(['svp_plant_maintenance', 'maintenance_planner', 'mekanik'])) {
            return route('maintenance.dashboard');
        }

        if ($user->hasRole(['admin_scm', 'admin_procurement', 'warehouse_storeman'])) {
            return route('warehouse.dashboard');
        }

        if ($user->hasRole('fuelman')) {
            return route('fuel.dashboard');
        }

        if ($user->hasRole('hr_ga')) {
            return route('hr.dashboard');
        }

        if ($user->hasRole('driver_dt')) {
            return route('fleet.p2h.index');
        }

        return route('dashboard');
    }
}
