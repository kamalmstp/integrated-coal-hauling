<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeStatusHistory;
use App\Models\EmployeeTransfer;
use App\Models\EmploymentContract;
use App\Models\Position;
use App\Models\Site;
use App\Services\HrManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrEmployeeContractController extends Controller
{
    public function index(Request $request, HrManagementService $hrService)
    {
        $siteId = $request->input('site_id');
        $departmentId = $request->input('department_id');
        $statusFilter = $request->input('employment_status');
        $search = $request->input('search');
        $currentUser = $request->user();

        $employees = Employee::with([
            'site:id,code,name',
            'department:id,code,name',
            'position:id,title,code',
            'activeContract',
            'driver:id,employee_id,driver_code,administrative_eligibility_status',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($statusFilter, fn ($q) => $q->where('employment_status', $statusFilter))
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('employee_code', 'like', "%{$s}%")
                        ->orWhere('name', 'like', "%{$s}%")
                        ->orWhere('nik', 'like', "%{$s}%")
                        ->orWhere('phone', 'like', "%{$s}%");
                });
            })
            ->orderBy('employee_code')
            ->get()
            ->map(function (Employee $emp) use ($hrService, $currentUser) {
                $canSeeSensitive = $hrService->canUserAccessSensitiveEmployeeData($currentUser, $emp);
                $emp->setAttribute('can_access_sensitive', $canSeeSensitive);

                if (!$canSeeSensitive) {
                    $emp->bank_account_number = $emp->bank_account_number
                        ? '****-' . substr($emp->bank_account_number, -4)
                        : null;
                    $emp->npwp_number = $emp->npwp_number ? '***.***.***-***' : null;
                }

                return $emp;
            });

        $contracts = EmploymentContract::with([
            'employee:id,employee_code,name,site_id',
            'site:id,code,name',
            'department:id,code,name',
            'position:id,title,code',
            'parentContract:id,contract_number,sequence_number',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->latest('start_date')
            ->limit(60)
            ->get();

        $expiringContracts = $hrService->getExpiringContracts($siteId ? (int) $siteId : null, 30);

        $transfers = EmployeeTransfer::with([
            'employee:id,employee_code,name',
            'fromSite:id,code,name',
            'toSite:id,code,name',
            'fromDepartment:id,code,name',
            'toDepartment:id,code,name',
            'fromPosition:id,title,code',
            'toPosition:id,title,code',
            'approver:id,name',
        ])
            ->when($siteId, function ($q, $sid) {
                $q->where(fn ($sub) => $sub->where('from_site_id', $sid)->orWhere('to_site_id', $sid));
            })
            ->latest('effective_date')
            ->limit(50)
            ->get();

        $statusHistories = EmployeeStatusHistory::with([
            'employee:id,employee_code,name',
            'site:id,code,name',
            'department:id,code,name',
            'position:id,title,code',
            'oldSite:id,code,name',
            'newSite:id,code,name',
            'recorder:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->latest('effective_date')
            ->latest('id')
            ->limit(60)
            ->get();

        return Inertia::render('Hr/Employees/Index', [
            'employees' => $employees,
            'contracts' => $contracts,
            'expiringContracts' => $expiringContracts,
            'transfers' => $transfers,
            'statusHistories' => $statusHistories,
            'sites' => Site::where('is_active', true)->get(['id', 'code', 'name', 'company_id']),
            'departments' => Department::where('is_active', true)->get(['id', 'company_id', 'code', 'name']),
            'positions' => Position::where('is_active', true)->get(['id', 'department_id', 'code', 'title']),
            'companies' => Company::where('is_active', true)->get(['id', 'code', 'name']),
            'filters' => [
                'site_id' => $siteId,
                'department_id' => $departmentId,
                'employment_status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }

    public function storeEmployee(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'employee_code' => 'nullable|string|max:40|unique:employees,employee_code',
            'nik' => 'required|string|max:32|unique:employees,nik',
            'name' => 'required|string|max:160',
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:L,P',
            'marital_status' => 'nullable|string|max:24',
            'company_id' => 'nullable|exists:companies,id',
            'site_id' => 'required|exists:sites,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'join_date' => 'required|date',
            'employment_status' => 'required|in:PKWT,PKWTT,Probation,Contract,Permanent',
            'phone' => 'nullable|string|max:32',
            'email' => 'nullable|email|max:120',
            'address' => 'nullable|string|max:500',
            'bank_name' => 'nullable|string|max:80',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_holder' => 'nullable|string|max:150',
            'npwp_number' => 'nullable|string|max:40',
            'bpjs_kesehatan_number' => 'nullable|string|max:40',
            'bpjs_ketenagakerjaan_number' => 'nullable|string|max:40',
            'is_active' => 'nullable|boolean',
            'create_initial_contract' => 'nullable|boolean',
            'contract_end_date' => 'nullable|date|after_or_equal:join_date',
            'basic_salary' => 'nullable|numeric|min:0',
        ]);

        if (empty($validated['company_id'])) {
            $site = Site::findOrFail($validated['site_id']);
            $validated['company_id'] = $site->company_id ?? Company::first()?->id;
        }

        $emp = $hrService->createEmployee($validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Data Karyawan Ditambahkan',
            'message' => "Karyawan {$emp->name} ({$emp->employee_code}) berhasil didaftarkan ke Master HR.",
        ]);
    }

    public function updateEmployee(Request $request, Employee $employee, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:160',
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:32',
            'email' => 'nullable|email|max:120',
            'address' => 'nullable|string|max:500',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'employment_status' => 'required|string|max:40',
            'bank_name' => 'nullable|string|max:80',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_holder' => 'nullable|string|max:150',
            'npwp_number' => 'nullable|string|max:40',
            'bpjs_kesehatan_number' => 'nullable|string|max:40',
            'bpjs_ketenagakerjaan_number' => 'nullable|string|max:40',
            'is_active' => 'required|boolean',
        ]);

        $hrService->updateEmployee($employee, $validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Data Karyawan Diperbarui',
            'message' => "Profil HR karyawan {$employee->name} berhasil diperbarui.",
        ]);
    }

    public function storeContract(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'site_id' => 'nullable|exists:sites,id',
            'contract_type' => 'required|in:PKWT,PKWTT',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'basic_salary' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $contract = $hrService->createContract($employee, $validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Kontrak Kerja Diterbitkan',
            'message' => "Kontrak {$contract->contract_type} ({$contract->contract_number}) untuk {$employee->name} telah aktif.",
        ]);
    }

    public function extendContract(Request $request, EmploymentContract $employmentContract, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'required|date',
            'basic_salary' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $extended = $hrService->extendContract($employmentContract, $validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Perpanjangan Kontrak Berhasil',
            'message' => "Kontrak diperpanjang menjadi {$extended->contract_number} (Urutan ke-{$extended->sequence_number}).",
        ]);
    }

    public function recordSeparation(Request $request, Employee $employee, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'separation_type' => 'required|in:resignation,termination',
            'separation_date' => 'required|date',
            'reason' => 'required|string|max:500',
        ]);

        $hrService->recordSeparation($employee, $validated);

        return back()->with('notify', [
            'type' => 'warning',
            'title' => 'Status Hubungan Kerja Diakhiri',
            'message' => "Status {$validated['separation_type']} untuk {$employee->name} telah dicatat pada histori HR.",
        ]);
    }

    public function storeTransfer(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'transfer_type' => 'nullable|in:site_mutation,department_transfer,promotion,demotion',
            'effective_date' => 'required|date',
            'to_site_id' => 'required|exists:sites,id',
            'to_department_id' => 'required|exists:departments,id',
            'to_position_id' => 'required|exists:positions,id',
            'reason' => 'required|string|max:500',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $transfer = $hrService->transferEmployee($employee, $validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Mutasi / Transfer Karyawan Berhasil',
            'message' => "Dokumen mutasi {$transfer->transfer_number} untuk {$employee->name} telah efektif.",
        ]);
    }
}
