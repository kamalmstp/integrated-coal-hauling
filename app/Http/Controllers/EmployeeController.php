<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display listing of employees with Server-Side Processing
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $departmentId = $request->input('department_id');
        $siteId = $request->input('site_id');
        $status = $request->input('status');
        $employmentStatus = $request->input('employment_status');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        $allowedSorts = ['id', 'employee_code', 'name', 'nik', 'join_date', 'employment_status', 'is_active', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query = Employee::with(['company', 'site', 'department', 'position', 'driver']);

        // Search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filters
        if (!empty($departmentId) && $departmentId !== 'all') {
            $query->where('department_id', $departmentId);
        }
        if (!empty($siteId) && $siteId !== 'all') {
            $query->where('site_id', $siteId);
        }
        if (!empty($status) && $status !== 'all') {
            $query->where('is_active', $status === 'active');
        }
        if (!empty($employmentStatus) && $employmentStatus !== 'all') {
            $query->where('employment_status', $employmentStatus);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        $employees = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search ?? '',
                'department_id' => $departmentId ?? 'all',
                'site_id' => $siteId ?? 'all',
                'status' => $status ?? 'all',
                'employment_status' => $employmentStatus ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'companies' => Company::where('is_active', true)->select('id', 'name', 'code')->get(),
            'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
            'departments' => Department::where('is_active', true)->select('id', 'name', 'code')->get(),
            'positions' => Position::where('is_active', true)->select('id', 'title', 'code', 'department_id')->get(),
        ]);
    }

    /**
     * Store new employee
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_code' => 'required|string|max:50|unique:employees,employee_code',
            'nik' => 'required|string|max:30|unique:employees,nik',
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'site_id' => 'required|exists:sites,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'join_date' => 'required|date',
            'employment_status' => 'required|in:permanent,contract,pkwt,probation,resigned',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
            'document_notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $employee = Employee::create($validated);

        ActivityLog::log('create', 'employee', "Mendaftarkan karyawan baru: {$employee->name} ({$employee->employee_code})");

        notify()->success('Karyawan Berhasil Didaftarkan!', "{$employee->name} telah ditambahkan ke database TAP.");
        return redirect()->back();
    }

    /**
     * Update employee
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'employee_code' => "required|string|max:50|unique:employees,employee_code,{$employee->id}",
            'nik' => "required|string|max:30|unique:employees,nik,{$employee->id}",
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'site_id' => 'required|exists:sites,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'join_date' => 'required|date',
            'employment_status' => 'required|in:permanent,contract,pkwt,probation,resigned',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
            'document_notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $employee->update($validated);

        ActivityLog::log('update', 'employee', "Memperbarui data karyawan: {$employee->name} ({$employee->employee_code})");

        notify()->success('Data Karyawan Diperbarui!', "Data {$employee->name} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Delete employee
     */
    public function destroy(Employee $employee)
    {
        if ($employee->driver()->exists()) {
            notify()->error('Gagal Menghapus!', 'Karyawan terdaftar sebagai Driver aktif. Hapus data driver terlebih dahulu.');
            return redirect()->back();
        }

        if ($employee->user()->exists()) {
            notify()->error('Gagal Menghapus!', 'Karyawan memiliki akun pengguna sistem yang terhubung.');
            return redirect()->back();
        }

        $name = $employee->name;
        $employee->delete();

        ActivityLog::log('delete', 'employee', "Menghapus karyawan: {$name}");

        notify()->success('Karyawan Dihapus!', "Data {$name} telah dipindahkan ke riwayat soft delete.");
        return redirect()->back();
    }
}
