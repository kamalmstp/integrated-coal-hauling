<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\Department;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EmploymentContract;
use App\Models\HrSiteSetting;
use App\Models\LeaveRequest;
use App\Models\Position;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Models\User;
use App\Services\HrManagementService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class HrEmployeeManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected Site $siteA;
    protected Site $siteB;
    protected Department $deptA;
    protected Position $posA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::where('role', 'admin')->first() ?? User::first();
        $sites = Site::where('is_active', true)->orderBy('id')->get();
        $this->siteA = $sites->first();
        $this->siteB = $sites->skip(1)->first() ?? Site::create([
            'company_id' => $this->siteA->company_id ?? Company::first()->id,
            'code' => 'SITE-TEST-B',
            'name' => 'Site Tambang Uji B',
            'location' => 'Kalimantan Timur',
            'is_active' => true,
        ]);

        $this->deptA = Department::where('is_active', true)->first() ?? Department::first();
        $this->posA = Position::where('department_id', $this->deptA->id)->first() ?? Position::first();
    }

    public function test_employee_crud_and_status_history(): void
    {
        $response = $this->actingAs($this->admin)->post('/hr/employees', [
            'employee_code' => 'EMP-TEST-801',
            'nik' => '6371019988770001',
            'name' => 'Rahmat Hidayatullah',
            'birth_place' => 'Banjarmasin',
            'birth_date' => '1993-04-12',
            'gender' => 'L',
            'marital_status' => 'K/1',
            'site_id' => $this->siteA->id,
            'department_id' => $this->deptA->id,
            'position_id' => $this->posA->id,
            'join_date' => now()->toDateString(),
            'employment_status' => 'PKWT',
            'phone' => '081255667788',
            'address' => 'Jl. A. Yani Km 14 Gambut',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '0310099887766',
            'bank_account_holder' => 'Rahmat Hidayatullah',
            'npwp_number' => '89.111.222.3-731.000',
            'bpjs_kesehatan_number' => '0009988776611',
            'bpjs_ketenagakerjaan_number' => '2109988776611',
            'create_initial_contract' => true,
            'contract_end_date' => now()->addMonths(6)->toDateString(),
            'basic_salary' => 5800000,
        ]);

        $response->assertRedirect();

        $employee = Employee::where('employee_code', 'EMP-TEST-801')->firstOrFail();
        $this->assertEquals('6371019988770001', $employee->nik);
        $this->assertEquals('Banjarmasin', $employee->birth_place);
        $this->assertEquals('0310099887766', $employee->bank_account_number);
        $this->assertDatabaseHas('employee_status_histories', [
            'employee_id' => $employee->id,
            'event_type' => 'hired',
            'new_employment_status' => 'PKWT',
        ]);

        // Update Employee status to PKWTT
        $updateResp = $this->actingAs($this->admin)->put("/hr/employees/{$employee->id}", [
            'name' => 'Rahmat Hidayatullah, S.T.',
            'birth_place' => 'Banjarmasin',
            'birth_date' => '1993-04-12',
            'phone' => '081255667799',
            'department_id' => $this->deptA->id,
            'position_id' => $this->posA->id,
            'employment_status' => 'PKWTT',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '0310099887766',
            'is_active' => true,
        ]);

        $updateResp->assertRedirect();
        $this->assertEquals('PKWTT', $employee->fresh()->employment_status);
        $this->assertDatabaseHas('employee_status_histories', [
            'employee_id' => $employee->id,
            'event_type' => 'status_change',
            'old_employment_status' => 'PKWT',
            'new_employment_status' => 'PKWTT',
        ]);
    }

    public function test_contract_management_pkwt_pkwtt_extension_and_separation(): void
    {
        $employee = Employee::where('site_id', $this->siteA->id)->firstOrFail();
        $employee->contracts()->delete();

        // 1. Create PKWT Contract
        $startDate = now()->subMonths(6)->toDateString();
        $endDate = now()->addDays(20)->toDateString();

        $this->actingAs($this->admin)->post('/hr/contracts', [
            'employee_id' => $employee->id,
            'site_id' => $this->siteA->id,
            'contract_type' => 'PKWT',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'basic_salary' => 5600000,
            'notes' => 'Kontrak PKWT Tahap I',
        ])->assertRedirect();

        $contract1 = EmploymentContract::where('employee_id', $employee->id)->firstOrFail();
        $this->assertEquals('PKWT', $contract1->contract_type);
        $this->assertEquals(1, $contract1->sequence_number);
        $this->assertEquals('active', $contract1->status);

        // 2. Extend PKWT Contract
        $newEndDate = now()->addMonths(7)->toDateString();
        $this->actingAs($this->admin)->post("/hr/contracts/{$contract1->id}/extend", [
            'end_date' => $newEndDate,
            'basic_salary' => 6000000,
            'notes' => 'Perpanjangan Kontrak PKWT Tahap II',
        ])->assertRedirect();

        $this->assertEquals('extended', $contract1->fresh()->status);

        $contract2 = EmploymentContract::where('parent_contract_id', $contract1->id)->firstOrFail();
        $this->assertEquals(2, $contract2->sequence_number);
        $this->assertEquals('active', $contract2->status);
        $this->assertEquals($newEndDate, $contract2->end_date->toDateString());

        // 3. Record Resignation
        $this->actingAs($this->admin)->post("/hr/employees/{$employee->id}/separation", [
            'separation_type' => 'resignation',
            'separation_date' => now()->toDateString(),
            'reason' => 'Pindah domisili keluarga',
        ])->assertRedirect();

        $freshEmp = $employee->fresh();
        $this->assertFalse($freshEmp->is_active);
        $this->assertEquals('resigned', $freshEmp->employment_status);
        $this->assertEquals('resigned', $contract2->fresh()->status);
    }

    public function test_contract_expiry_reminder_detection(): void
    {
        $hrService = app(HrManagementService::class);
        $employee = Employee::where('site_id', $this->siteA->id)->firstOrFail();

        $contract = $hrService->createContract($employee, [
            'contract_type' => 'PKWT',
            'start_date' => now()->subMonths(5)->toDateString(),
            'end_date' => now()->addDays(10)->toDateString(),
            'basic_salary' => 5400000,
        ]);

        $expiring = $hrService->getExpiringContracts($this->siteA->id, 30);
        $found = $expiring->firstWhere('id', $contract->id);

        $this->assertNotNull($found);
        $this->assertEquals(10, $found->days_remaining);
        $this->assertEquals('critical', $found->reminder_status);
    }

    public function test_employee_transfer_updates_site_and_records_history(): void
    {
        $employee = Employee::where('site_id', $this->siteA->id)->firstOrFail();
        $deptB = Department::where('is_active', true)->skip(1)->first() ?? $this->deptA;

        $this->actingAs($this->admin)->post('/hr/transfers', [
            'employee_id' => $employee->id,
            'transfer_type' => 'site_mutation',
            'effective_date' => now()->toDateString(),
            'to_site_id' => $this->siteB->id,
            'to_department_id' => $deptB->id,
            'to_position_id' => $this->posA->id,
            'reason' => 'Rotasi SDM proyek hauling Site B',
        ])->assertRedirect();

        $this->assertEquals($this->siteB->id, $employee->fresh()->site_id);
        $this->assertDatabaseHas('employee_transfers', [
            'employee_id' => $employee->id,
            'from_site_id' => $this->siteA->id,
            'to_site_id' => $this->siteB->id,
            'status' => 'completed',
        ]);
        $this->assertDatabaseHas('employee_status_histories', [
            'employee_id' => $employee->id,
            'event_type' => 'site_transfer',
            'old_site_id' => $this->siteA->id,
            'new_site_id' => $this->siteB->id,
        ]);
    }

    public function test_shift_assignment_and_mobile_attendance_with_site_time_validation(): void
    {
        $employee = Employee::where('site_id', $this->siteA->id)->where('is_active', true)->firstOrFail();
        $shift = Shift::where('site_id', $this->siteA->id)->first() ?? Shift::firstOrFail();
        $shift->update([
            'site_id' => $this->siteA->id,
            'start_time' => '07:00:00',
            'end_time' => '19:00:00',
        ]);

        HrSiteSetting::updateOrCreate(
            ['site_id' => $this->siteA->id],
            [
                'check_in_grace_minutes' => 15,
                'earliest_check_in_minutes_before' => 90,
                'max_overtime_hours_per_day' => 4.00,
                'require_gps_on_mobile' => true,
            ]
        );

        $date = now()->addDays(2)->toDateString();

        // 1. Shift Assignment
        $this->actingAs($this->admin)->post('/hr/shift-assignments', [
            'site_id' => $this->siteA->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'roster_date' => $date,
            'work_status' => 'scheduled',
        ])->assertRedirect();

        $this->assertDatabaseHas('shift_assignments', [
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
        ]);

        // 2. Mobile HP Attendance Check-In (Late by 25 minutes > 15 min grace)
        $this->actingAs($this->admin)->post('/hr/attendance', [
            'site_id' => $this->siteA->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => $date,
            'check_in_at' => "{$date} 07:25:00",
            'check_out_at' => "{$date} 19:25:00",
            'overtime_hours' => 2.50,
            'input_source' => 'mobile_hp',
            'gps_latitude' => -3.45678,
            'gps_longitude' => 115.63111,
            'enforce_shift_window' => true,
        ])->assertRedirect();

        $att = Attendance::where('employee_id', $employee->id)->whereDate('attendance_date', $date)->firstOrFail();
        $this->assertEquals('late', $att->status);
        $this->assertEquals(25, $att->late_minutes);
        $this->assertEquals('mobile_hp', $att->input_source);
        $this->assertEquals(2.50, (float) $att->overtime_hours);

        // 3. Site Time Configuration Validation: Reject Overtime > 4.00 hours
        $this->actingAs($this->admin)->post('/hr/attendance', [
            'site_id' => $this->siteA->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => $date,
            'check_in_at' => "{$date} 06:55:00",
            'check_out_at' => "{$date} 19:00:00",
            'overtime_hours' => 6.00,
            'input_source' => 'mobile_hp',
        ])->assertSessionHasErrors(['overtime_hours']);

        // 4. Attendance Correction Request & Approval
        $this->actingAs($this->admin)->post("/hr/attendance/{$att->id}/corrections", [
            'requested_check_in_at' => "{$date} 06:55:00",
            'requested_check_out_at' => "{$date} 19:00:00",
            'requested_overtime_hours' => 3.00,
            'reason' => 'Kendala jaringan saat submit di pit tambang',
        ])->assertRedirect();

        $cor = $att->corrections()->firstOrFail();
        $this->actingAs($this->admin)->post("/hr/attendance-corrections/{$cor->id}/approve")->assertRedirect();

        $this->assertEquals('approved', $cor->fresh()->status);
        $this->assertEquals('present', $att->fresh()->status);
        $this->assertEquals(0, $att->fresh()->late_minutes);
        $this->assertEquals(3.00, (float) $att->fresh()->overtime_hours);
    }

    public function test_leave_request_approval_and_attendance_sync(): void
    {
        $employee = Employee::where('site_id', $this->siteA->id)->where('is_active', true)->firstOrFail();
        $start = now()->addDays(15)->toDateString();
        $end = now()->addDays(16)->toDateString();

        $this->actingAs($this->admin)->post('/hr/leaves', [
            'site_id' => $this->siteA->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual_leave',
            'start_date' => $start,
            'end_date' => $end,
            'reason' => 'Cuti tahunan terjadwal',
        ])->assertRedirect();

        $leave = LeaveRequest::where('employee_id', $employee->id)
            ->whereDate('start_date', $start)
            ->firstOrFail();

        $this->assertEquals(2, $leave->total_days);
        $this->assertEquals('pending_approval', $leave->status);

        // Approve Leave & verify Attendance auto-sync
        $this->actingAs($this->admin)->post("/hr/leaves/{$leave->id}/approve")->assertRedirect();

        $this->assertEquals('approved', $leave->fresh()->status);
        $this->assertDatabaseHas('attendances', [
            'employee_id' => $employee->id,
            'status' => 'on_leave',
        ]);
    }

    public function test_driver_management_eligibility_and_training_integration(): void
    {
        $driver = Driver::with('employee')->firstOrFail();
        $empSiteId = $driver->employee->site_id;
        $unit = Unit::where('site_id', $empSiteId)->first();

        // Update Driver Credentials with expiring SIMPER (in 10 days -> warning_expiring)
        $this->actingAs($this->admin)->put("/hr/drivers/{$driver->id}/credentials", [
            'sim_number' => 'SIM-B2-998877',
            'sim_type' => 'B II Umum',
            'sim_expiry' => now()->addMonths(8)->toDateString(),
            'simper_number' => 'SIMPER-TAP-9988',
            'simper_expiry' => now()->addDays(10)->toDateString(),
            'mcu_status' => 'fit',
            'mcu_date' => now()->subMonths(2)->toDateString(),
            'mcu_expiry' => now()->addMonths(10)->toDateString(),
            'assigned_unit_id' => $unit?->id,
        ])->assertRedirect();

        $this->assertEquals('warning_expiring', $driver->fresh()->administrative_eligibility_status);
        $this->assertEquals($unit?->id, $driver->fresh()->assigned_unit_id);

        // Record Driver Training
        $this->actingAs($this->admin)->post("/hr/drivers/{$driver->id}/trainings", [
            'site_id' => $empSiteId,
            'training_name' => 'Fatigue & Defensive Hauling Certification',
            'training_category' => 'defensive_driving',
            'provider' => 'TAP Safety Center',
            'training_date' => now()->toDateString(),
            'expiry_date' => now()->addYear()->toDateString(),
            'score' => 95,
            'status' => 'passed',
        ])->assertRedirect();

        $this->assertEquals('certified', $driver->fresh()->training_status);
        $this->assertDatabaseHas('driver_trainings', [
            'driver_id' => $driver->id,
            'training_name' => 'Fatigue & Defensive Hauling Certification',
        ]);
    }

    public function test_employee_document_sensitive_access_control(): void
    {
        $employees = Employee::where('site_id', $this->siteA->id)->take(2)->get();
        $ownerEmployee = $employees[0];
        $otherEmployee = $employees[1];

        // Store sensitive KTP document for ownerEmployee
        $this->actingAs($this->admin)->post('/hr/documents', [
            'site_id' => $this->siteA->id,
            'employee_id' => $ownerEmployee->id,
            'document_type' => 'ktp',
            'document_title' => 'KTP Rahasia Karyawan',
            'document_number' => '6371019900112233',
            'access_level' => 'confidential_personal',
            'is_sensitive' => true,
        ])->assertRedirect();

        $sensitiveDoc = EmployeeDocument::where('employee_id', $ownerEmployee->id)
            ->where('document_type', 'ktp')
            ->latest('id')
            ->firstOrFail();

        // 1. Authorized HR/Admin can access (200 OK)
        $this->actingAs($this->admin)
            ->get("/hr/documents/{$sensitiveDoc->id}/access")
            ->assertStatus(200)
            ->assertJsonFragment(['document_number' => '6371019900112233']);

        // 2. Create a non-HR operator user linked to otherEmployee
        $unauthorizedUser = User::create([
            'name' => 'Operator Non-HR',
            'username' => 'operator_non_hr_test',
            'email' => 'operator.nonhr@tap-coal.co.id',
            'password' => bcrypt('password'),
            'role' => 'operator',
            'site_id' => $this->siteA->id,
            'employee_id' => $otherEmployee->id,
            'status' => 'active',
        ]);

        // Unauthorized user MUST receive 403 Forbidden on sensitive document access
        $this->actingAs($unauthorizedUser)
            ->get("/hr/documents/{$sensitiveDoc->id}/access")
            ->assertStatus(403);

        // 3. Employee who owns the document can access their own sensitive document (200 OK)
        $ownerUser = User::create([
            'name' => $ownerEmployee->name,
            'username' => 'owner_emp_test',
            'email' => 'owner.emp@tap-coal.co.id',
            'password' => bcrypt('password'),
            'role' => 'driver',
            'site_id' => $this->siteA->id,
            'employee_id' => $ownerEmployee->id,
            'status' => 'active',
        ]);

        $this->actingAs($ownerUser)
            ->get("/hr/documents/{$sensitiveDoc->id}/access")
            ->assertStatus(200);
    }

    public function test_site_isolation_and_all_hr_pages_render(): void
    {
        $empSiteA = Employee::where('site_id', $this->siteA->id)->firstOrFail();

        // Attempting to record attendance for a Site A employee under Site B must fail site isolation validation
        $this->actingAs($this->admin)->post('/hr/attendance', [
            'site_id' => $this->siteB->id,
            'employee_id' => $empSiteA->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'present',
        ])->assertSessionHasErrors(['site_id']);

        // Attempting to create contract for a Site A employee under Site B must fail site isolation validation
        $this->actingAs($this->admin)->post('/hr/contracts', [
            'employee_id' => $empSiteA->id,
            'site_id' => $this->siteB->id,
            'contract_type' => 'PKWT',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
        ])->assertSessionHasErrors(['site_id']);

        // Verify all 5 Phase 8 pages render cleanly with HTTP 200
        $pages = [
            '/hr/dashboard',
            '/hr/employees',
            '/hr/drivers',
            '/hr/attendance',
            '/hr/documents',
        ];

        foreach ($pages as $url) {
            $this->actingAs($this->admin)->get($url)->assertStatus(200);
        }
    }
}
