<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Role;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display listing of users with Server-Side Processing
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $role = $request->input('role');
        $status = $request->input('status');
        $siteId = $request->input('site_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        if (!in_array($perPage, [5, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $allowedSorts = ['id', 'name', 'email', 'role', 'status', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query = User::with(['roles', 'employee', 'site', 'company', 'sites']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($role) && $role !== 'all') {
            $query->where(function ($q) use ($role) {
                $q->where('role', $role)
                  ->orWhereHas('roles', fn($sub) => $sub->where('name', $role));
            });
        }

        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        if (!empty($siteId) && $siteId !== 'all') {
            $query->where('site_id', $siteId);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        $users = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $role ?? 'all',
                'status' => $status ?? 'all',
                'site_id' => $siteId ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'roles' => Role::where('is_active', true)->select('id', 'name', 'label')->get(),
            'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
            'companies' => Company::where('is_active', true)->select('id', 'name', 'code')->get(),
            'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get(),
            'statistics' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'inactive' => User::where('status', 'inactive')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
            ],
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|string',
            'status' => 'required|in:active,inactive,suspended',
            'phone' => 'nullable|string|max:25',
            'employee_id' => 'nullable|exists:employees,id',
            'site_id' => 'nullable|exists:sites,id',
            'company_id' => 'nullable|exists:companies,id',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'site_ids' => 'nullable|array',
            'site_ids.*' => 'exists:sites,id',
            'password' => 'required|string|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['avatar'] = 'https://images.unsplash.com/photo-' . rand(1500000000000, 1600000000000) . '?w=150&auto=format&fit=crop&q=80';

        $user = User::create($validated);

        if (!empty($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        } elseif ($matchedRole = Role::where('name', $validated['role'])->first()) {
            $user->roles()->sync([$matchedRole->id]);
        }

        if (!empty($validated['site_ids'])) {
            $syncData = [];
            foreach ($validated['site_ids'] as $sId) {
                $syncData[$sId] = ['is_default' => ($sId == $user->site_id)];
            }
            $user->sites()->sync($syncData);
        }

        ActivityLog::log('create', 'user', "Mendaftarkan pengguna baru: {$user->name} ({$user->email})");

        notify()->success('Pengguna Berhasil Dibuat!', "Akun {$user->name} telah aktif.");
        return redirect()->back();
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => "nullable|string|max:50|unique:users,username,{$user->id}",
            'email' => "required|email|unique:users,email,{$user->id}",
            'role' => 'required|string',
            'status' => 'required|in:active,inactive,suspended',
            'phone' => 'nullable|string|max:25',
            'employee_id' => 'nullable|exists:employees,id',
            'site_id' => 'nullable|exists:sites,id',
            'company_id' => 'nullable|exists:companies,id',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'site_ids' => 'nullable|array',
            'site_ids.*' => 'exists:sites,id',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'min:6']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        if (isset($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        if (isset($validated['site_ids'])) {
            $syncData = [];
            foreach ($validated['site_ids'] as $sId) {
                $syncData[$sId] = ['is_default' => ($sId == $user->site_id)];
            }
            $user->sites()->sync($syncData);
        }

        ActivityLog::log('update', 'user', "Memperbarui profil pengguna: {$user->name}");

        notify()->success('Pengguna Diperbarui!', "Data pengguna {$user->name} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Reset user password (admin assisted)
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'new_password' => 'required|string|min:6',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        ActivityLog::log('update', 'user', "Reset password pengguna: {$user->name} ({$user->email})");

        notify()->success('Password Berhasil Direset!', "Password baru telah disimpan untuk {$user->name}.");
        return redirect()->back();
    }

    /**
     * Toggle status (activate / deactivate / lock)
     */
    public function toggleStatus(Request $request, User $user)
    {
        if ($user->id === auth()->id()) {
            notify()->error('Dilarang!', 'Anda tidak dapat mengubah status akun Anda sendiri.');
            return redirect()->back();
        }

        $validated = $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update(['status' => $validated['status']]);

        ActivityLog::log('status_change', 'user', "Mengubah status pengguna {$user->name} menjadi {$validated['status']}");

        notify()->success('Status Diperbarui!', "Status akun {$user->name} kini: {$validated['status']}.");
        return redirect()->back();
    }

    /**
     * Delete user
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            notify()->error('Dilarang!', 'Anda tidak dapat menghapus akun Anda sendiri.');
            return redirect()->back();
        }

        $userName = $user->name;
        $user->delete();

        ActivityLog::log('delete', 'user', "Menghapus akun pengguna: {$userName}");

        notify()->success('Pengguna Dihapus!', "Pengguna {$userName} telah dipindahkan ke arsip.");
        return redirect()->back();
    }
}
