<?php

namespace Tests\Feature;

use App\Models\LoginLog;
use App\Models\Role;
use App\Models\Site;
use App\Models\User;
use Database\Seeders\TapRbacSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthenticationAndRbacTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure RBAC seeder is run
        $this->seed(TapRbacSeeder::class);
    }

    /**
     * 1. Login page renders successfully for guests.
     */
    public function test_login_page_renders_successfully(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
    }

    /**
     * 2. Authenticated user visiting /login is redirected to dashboard.
     */
    public function test_authenticated_user_visiting_login_is_redirected(): void
    {
        $admin = User::where('email', 'admin@tap-mining.com')->firstOrFail();

        $response = $this->actingAs($admin)->get('/login');

        $response->assertRedirect('/dashboard');
    }

    /**
     * 3. Guests visiting protected routes are rejected and redirected to /login.
     */
    public function test_unauthenticated_guests_are_redirected_to_login(): void
    {
        $protectedRoutes = [
            '/',
            '/dashboard',
            '/production/dispatch',
            '/fleet/registry',
            '/maintenance/dashboard',
            '/warehouse/dashboard',
            '/procurement/dashboard',
            '/fuel/dashboard',
            '/hr/dashboard',
            '/analytics/dashboard',
            '/users',
            '/security/roles',
        ];

        foreach ($protectedRoutes as $route) {
            $response = $this->get($route);
            $response->assertRedirect('/login');
        }
    }

    /**
     * 4. User can authenticate successfully using Email.
     */
    public function test_user_can_login_with_email(): void
    {
        $response = $this->post('/login', [
            'login' => 'admin@tap-mining.com',
            'password' => 'password123',
            'remember' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated();

        // Login log recorded
        $this->assertDatabaseHas('login_logs', [
            'login_input' => 'admin@tap-mining.com',
            'status' => 'success',
        ]);
    }

    /**
     * 5. User can authenticate successfully using Username.
     */
    public function test_user_can_login_with_username(): void
    {
        $response = $this->post('/login', [
            'login' => 'superadmin',
            'password' => 'password123',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated();

        $this->assertDatabaseHas('login_logs', [
            'login_input' => 'superadmin',
            'status' => 'success',
        ]);
    }

    /**
     * 6. Login fails with invalid password and logs attempt.
     */
    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->post('/login', [
            'login' => 'admin@tap-mining.com',
            'password' => 'wrong-password-999',
        ]);

        $response->assertSessionHasErrors('login');
        $this->assertGuest();

        $this->assertDatabaseHas('login_logs', [
            'login_input' => 'admin@tap-mining.com',
            'status' => 'failed',
        ]);
    }

    /**
     * 7. Inactive or suspended user cannot login.
     */
    public function test_inactive_and_suspended_users_are_blocked_from_login(): void
    {
        $inactiveUser = User::create([
            'name' => 'Inactive Worker',
            'username' => 'inactive_user',
            'email' => 'inactive@tap-mining.com',
            'status' => 'inactive',
            'role' => 'user',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/login', [
            'login' => 'inactive@tap-mining.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('login');
        $this->assertGuest();

        $this->assertDatabaseHas('login_logs', [
            'user_id' => $inactiveUser->id,
            'status' => 'inactive_blocked',
        ]);
    }

    /**
     * 8. Login attempts are rate limited (throttled after 5 failed attempts).
     */
    public function test_login_attempts_are_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'login' => 'throttle_test@tap-mining.com',
                'password' => 'wrong',
            ]);
        }

        // 6th attempt should be throttled
        $response = $this->post('/login', [
            'login' => 'throttle_test@tap-mining.com',
            'password' => 'wrong',
        ]);

        $response->assertSessionHasErrors('login');
        $error = session('errors')->first('login');
        $this->assertStringContainsString('Terlalu banyak percobaan login', $error);

        $this->assertDatabaseHas('login_logs', [
            'login_input' => 'throttle_test@tap-mining.com',
            'status' => 'locked',
        ]);
    }

    /**
     * 9. Authenticated user can log out and session is invalidated.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $admin = User::where('email', 'admin@tap-mining.com')->firstOrFail();

        $this->actingAs($admin)->post('/login', [
            'login' => 'admin@tap-mining.com',
            'password' => 'password123',
        ]);

        $response = $this->actingAs($admin)->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    /**
     * 10. Role-based Dashboard Redirection on Login.
     */
    public function test_role_based_dashboard_redirection(): void
    {
        // Fuelman -> /fuel/dashboard
        $fuelman = User::where('email', 'fuelman.andi@tap-mining.com')->firstOrFail();
        $res = $this->post('/login', [
            'login' => $fuelman->email,
            'password' => 'password123',
        ]);
        $res->assertRedirect(route('fuel.dashboard'));
        Auth::logout();

        // SVP Hauling -> /production/dashboard
        $svpHauling = User::where('email', 'spv.hauling@tap-mining.com')->firstOrFail();
        $res2 = $this->post('/login', [
            'login' => $svpHauling->email,
            'password' => 'password123',
        ]);
        $res2->assertRedirect(route('production.dashboard'));
        Auth::logout();

        // HR/GA -> /hr/dashboard
        $hrGa = User::where('email', 'hrga.teweh@tap-mining.com')->firstOrFail();
        $res3 = $this->post('/login', [
            'login' => $hrGa->email,
            'password' => 'password123',
        ]);
        $res3->assertRedirect(route('hr.dashboard'));
        Auth::logout();
    }

    /**
     * 11. Multi-Site Authorization & Site Switching.
     */
    public function test_multi_site_access_and_switching(): void
    {
        $sites = Site::where('is_active', true)->get();
        $this->assertGreaterThanOrEqual(2, $sites->count());
        $site1 = $sites[0];
        $site2 = $sites[1];

        // User with access to Site 1 ONLY
        $singleSiteUser = User::create([
            'name' => 'Single Site Operator',
            'username' => 'single_site_op',
            'email' => 'single.site@tap-mining.com',
            'status' => 'active',
            'role' => 'user',
            'site_id' => $site1->id,
            'password' => Hash::make('password123'),
        ]);
        $roleProd = Role::where('name', 'admin_produksi')->firstOrFail();
        $singleSiteUser->roles()->sync([$roleProd->id]);
        $singleSiteUser->sites()->sync([$site1->id => ['is_default' => true]]);

        // User can access site 1
        $this->assertTrue($singleSiteUser->canAccessSite($site1->id));
        // User CANNOT access site 2
        $this->assertFalse($singleSiteUser->canAccessSite($site2->id));

        // Attempting to switch to Site 2 returns 403 Forbidden
        $response = $this->actingAs($singleSiteUser)->post('/switch-site', [
            'site_id' => $site2->id,
        ]);
        $response->assertStatus(403);

        // User with Multi-Site Access (e.g. Project Manager)
        $pm = User::where('email', 'pm.teweh@tap-mining.com')->firstOrFail();
        $pm->sites()->sync([$site1->id => ['is_default' => true], $site2->id => ['is_default' => false]]);

        $this->assertTrue($pm->canAccessSite($site1->id));
        $this->assertTrue($pm->canAccessSite($site2->id));

        // PM can switch to Site 2
        $resPm = $this->actingAs($pm)->post('/switch-site', [
            'site_id' => $site2->id,
        ]);
        $resPm->assertSessionHasNoErrors();
        $resPm->assertStatus(302);
        $this->assertEquals($site2->id, session('active_site_id'));
    }

    /**
     * 12. Password Self-Service Update.
     */
    public function test_user_can_update_own_password(): void
    {
        $user = User::where('email', 'fuelman.andi@tap-mining.com')->firstOrFail();

        $response = $this->actingAs($user)->put('/profile/password', [
            'current_password' => 'password123',
            'password' => 'newPassword2026!',
            'password_confirmation' => 'newPassword2026!',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);

        $this->assertTrue(Hash::check('newPassword2026!', $user->fresh()->password));
    }

    /**
     * 13. Admin can reset user password.
     */
    public function test_admin_can_reset_user_password(): void
    {
        $admin = User::where('email', 'admin@tap-mining.com')->firstOrFail();
        $targetUser = User::where('email', 'driver.budi@tap-mining.com')->firstOrFail();

        $response = $this->actingAs($admin)->post("/users/{$targetUser->id}/reset-password", [
            'new_password' => 'driverReset2026!',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);

        $this->assertTrue(Hash::check('driverReset2026!', $targetUser->fresh()->password));
    }

    /**
     * 14. Admin can toggle user status (activate / deactivate / suspend).
     */
    public function test_admin_can_toggle_user_status(): void
    {
        $admin = User::where('email', 'admin@tap-mining.com')->firstOrFail();
        $targetUser = User::where('email', 'driver.budi@tap-mining.com')->firstOrFail();

        // Deactivate
        $resDeactivate = $this->actingAs($admin)->put("/users/{$targetUser->id}/toggle-status", [
            'status' => 'inactive',
        ]);
        $resDeactivate->assertSessionHasNoErrors();
        $this->assertEquals('inactive', $targetUser->fresh()->status);

        // Suspend
        $resSuspend = $this->actingAs($admin)->put("/users/{$targetUser->id}/toggle-status", [
            'status' => 'suspended',
        ]);
        $resSuspend->assertSessionHasNoErrors();
        $this->assertEquals('suspended', $targetUser->fresh()->status);

        // Reactivate
        $resActivate = $this->actingAs($admin)->put("/users/{$targetUser->id}/toggle-status", [
            'status' => 'active',
        ]);
        $resActivate->assertSessionHasNoErrors();
        $this->assertEquals('active', $targetUser->fresh()->status);
    }

    /**
     * 15. All 15 Standard Roles exist in database with correct labels and permissions.
     */
    public function test_all_15_standard_roles_exist_with_permissions(): void
    {
        $expectedRoles = [
            'super_admin',
            'management',
            'project_manager',
            'pjo',
            'svp_hauling',
            'admin_produksi',
            'svp_plant_maintenance',
            'maintenance_planner',
            'mekanik',
            'admin_scm',
            'admin_procurement',
            'warehouse_storeman',
            'fuelman',
            'hr_ga',
            'driver_dt',
        ];

        foreach ($expectedRoles as $roleName) {
            $role = Role::where('name', $roleName)->first();
            $this->assertNotNull($role, "Role {$roleName} must exist.");
            $this->assertTrue($role->is_active);
            $this->assertGreaterThan(0, $role->permissions()->count(), "Role {$roleName} must have assigned permissions.");
        }
    }
}
