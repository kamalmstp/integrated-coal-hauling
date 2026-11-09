<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\Driver;
use App\Models\DriverTraining;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EmployeeStatusHistory;
use App\Models\EmployeeTransfer;
use App\Models\EmploymentContract;
use App\Models\HrSiteSetting;
use App\Models\LeaveRequest;
use App\Models\Shift;
use App\Models\ShiftAssignment;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class HrManagementService
{
    public function generateNumber(string $prefix): string
    {
        return "{$prefix}-" . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
    }

    public function getOrCreateSiteSetting(int $siteId): HrSiteSetting
    {
        return HrSiteSetting::firstOrCreate(
            ['site_id' => $siteId],
            [
                'check_in_grace_minutes' => 15,
                'earliest_check_in_minutes_before' => 90,
                'max_overtime_hours_per_day' => 4.00,
                'contract_reminder_days' => 30,
                'document_reminder_days' => 30,
                'require_gps_on_mobile' => true,
                'timezone' => 'Asia/Makassar',
            ]
        );
    }

    /**
     * Check if a User is authorized to access sensitive HR data (KTP, MCU, Contract Salary, Bank Account).
     */
    public function canUserAccessSensitiveEmployeeData(?User $user, Employee $employee): bool
    {
        if (!$user) {
            return false;
        }

        if ((int) $user->employee_id === (int) $employee->id) {
            return true;
        }

        if (in_array($user->role, ['admin', 'super_admin', 'hr_manager', 'manager'], true)) {
            return true;
        }

        if ($user->hasRole(['super_admin', 'admin', 'hr_manager', 'project_manager'])) {
            return true;
        }

        if ($user->hasPermission('hr.documents.sensitive')) {
            return true;
        }

        return false;
    }

    public function canAccessDocument(?User $user, EmployeeDocument $document): bool
    {
        if (!$user) {
            return false;
        }

        // Site isolation check for non-super-admin users who have a specific site_id
        if ($user->site_id && !in_array($user->role, ['admin', 'super_admin'], true) && !$user->hasRole(['super_admin'])) {
            if ((int) $user->site_id !== (int) $document->site_id && (int) $user->employee_id !== (int) $document->employee_id) {
                return false;
            }
        }

        if (!$document->is_sensitive && $document->access_level === 'public_operational') {
            return true;
        }

        $employee = $document->employee ?? Employee::find($document->employee_id);
        if (!$employee) {
            return false;
        }

        return $this->canUserAccessSensitiveEmployeeData($user, $employee);
    }

    /**
     * 1. Create Employee Master & Initial Status History (and optional initial contract).
     */
    public function createEmployee(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::create([
                'employee_code' => strtoupper($data['employee_code'] ?? $this->generateNumber('EMP')),
                'nik' => $data['nik'],
                'name' => $data['name'],
                'birth_place' => $data['birth_place'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'gender' => $data['gender'] ?? 'L',
                'marital_status' => $data['marital_status'] ?? 'TK/0',
                'company_id' => $data['company_id'],
                'site_id' => $data['site_id'],
                'department_id' => $data['department_id'],
                'position_id' => $data['position_id'],
                'join_date' => $data['join_date'] ?? now()->toDateString(),
                'employment_status' => $data['employment_status'] ?? 'PKWT',
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'address' => $data['address'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                'bank_name' => $data['bank_name'] ?? null,
                'bank_account_number' => $data['bank_account_number'] ?? null,
                'bank_account_holder' => $data['bank_account_holder'] ?? $data['name'],
                'npwp_number' => $data['npwp_number'] ?? null,
                'bpjs_kesehatan_number' => $data['bpjs_kesehatan_number'] ?? null,
                'bpjs_ketenagakerjaan_number' => $data['bpjs_ketenagakerjaan_number'] ?? null,
                'document_notes' => $data['document_notes'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'created_by' => auth()->id(),
            ]);

            EmployeeStatusHistory::create([
                'employee_id' => $employee->id,
                'site_id' => $employee->site_id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'event_type' => 'hired',
                'old_employment_status' => null,
                'new_employment_status' => $employee->employment_status,
                'old_site_id' => null,
                'new_site_id' => $employee->site_id,
                'effective_date' => $employee->join_date->toDateString(),
                'reference_number' => $employee->employee_code,
                'remarks' => "Karyawan baru terdaftar pada Site ID {$employee->site_id}",
                'recorded_by' => auth()->id(),
            ]);

            if (!empty($data['create_initial_contract'])) {
                $this->createContract($employee, [
                    'contract_type' => strtoupper($employee->employment_status) === 'PKWTT' ? 'PKWTT' : 'PKWT',
                    'start_date' => $employee->join_date->toDateString(),
                    'end_date' => $data['contract_end_date'] ?? (strtoupper($employee->employment_status) === 'PKWTT' ? null : now()->addYear()->toDateString()),
                    'basic_salary' => $data['basic_salary'] ?? 0,
                ]);
            }

            return $employee->load(['site', 'department', 'position', 'statusHistories', 'contracts']);
        });
    }

    public function updateEmployee(Employee $employee, array $data): Employee
    {
        return DB::transaction(function () use ($employee, $data) {
            $oldStatus = $employee->employment_status;
            $oldActive = $employee->is_active;

            $employee->update(array_merge($data, [
                'updated_by' => auth()->id(),
            ]));

            if (isset($data['employment_status']) && $data['employment_status'] !== $oldStatus) {
                EmployeeStatusHistory::create([
                    'employee_id' => $employee->id,
                    'site_id' => $employee->site_id,
                    'department_id' => $employee->department_id,
                    'position_id' => $employee->position_id,
                    'event_type' => 'status_change',
                    'old_employment_status' => $oldStatus,
                    'new_employment_status' => $employee->employment_status,
                    'old_site_id' => $employee->site_id,
                    'new_site_id' => $employee->site_id,
                    'effective_date' => now()->toDateString(),
                    'remarks' => "Perubahan status kerja dari {$oldStatus} ke {$employee->employment_status}",
                    'recorded_by' => auth()->id(),
                ]);
            }

            return $employee->fresh(['site', 'department', 'position']);
        });
    }

    /**
     * 2. Employment Management: Create Contract (PKWT / PKWTT), Extend Contract, Resignation / Termination, Transfer.
     */
    public function createContract(Employee $employee, array $data): EmploymentContract
    {
        return DB::transaction(function () use ($employee, $data) {
            $siteId = (int) ($data['site_id'] ?? $employee->site_id);
            if ($siteId !== (int) $employee->site_id) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Site kontrak kerja harus sesuai dengan site aktif karyawan.',
                ]);
            }

            $type = strtoupper($data['contract_type'] ?? 'PKWT');
            if ($type === 'PKWT' && empty($data['end_date'])) {
                throw ValidationException::withMessages([
                    'end_date' => 'Kontrak kerja PKWT wajib memiliki tanggal berakhir (Contract End Date).',
                ]);
            }

            $seq = EmploymentContract::where('employee_id', $employee->id)->count() + 1;

            $contract = EmploymentContract::create([
                'contract_number' => $data['contract_number'] ?? $this->generateNumber($type),
                'employee_id' => $employee->id,
                'site_id' => $siteId,
                'department_id' => $data['department_id'] ?? $employee->department_id,
                'position_id' => $data['position_id'] ?? $employee->position_id,
                'contract_type' => $type,
                'sequence_number' => $seq,
                'parent_contract_id' => $data['parent_contract_id'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $type === 'PKWTT' ? null : ($data['end_date'] ?? null),
                'basic_salary' => $data['basic_salary'] ?? 0,
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
                'approved_by' => auth()->id(),
            ]);

            $oldStatus = $employee->employment_status;
            $employee->update([
                'employment_status' => $type,
                'is_active' => true,
            ]);

            EmployeeStatusHistory::create([
                'employee_id' => $employee->id,
                'site_id' => $siteId,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'event_type' => $type === 'PKWTT' ? 'promoted_pkwtt' : 'contract_created',
                'old_employment_status' => $oldStatus,
                'new_employment_status' => $type,
                'old_site_id' => $siteId,
                'new_site_id' => $siteId,
                'effective_date' => $contract->start_date->toDateString(),
                'reference_number' => $contract->contract_number,
                'remarks' => "Pembuatan kontrak {$type} ({$contract->contract_number})",
                'recorded_by' => auth()->id(),
            ]);

            return $contract->load(['employee', 'site', 'department', 'position']);
        });
    }

    public function extendContract(EmploymentContract $contract, array $data): EmploymentContract
    {
        return DB::transaction(function () use ($contract, $data) {
            $employee = $contract->employee;

            $contract->update([
                'status' => 'extended',
            ]);

            $newStart = $data['start_date'] ?? ($contract->end_date ? $contract->end_date->copy()->addDay()->toDateString() : now()->toDateString());
            $newEnd = $data['end_date'];

            $extended = EmploymentContract::create([
                'contract_number' => $data['contract_number'] ?? $this->generateNumber('PKWT-EXT'),
                'employee_id' => $employee->id,
                'site_id' => $employee->site_id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'contract_type' => $data['contract_type'] ?? 'PKWT',
                'sequence_number' => $contract->sequence_number + 1,
                'parent_contract_id' => $contract->id,
                'start_date' => $newStart,
                'end_date' => $newEnd,
                'basic_salary' => $data['basic_salary'] ?? $contract->basic_salary,
                'status' => 'active',
                'notes' => $data['notes'] ?? "Perpanjangan dari kontrak {$contract->contract_number}",
                'created_by' => auth()->id(),
                'approved_by' => auth()->id(),
            ]);

            EmployeeStatusHistory::create([
                'employee_id' => $employee->id,
                'site_id' => $employee->site_id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'event_type' => 'contract_extended',
                'old_employment_status' => $employee->employment_status,
                'new_employment_status' => $extended->contract_type,
                'old_site_id' => $employee->site_id,
                'new_site_id' => $employee->site_id,
                'effective_date' => $newStart,
                'reference_number' => $extended->contract_number,
                'remarks' => "Perpanjangan kontrak kerja ke-{$extended->sequence_number} sampai {$newEnd}",
                'recorded_by' => auth()->id(),
            ]);

            return $extended->load(['employee', 'parentContract']);
        });
    }

    public function recordSeparation(Employee $employee, array $data): Employee
    {
        return DB::transaction(function () use ($employee, $data) {
            $type = $data['separation_type']; // 'resignation' | 'termination'
            $date = $data['separation_date'] ?? now()->toDateString();
            $reason = $data['reason'] ?? 'Pengakhiran hubungan kerja';

            $oldStatus = $employee->employment_status;
            $newStatus = $type === 'resignation' ? 'resigned' : 'terminated';

            $employee->contracts()->where('status', 'active')->update([
                'status' => $newStatus,
                'separation_type' => $type,
                'separation_date' => $date,
                'separation_reason' => $reason,
            ]);

            $employee->update([
                'employment_status' => $newStatus,
                'is_active' => false,
                'resignation_date' => $type === 'resignation' ? $date : $employee->resignation_date,
                'termination_date' => $type === 'termination' ? $date : $employee->termination_date,
                'separation_reason' => $reason,
            ]);

            if ($employee->driver) {
                $employee->driver->update([
                    'is_active' => false,
                    'administrative_eligibility_status' => 'suspended',
                ]);
            }

            EmployeeStatusHistory::create([
                'employee_id' => $employee->id,
                'site_id' => $employee->site_id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'event_type' => $type,
                'old_employment_status' => $oldStatus,
                'new_employment_status' => $newStatus,
                'old_site_id' => $employee->site_id,
                'new_site_id' => $employee->site_id,
                'effective_date' => $date,
                'remarks' => strtoupper($type) . ": {$reason}",
                'recorded_by' => auth()->id(),
            ]);

            return $employee->fresh(['contracts', 'statusHistories']);
        });
    }

    public function transferEmployee(Employee $employee, array $data): EmployeeTransfer
    {
        return DB::transaction(function () use ($employee, $data) {
            $fromSiteId = (int) $employee->site_id;
            $toSiteId = (int) ($data['to_site_id'] ?? $employee->site_id);
            $fromDeptId = $employee->department_id;
            $toDeptId = $data['to_department_id'] ?? $employee->department_id;
            $fromPosId = $employee->position_id;
            $toPosId = $data['to_position_id'] ?? $employee->position_id;
            $effectiveDate = $data['effective_date'] ?? now()->toDateString();

            $transfer = EmployeeTransfer::create([
                'transfer_number' => $data['transfer_number'] ?? $this->generateNumber('TRF-HR'),
                'employee_id' => $employee->id,
                'transfer_type' => $data['transfer_type'] ?? ($fromSiteId !== $toSiteId ? 'site_mutation' : 'department_transfer'),
                'effective_date' => $effectiveDate,
                'from_site_id' => $fromSiteId,
                'to_site_id' => $toSiteId,
                'from_department_id' => $fromDeptId,
                'to_department_id' => $toDeptId,
                'from_position_id' => $fromPosId,
                'to_position_id' => $toPosId,
                'status' => 'completed',
                'reason' => $data['reason'] ?? 'Mutasi operasional antar-site TAP',
                'requested_by' => auth()->id(),
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            $employee->update([
                'site_id' => $toSiteId,
                'department_id' => $toDeptId,
                'position_id' => $toPosId,
            ]);

            // Sync linked user site_id if user account exists
            if ($employee->user) {
                $employee->user->update(['site_id' => $toSiteId]);
            }

            // Clear driver unit assignment if mutated to another site
            if ($fromSiteId !== $toSiteId && $employee->driver) {
                $employee->driver->update(['assigned_unit_id' => null]);
            }

            EmployeeStatusHistory::create([
                'employee_id' => $employee->id,
                'site_id' => $toSiteId,
                'department_id' => $toDeptId,
                'position_id' => $toPosId,
                'event_type' => 'site_transfer',
                'old_employment_status' => $employee->employment_status,
                'new_employment_status' => $employee->employment_status,
                'old_site_id' => $fromSiteId,
                'new_site_id' => $toSiteId,
                'effective_date' => $effectiveDate,
                'reference_number' => $transfer->transfer_number,
                'remarks' => $transfer->reason,
                'recorded_by' => auth()->id(),
            ]);

            return $transfer->load(['employee', 'fromSite', 'toSite', 'fromDepartment', 'toDepartment', 'fromPosition', 'toPosition']);
        });
    }

    /**
     * Get Contracts Expiring within reminder window (default 30 days) or already expired.
     */
    public function getExpiringContracts(?int $siteId = null, int $daysWindow = 30): Collection
    {
        $cutoffDate = now()->addDays($daysWindow)->toDateString();

        return EmploymentContract::with(['employee:id,employee_code,name,site_id', 'site:id,name,code', 'department:id,name', 'position:id,title,code'])
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<=', $cutoffDate)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderBy('end_date')
            ->get()
            ->map(function (EmploymentContract $c) {
                $daysRemaining = (int) now()->startOfDay()->diffInDays($c->end_date->startOfDay(), false);
                $c->setAttribute('days_remaining', $daysRemaining);
                $c->setAttribute('reminder_status', $daysRemaining < 0 ? 'expired' : ($daysRemaining <= 14 ? 'critical' : 'warning'));
                return $c;
            });
    }

    /**
     * 3. Driver Management Integration (Evaluate SIM, SIMPER, MCU Eligibility, Training & Unit Assignment).
     */
    public function evaluateDriverEligibility(Driver $driver, int $reminderDays = 30): string
    {
        $today = now()->startOfDay();
        $warnDate = now()->addDays($reminderDays)->startOfDay();

        if ($driver->mcu_status === 'unfit' || !$driver->is_active) {
            $status = 'ineligible_mcu';
        } elseif (
            ($driver->sim_expiry && $driver->sim_expiry->lt($today)) ||
            ($driver->simper_expiry && $driver->simper_expiry->lt($today)) ||
            ($driver->mcu_expiry && $driver->mcu_expiry->lt($today))
        ) {
            $status = 'ineligible_expired';
        } elseif (
            ($driver->sim_expiry && $driver->sim_expiry->lte($warnDate)) ||
            ($driver->simper_expiry && $driver->simper_expiry->lte($warnDate)) ||
            ($driver->mcu_expiry && $driver->mcu_expiry->lte($warnDate))
        ) {
            $status = 'warning_expiring';
        } else {
            $status = 'eligible';
        }

        if ($driver->administrative_eligibility_status !== $status) {
            $driver->update(['administrative_eligibility_status' => $status]);
        }

        return $status;
    }

    public function updateDriverCredentials(Driver $driver, array $data): Driver
    {
        return DB::transaction(function () use ($driver, $data) {
            if (!empty($data['assigned_unit_id'])) {
                $unit = Unit::findOrFail($data['assigned_unit_id']);
                $empSiteId = (int) $driver->employee?->site_id;
                if ($empSiteId && (int) $unit->site_id !== $empSiteId) {
                    throw ValidationException::withMessages([
                        'assigned_unit_id' => 'Site isolation violation: Unit tidak berada pada site yang sama dengan Driver.',
                    ]);
                }
            }

            $driver->update([
                'sim_number' => $data['sim_number'] ?? $driver->sim_number,
                'sim_type' => $data['sim_type'] ?? $driver->sim_type,
                'sim_expiry' => $data['sim_expiry'] ?? $driver->sim_expiry,
                'simper_number' => $data['simper_number'] ?? $driver->simper_number,
                'simper_expiry' => $data['simper_expiry'] ?? $driver->simper_expiry,
                'mcu_status' => $data['mcu_status'] ?? $driver->mcu_status,
                'mcu_date' => $data['mcu_date'] ?? $driver->mcu_date,
                'mcu_expiry' => $data['mcu_expiry'] ?? $driver->mcu_expiry,
                'assigned_unit_id' => array_key_exists('assigned_unit_id', $data) ? $data['assigned_unit_id'] : $driver->assigned_unit_id,
                'notes' => $data['notes'] ?? $driver->notes,
                'updated_by' => auth()->id(),
            ]);

            $this->evaluateDriverEligibility($driver->fresh());

            return $driver->fresh(['employee.site', 'assignedUnit', 'trainings']);
        });
    }

    public function recordDriverTraining(Driver $driver, array $data): DriverTraining
    {
        return DB::transaction(function () use ($driver, $data) {
            $emp = $driver->employee;
            $siteId = (int) ($data['site_id'] ?? $emp->site_id);

            if ((int) $emp->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Site training harus sesuai dengan site driver.',
                ]);
            }

            $training = DriverTraining::create([
                'training_code' => $data['training_code'] ?? $this->generateNumber('TRN-DRV'),
                'driver_id' => $driver->id,
                'employee_id' => $emp->id,
                'site_id' => $siteId,
                'training_name' => $data['training_name'],
                'training_category' => $data['training_category'] ?? 'safety_k3lh',
                'provider' => $data['provider'] ?? 'TAP HSE & Training Academy',
                'training_date' => $data['training_date'] ?? now()->toDateString(),
                'expiry_date' => $data['expiry_date'] ?? now()->addYear()->toDateString(),
                'score' => $data['score'] ?? 90.00,
                'certificate_number' => $data['certificate_number'] ?? $this->generateNumber('CERT-K3'),
                'status' => $data['status'] ?? 'passed',
                'notes' => $data['notes'] ?? null,
            ]);

            $driver->update([
                'training_status' => 'certified',
                'last_training_date' => $training->training_date,
            ]);

            return $training->load(['driver.employee', 'site']);
        });
    }

    /**
     * 4. Attendance & Shift Assignment (with Mobile HP support & Site Time Configuration validation).
     */
    public function assignShift(array $data): ShiftAssignment
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::findOrFail($data['employee_id']);
            $shift = Shift::findOrFail($data['shift_id']);
            $siteId = (int) ($data['site_id'] ?? $employee->site_id);

            if ((int) $employee->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'employee_id' => "Site isolation violation: Karyawan {$employee->name} tidak terdaftar pada site jadwal shift ini.",
                ]);
            }

            if ($shift->site_id && (int) $shift->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'shift_id' => 'Site isolation violation: Shift kerja tidak berada pada site yang sesuai.',
                ]);
            }

            return ShiftAssignment::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'roster_date' => $data['roster_date'],
                ],
                [
                    'assignment_code' => $data['assignment_code'] ?? $this->generateNumber('RST'),
                    'site_id' => $siteId,
                    'shift_id' => $shift->id,
                    'work_status' => $data['work_status'] ?? 'scheduled',
                    'assigned_unit_id' => $data['assigned_unit_id'] ?? null,
                    'notes' => $data['notes'] ?? null,
                    'assigned_by' => auth()->id(),
                ]
            );
        });
    }

    public function recordAttendance(array $data): Attendance
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::findOrFail($data['employee_id']);
            $siteId = (int) ($data['site_id'] ?? $employee->site_id);

            if ((int) $employee->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'site_id' => "Site isolation violation: Presensi karyawan {$employee->name} hanya dapat dicatat pada site aktifnya.",
                ]);
            }

            $setting = $this->getOrCreateSiteSetting($siteId);
            $date = $data['attendance_date'] ?? now()->toDateString();

            $roster = ShiftAssignment::where('employee_id', $employee->id)
                ->whereDate('roster_date', $date)
                ->first();

            $shiftId = $data['shift_id'] ?? $roster?->shift_id ?? Shift::where('site_id', $siteId)->first()?->id ?? Shift::first()?->id;
            $shift = $shiftId ? Shift::find($shiftId) : null;

            $scheduledStart = $shift?->start_time ?? '07:00:00';
            $scheduledEnd = $shift?->end_time ?? '19:00:00';

            $checkInAt = !empty($data['check_in_at']) ? Carbon::parse($data['check_in_at']) : null;
            $checkOutAt = !empty($data['check_out_at']) ? Carbon::parse($data['check_out_at']) : null;

            $lateMinutes = 0;
            $status = $data['status'] ?? 'present';

            if ($checkInAt && in_array($status, ['present', 'late'], true)) {
                $shiftStartDt = Carbon::parse($date . ' ' . $scheduledStart);
                $earliestAllowed = $shiftStartDt->copy()->subMinutes((int) $setting->earliest_check_in_minutes_before);

                if (!empty($data['enforce_shift_window']) && $checkInAt->lt($earliestAllowed)) {
                    throw ValidationException::withMessages([
                        'check_in_at' => "Waktu Check-In terlalu awal. Batas paling awal untuk shift {$shift?->name} adalah {$earliestAllowed->format('H:i')} sesuai konfigurasi site.",
                    ]);
                }

                $graceLimit = $shiftStartDt->copy()->addMinutes((int) $setting->check_in_grace_minutes);
                if ($checkInAt->gt($graceLimit)) {
                    $lateMinutes = (int) $shiftStartDt->diffInMinutes($checkInAt);
                    $status = 'late';
                } else {
                    $status = 'present';
                }
            }

            $workDurationHours = 0;
            if ($checkInAt && $checkOutAt && $checkOutAt->gt($checkInAt)) {
                $workDurationHours = round($checkInAt->diffInMinutes($checkOutAt) / 60, 2);
            }

            $overtimeHours = round((float) ($data['overtime_hours'] ?? 0), 2);
            if ($overtimeHours > (float) $setting->max_overtime_hours_per_day) {
                throw ValidationException::withMessages([
                    'overtime_hours' => "Jam lembur ({$overtimeHours} jam) melebihi batas maksimum lembur harian site ({$setting->max_overtime_hours_per_day} jam).",
                ]);
            }

            return Attendance::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'attendance_date' => $date,
                ],
                [
                    'attendance_number' => $data['attendance_number'] ?? $this->generateNumber('ATT'),
                    'site_id' => $siteId,
                    'shift_id' => $shift?->id,
                    'shift_assignment_id' => $roster?->id,
                    'status' => $status,
                    'check_in_at' => $checkInAt,
                    'check_out_at' => $checkOutAt,
                    'scheduled_start_time' => $scheduledStart,
                    'scheduled_end_time' => $scheduledEnd,
                    'late_minutes' => $lateMinutes,
                    'work_duration_hours' => $workDurationHours,
                    'overtime_hours' => $overtimeHours,
                    'overtime_reason' => $data['overtime_reason'] ?? null,
                    'overtime_status' => $overtimeHours > 0 ? ($data['overtime_status'] ?? 'approved') : 'none',
                    'input_source' => $data['input_source'] ?? 'mobile_hp',
                    'device_info' => $data['device_info'] ?? 'TAP Mobile PWA',
                    'gps_latitude' => $data['gps_latitude'] ?? null,
                    'gps_longitude' => $data['gps_longitude'] ?? null,
                    'approval_status' => $data['approval_status'] ?? 'approved',
                    'approved_by' => auth()->id(),
                    'approved_at' => now(),
                    'remarks' => $data['remarks'] ?? null,
                ]
            );
        });
    }

    public function requestAttendanceCorrection(Attendance $attendance, array $data): AttendanceCorrection
    {
        return DB::transaction(function () use ($attendance, $data) {
            return AttendanceCorrection::create([
                'correction_number' => $this->generateNumber('ACOR'),
                'attendance_id' => $attendance->id,
                'employee_id' => $attendance->employee_id,
                'site_id' => $attendance->site_id,
                'requested_check_in_at' => $data['requested_check_in_at'] ?? $attendance->check_in_at,
                'requested_check_out_at' => $data['requested_check_out_at'] ?? $attendance->check_out_at,
                'requested_overtime_hours' => $data['requested_overtime_hours'] ?? $attendance->overtime_hours,
                'reason' => $data['reason'],
                'status' => 'pending',
                'requested_by' => auth()->id(),
            ]);
        });
    }

    public function approveAttendanceCorrection(AttendanceCorrection $correction): AttendanceCorrection
    {
        return DB::transaction(function () use ($correction) {
            $attendance = $correction->attendance;
            $checkIn = $correction->requested_check_in_at ? Carbon::parse($correction->requested_check_in_at) : $attendance->check_in_at;
            $checkOut = $correction->requested_check_out_at ? Carbon::parse($correction->requested_check_out_at) : $attendance->check_out_at;

            $duration = ($checkIn && $checkOut && $checkOut->gt($checkIn))
                ? round($checkIn->diffInMinutes($checkOut) / 60, 2)
                : $attendance->work_duration_hours;

            $attendance->update([
                'check_in_at' => $checkIn,
                'check_out_at' => $checkOut,
                'work_duration_hours' => $duration,
                'overtime_hours' => $correction->requested_overtime_hours,
                'overtime_status' => $correction->requested_overtime_hours > 0 ? 'approved' : 'none',
                'status' => 'present',
                'late_minutes' => 0,
                'approval_status' => 'corrected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            $correction->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            return $correction->fresh(['attendance', 'employee']);
        });
    }

    /**
     * 5. Leave Request & Approval Workflow.
     */
    public function createLeaveRequest(array $data): LeaveRequest
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::findOrFail($data['employee_id']);
            $siteId = (int) ($data['site_id'] ?? $employee->site_id);

            if ((int) $employee->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Pengajuan cuti harus sesuai dengan site karyawan.',
                ]);
            }

            $start = Carbon::parse($data['start_date']);
            $end = Carbon::parse($data['end_date']);
            $totalDays = max(1, (int) $start->diffInDays($end) + 1);

            return LeaveRequest::create([
                'leave_number' => $data['leave_number'] ?? $this->generateNumber('LVR'),
                'site_id' => $siteId,
                'employee_id' => $employee->id,
                'leave_type' => $data['leave_type'] ?? 'annual_leave',
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'total_days' => $totalDays,
                'reason' => $data['reason'],
                'attachment_path' => $data['attachment_path'] ?? null,
                'status' => 'pending_approval',
                'substitute_employee_id' => $data['substitute_employee_id'] ?? null,
                'requested_by' => auth()->id(),
            ]);
        });
    }

    public function approveLeaveRequest(LeaveRequest $leave): LeaveRequest
    {
        return DB::transaction(function () use ($leave) {
            $leave->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Sync Attendance records across leave date range
            $cursor = $leave->start_date->copy();
            $end = $leave->end_date->copy();
            $attStatus = $leave->leave_type === 'sick_leave' ? 'sick' : 'on_leave';

            while ($cursor->lte($end)) {
                $dStr = $cursor->toDateString();
                Attendance::updateOrCreate(
                    [
                        'employee_id' => $leave->employee_id,
                        'attendance_date' => $dStr,
                    ],
                    [
                        'attendance_number' => $this->generateNumber('ATT-LV'),
                        'site_id' => $leave->site_id,
                        'status' => $attStatus,
                        'input_source' => 'web_portal',
                        'approval_status' => 'approved',
                        'approved_by' => auth()->id(),
                        'approved_at' => now(),
                        'remarks' => "Approved Leave {$leave->leave_number} ({$leave->leave_type})",
                    ]
                );
                $cursor->addDay();
            }

            return $leave->fresh(['employee', 'site', 'approver']);
        });
    }

    /**
     * 6. Employee Document Management & Access Control Enforcement.
     */
    public function storeEmployeeDocument(array $data): EmployeeDocument
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::findOrFail($data['employee_id']);
            $siteId = (int) ($data['site_id'] ?? $employee->site_id);

            if ((int) $employee->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Dokumen karyawan harus disimpan pada site karyawan terkait.',
                ]);
            }

            $docType = $data['document_type'];
            $defaultAccess = in_array($docType, ['ktp', 'mcu', 'employment_contract', 'npwp_bpjs'], true)
                ? 'confidential_personal'
                : ($data['access_level'] ?? 'restricted_hr');

            $isSensitive = isset($data['is_sensitive'])
                ? (bool) $data['is_sensitive']
                : ($defaultAccess !== 'public_operational');

            return EmployeeDocument::create([
                'document_code' => $data['document_code'] ?? $this->generateNumber('DOC-HR'),
                'employee_id' => $employee->id,
                'site_id' => $siteId,
                'document_type' => $docType,
                'document_title' => $data['document_title'],
                'document_number' => $data['document_number'] ?? null,
                'issue_date' => $data['issue_date'] ?? now()->toDateString(),
                'expiry_date' => $data['expiry_date'] ?? null,
                'access_level' => $data['access_level'] ?? $defaultAccess,
                'is_sensitive' => $isSensitive,
                'file_path' => $data['file_path'] ?? "hr/documents/{$employee->employee_code}-{$docType}.pdf",
                'verification_status' => $data['verification_status'] ?? 'verified',
                'notes' => $data['notes'] ?? null,
                'uploaded_by' => auth()->id(),
            ]);
        });
    }

    public function getDocumentWithAccessCheck(User $user, EmployeeDocument $document): EmployeeDocument
    {
        if (!$this->canAccessDocument($user, $document)) {
            throw new AuthorizationException('Akses ditolak: Anda tidak memiliki otorisasi untuk membuka dokumen pribadi/sensitif karyawan ini.');
        }

        return $document->load(['employee', 'site']);
    }
}
