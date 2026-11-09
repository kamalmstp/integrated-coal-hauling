<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LoginLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RolePermissionController extends Controller
{
    /**
     * Display Role & Permission Matrix
     */
    public function index(Request $request): Response
    {
        $roles = Role::with('permissions')->withCount('users')->get();
        $permissions = Permission::all()->groupBy('group');

        return Inertia::render('Security/Roles', [
            'roles' => $roles,
            'permissionsGrouped' => $permissions,
        ]);
    }

    /**
     * Store new Role
     */
    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name',
            'label' => 'required|string|max:100',
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        ActivityLog::log('create', 'role', "Membuat role hak akses baru: {$role->label}");

        notify()->success('Role Berhasil Dibuat!', "Role {$role->label} telah ditambahkan.");
        return redirect()->back();
    }

    /**
     * Update Role Permissions
     */
    public function updateRolePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
        ]);

        $role->permissions()->sync($validated['permissions'] ?? []);

        ActivityLog::log('update', 'role', "Memperbarui hak akses role: {$role->label}");

        notify()->success('Hak Akses Role Diperbarui!', "Izin untuk role {$role->label} berhasil diselaraskan.");
        return redirect()->back();
    }

    /**
     * Delete Role
     */
    public function destroyRole(Role $role)
    {
        if ($role->name === 'super_admin') {
            notify()->error('Dilarang!', 'Role Super Administrator tidak dapat dihapus.');
            return redirect()->back();
        }

        if ($role->users()->exists()) {
            notify()->error('Gagal!', 'Role masih digunakan oleh beberapa pengguna sistem.');
            return redirect()->back();
        }

        $label = $role->label;
        $role->delete();

        ActivityLog::log('delete', 'role', "Menghapus role: {$label}");

        notify()->success('Role Dihapus!', "Role {$label} berhasil dihapus.");
        return redirect()->back();
    }

    /**
     * Activity Logs Page
     */
    public function activityLogs(Request $request): Response
    {
        $search = $request->input('search');
        $module = $request->input('module');

        $query = ActivityLog::with('user')->latest('created_at');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if (!empty($module) && $module !== 'all') {
            $query->where('module', $module);
        }

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('Security/ActivityLogs', [
            'logs' => $logs,
            'filters' => [
                'search' => $search ?? '',
                'module' => $module ?? 'all',
            ],
            'modules' => ActivityLog::select('module')->distinct()->pluck('module'),
        ]);
    }

    /**
     * Login Activity Audit Logs
     */
    public function loginLogs(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $query = LoginLog::with(['user', 'activeSite'])->latest('login_at');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('login_input', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Security/LoginLogs', [
            'logs' => $logs,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
            ],
            'statistics' => [
                'total' => LoginLog::count(),
                'success' => LoginLog::where('status', 'success')->count(),
                'failed' => LoginLog::where('status', 'failed')->count(),
                'locked' => LoginLog::whereIn('status', ['locked', 'inactive_blocked'])->count(),
            ],
        ]);
    }
}
