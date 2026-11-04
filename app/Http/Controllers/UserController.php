<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource with Server-Side Processing:
     * - Search
     * - Filter by role
     * - Filter by status
     * - Sorting
     * - Pagination
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $role = $request->input('role');
        $status = $request->input('status');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        // Sanitize perPage to avoid abuse
        if (!in_array($perPage, [5, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        // Sanitize sortBy columns
        $allowedSorts = ['id', 'name', 'email', 'role', 'status', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query = User::query();

        // 1. Server-side Search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // 2. Server-side Filter: Role
        if (!empty($role) && $role !== 'all') {
            $query->where('role', $role);
        }

        // 3. Server-side Filter: Status
        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        // 4. Server-side Sorting
        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        // 5. Server-side Pagination
        $users = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $role ?? 'all',
                'status' => $status ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'statistics' => [
                'total' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'managers' => User::where('role', 'manager')->count(),
                'editors' => User::where('role', 'editor')->count(),
                'users' => User::where('role', 'user')->count(),
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,manager,editor,user',
            'status' => 'required|in:active,inactive,suspended',
            'phone' => 'nullable|string|max:25',
            'password' => 'required|string|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['avatar'] = 'https://images.unsplash.com/photo-' . rand(1500000000000, 1600000000000) . '?w=150&auto=format&fit=crop&q=80';

        User::create($validated);

        notify()->success('Berhasil Ditambahkan!', "Pengguna {$validated['name']} berhasil dibuat.");

        return redirect()->back();
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'role' => 'required|in:admin,manager,editor,user',
            'status' => 'required|in:active,inactive,suspended',
            'phone' => 'nullable|string|max:25',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'min:6']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        notify()->success('Berhasil Diperbarui!', "Data pengguna {$user->name} berhasil diperbarui.");

        return redirect()->back();
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $userName = $user->name;
        $user->delete();

        notify()->success('Pengguna Dihapus!', "Pengguna {$userName} telah berhasil dihapus dari sistem.");

        return redirect()->back();
    }
}
