<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\Department;
use App\Models\Driver;
use App\Models\DriverTraining;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EmployeeStatusHistory;
use App\Models\EmployeeTransfer;
use App\Models\EmploymentContract;
use App\Models\HrSiteSetting;
use App\Models\LeaveRequest;
use App\Models\Position;
use App\Models\Shift;
use App\Models\ShiftAssignment;
use App\Models\Site;
use App\Models\Unit;
use App\Models\User;
use App\Services\HrManagementService;
use Illuminate\Database\Seeder;

class TapHrEmployeeManagementSeeder extends Seeder
{
    public function run(): void
    {
        $hrService = app(HrManagementService::class);
        $adminUser = User::where('role', 'admin')->first() ?? User::first();
        $sites = Site::all();

        if ($sites->isEmpty()) {
            return;
        }

        // 1. Seed HrSiteSetting for all sites
        foreach ($sites as $site) {
            HrSiteSetting::updateOrCreate(
                ['site_id' => $site->id],
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

        $employees = Employee::with(['site', 'department', 'position', 'driver'])->get();
        if ($employees->isEmpty()) {
            return;
        }

        $banks = ['Bank Mandiri', 'BRI', 'BCA', 'BNI'];
        $birthPlaces = ['Banjarmasin', 'Samarinda', 'Balikpapan', 'Martapura', 'Tenggarong', 'Rantau'];

        foreach ($employees as $idx => $emp) {
            $bank = $banks[$idx % count($banks)];
            $bPlace = $birthPlaces[$idx % count($birthPlaces)];
            $bYear = 1984 + ($idx % 14);
            $bMonth = str_pad((string) (($idx % 12) + 1), 2, '0', STR_PAD_LEFT);
            $bDay = str_pad((string) (($idx % 25) + 1), 2, '0', STR_PAD_LEFT);

            $empType = ($idx % 3 === 0) ? 'PKWTT' : 'PKWT';

            $emp->update([
                'birth_place' => $emp->birth_place ?? $bPlace,
                'birth_date' => $emp->birth_date ?? "{$bYear}-{$bMonth}-{$bDay}",
                'gender' => 'L',
                'marital_status' => ($idx % 2 === 0) ? 'K/2' : 'K/1',
                'employment_status' => $empType,
                'bank_name' => $emp->bank_name ?? $bank,
                'bank_account_number' => $emp->bank_account_number ?? ('14900' . str_pad((string) ($emp->id * 7821), 8, '0', STR_PAD_LEFT)),
                'bank_account_holder' => $emp->bank_account_holder ?? $emp->name,
                'npwp_number' => $emp->npwp_number ?? ('89.312.' . str_pad((string) ($emp->id * 111), 3, '0', STR_PAD_LEFT) . '.4-731.000'),
                'bpjs_kesehatan_number' => $emp->bpjs_kesehatan_number ?? ('00018293' . str_pad((string) $emp->id, 5, '0', STR_PAD_LEFT)),
                'bpjs_ketenagakerjaan_number' => $emp->bpjs_ketenagakerjaan_number ?? ('2109831' . str_pad((string) $emp->id, 5, '0', STR_PAD_LEFT)),
            ]);

            // Initial Hired History
            EmployeeStatusHistory::firstOrCreate(
                [
                    'employee_id' => $emp->id,
                    'event_type' => 'hired',
                ],
                [
                    'site_id' => $emp->site_id,
                    'department_id' => $emp->department_id,
                    'position_id' => $emp->position_id,
                    'old_employment_status' => null,
                    'new_employment_status' => $empType,
                    'old_site_id' => null,
                    'new_site_id' => $emp->site_id,
                    'effective_date' => $emp->join_date ?? now()->subMonths(11)->toDateString(),
                    'reference_number' => "SK-TAP-HIRE-{$emp->employee_code}",
                    'remarks' => "Pengangkatan karyawan baru PT Teknindo Adhya Pane ({$emp->site?->code})",
                    'recorded_by' => $adminUser?->id,
                ]
            );

            // Employment Contract (make 2 PKWT contracts expire within 10 and 22 days for Contract Expiring Reminder)
            $endDate = null;
            if ($empType === 'PKWT') {
                if ($idx === 1) {
                    $endDate = now()->addDays(11)->toDateString();
                } elseif ($idx === 2) {
                    $endDate = now()->addDays(22)->toDateString();
                } else {
                    $endDate = now()->addMonths(6)->toDateString();
                }
            }

            $contractNum = "CTR-TAP-2026-" . str_pad((string) $emp->id, 4, '0', STR_PAD_LEFT);
            EmploymentContract::updateOrCreate(
                ['contract_number' => $contractNum],
                [
                    'employee_id' => $emp->id,
                    'site_id' => $emp->site_id,
                    'department_id' => $emp->department_id,
                    'position_id' => $emp->position_id,
                    'contract_type' => $empType,
                    'sequence_number' => 1,
                    'start_date' => $emp->join_date ?? now()->subMonths(11)->toDateString(),
                    'end_date' => $endDate,
                    'basic_salary' => 5250000 + (($idx % 5) * 450000),
                    'status' => 'active',
                    'notes' => $empType === 'PKWTT'
                        ? 'Perjanjian Kerja Waktu Tidak Tertentu (Karyawan Tetap TAP)'
                        : 'Perjanjian Kerja Waktu Tertentu Operasional Hauling Batubara',
                    'created_by' => $adminUser?->id,
                    'approved_by' => $adminUser?->id,
                ]
            );

            // Employee Documents (KTP - Confidential, Kontrak Kerja - Confidential, Sertifikat K3 - Public Operational)
            EmployeeDocument::updateOrCreate(
                ['document_code' => "DOC-KTP-{$emp->employee_code}"],
                [
                    'employee_id' => $emp->id,
                    'site_id' => $emp->site_id,
                    'document_type' => 'ktp',
                    'document_title' => "KTP Elektronik - {$emp->name}",
                    'document_number' => $emp->nik,
                    'issue_date' => '2020-01-15',
                    'expiry_date' => null,
                    'access_level' => 'confidential_personal',
                    'is_sensitive' => true,
                    'file_path' => "hr/documents/ktp-{$emp->employee_code}.pdf",
                    'verification_status' => 'verified',
                    'notes' => 'Dokumen identitas kependudukan terverifikasi HRD',
                    'uploaded_by' => $adminUser?->id,
                ]
            );

            EmployeeDocument::updateOrCreate(
                ['document_code' => "DOC-CTR-{$emp->employee_code}"],
                [
                    'employee_id' => $emp->id,
                    'site_id' => $emp->site_id,
                    'document_type' => 'employment_contract',
                    'document_title' => "Dokumen Kontrak {$empType} - {$emp->name}",
                    'document_number' => $contractNum,
                    'issue_date' => $emp->join_date ?? now()->subMonths(11)->toDateString(),
                    'expiry_date' => $endDate,
                    'access_level' => 'confidential_personal',
                    'is_sensitive' => true,
                    'file_path' => "hr/documents/contract-{$emp->employee_code}.pdf",
                    'verification_status' => 'verified',
                    'notes' => 'Dokumen kontrak kerja resmi & rincian kompensasi',
                    'uploaded_by' => $adminUser?->id,
                ]
            );
        }

        // Seed 1 historical Employee Transfer record if multiple sites exist
        if ($sites->count() >= 2 && $employees->count() >= 3) {
            $transferredEmp = $employees[2];
            $otherSite = $sites->firstWhere('id', '!=', $transferredEmp->site_id) ?? $sites->first();
            EmployeeTransfer::updateOrCreate(
                ['transfer_number' => 'TRF-HR-2026-0001'],
                [
                    'employee_id' => $transferredEmp->id,
                    'transfer_type' => 'site_mutation',
                    'effective_date' => now()->subMonths(3)->toDateString(),
                    'from_site_id' => $otherSite->id,
                    'to_site_id' => $transferredEmp->site_id,
                    'from_department_id' => $transferredEmp->department_id,
                    'to_department_id' => $transferredEmp->department_id,
                    'from_position_id' => $transferredEmp->position_id,
                    'to_position_id' => $transferredEmp->position_id,
                    'status' => 'completed',
                    'reason' => 'Penambahan kekuatan armada produksi hauling batubara',
                    'requested_by' => $adminUser?->id,
                    'approved_by' => $adminUser?->id,
                    'approved_at' => now()->subMonths(3),
                ]
            );
        }

        // 3. Driver Management Integration: SIM, SIMPER, MCU, Expiring Documents, Trainings & Unit Assignment
        $drivers = Driver::with('employee')->get();
        foreach ($drivers as $dIdx => $driver) {
            $emp = $driver->employee;
            if (!$emp) {
                continue;
            }

            $siteUnit = Unit::where('site_id', $emp->site_id)->skip($dIdx % 4)->first();

            // Set 1 driver with expiring SIMPER and 1 driver with expiring MCU so HR Dashboard & Driver alerts show live warnings
            $simperExpiry = ($dIdx === 1) ? now()->addDays(14)->toDateString() : ($driver->simper_expiry ?? now()->addMonths(8)->toDateString());
            $mcuExpiry = ($dIdx === 2) ? now()->addDays(18)->toDateString() : ($driver->mcu_expiry ?? now()->addMonths(7)->toDateString());

            $driver->update([
                'simper_expiry' => $simperExpiry,
                'mcu_expiry' => $mcuExpiry,
                'assigned_unit_id' => $driver->assigned_unit_id ?? $siteUnit?->id,
                'training_status' => 'certified',
                'last_training_date' => now()->subMonths(2)->toDateString(),
            ]);

            $hrService->evaluateDriverEligibility($driver->fresh());

            // Driver Training Certificate
            $trnCode = "TRN-DDT-2026-" . str_pad((string) $driver->id, 4, '0', STR_PAD_LEFT);
            DriverTraining::updateOrCreate(
                ['training_code' => $trnCode],
                [
                    'driver_id' => $driver->id,
                    'employee_id' => $emp->id,
                    'site_id' => $emp->site_id,
                    'training_name' => 'Defensive Driving Training (DDT) & Fatigue Management Coal Hauling',
                    'training_category' => 'defensive_driving',
                    'provider' => 'TAP HSE & Mining Safety Academy',
                    'training_date' => now()->subMonths(2)->toDateString(),
                    'expiry_date' => now()->addMonths(10)->toDateString(),
                    'score' => 92.50,
                    'certificate_number' => "CERT-DDT-{$driver->driver_code}",
                    'status' => 'passed',
                    'notes' => 'Lulus uji teori dan praktik pengoperasian Dump Truck Heavy Duty di jalur hauling',
                ]
            );

            // Driver SIMPER & MCU Documents in EmployeeDocument repository
            EmployeeDocument::updateOrCreate(
                ['document_code' => "DOC-SIMPER-{$driver->driver_code}"],
                [
                    'employee_id' => $emp->id,
                    'site_id' => $emp->site_id,
                    'document_type' => 'simper',
                    'document_title' => "SIMPER Hauling Road - {$emp->name}",
                    'document_number' => $driver->simper_number,
                    'issue_date' => now()->subMonths(4)->toDateString(),
                    'expiry_date' => $simperExpiry,
                    'access_level' => 'public_operational',
                    'is_sensitive' => false,
                    'file_path' => "hr/documents/simper-{$driver->driver_code}.pdf",
                    'verification_status' => 'verified',
                    'notes' => 'Dokumen operasional wajib untuk dispatch unit DT',
                    'uploaded_by' => $adminUser?->id,
                ]
            );

            EmployeeDocument::updateOrCreate(
                ['document_code' => "DOC-MCU-{$driver->driver_code}"],
                [
                    'employee_id' => $emp->id,
                    'site_id' => $emp->site_id,
                    'document_type' => 'mcu',
                    'document_title' => "Hasil Medical Check Up (MCU) Tahunan - {$emp->name}",
                    'document_number' => "MCU-TAP-{$driver->driver_code}",
                    'issue_date' => $driver->mcu_date ?? now()->subMonths(5)->toDateString(),
                    'expiry_date' => $mcuExpiry,
                    'access_level' => 'confidential_personal',
                    'is_sensitive' => true,
                    'file_path' => "hr/documents/mcu-{$driver->driver_code}.pdf",
                    'verification_status' => 'verified',
                    'notes' => 'Rekam medis berkala rahasia (Hanya HRD & Karyawan Ybs)',
                    'uploaded_by' => $adminUser?->id,
                ]
            );
        }

        // 4. Shift Assignments, Mobile HP Attendances, Overtime, Corrections & Leave Requests
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        foreach ($employees->take(8) as $aIdx => $emp) {
            $shift = Shift::where('site_id', $emp->site_id)->first() ?? Shift::first();
            if (!$shift) {
                continue;
            }

            // Roster Assignment for Today & Yesterday
            foreach ([$yesterday, $today] as $rDate) {
                $roster = ShiftAssignment::updateOrCreate(
                    [
                        'employee_id' => $emp->id,
                        'roster_date' => $rDate,
                    ],
                    [
                        'assignment_code' => "RST-" . str_replace('-', '', $rDate) . "-{$emp->id}",
                        'site_id' => $emp->site_id,
                        'shift_id' => $shift->id,
                        'work_status' => 'scheduled',
                        'assigned_unit_id' => $emp->driver?->assigned_unit_id,
                        'notes' => 'Jadwal roster operasional harian',
                        'assigned_by' => $adminUser?->id,
                    ]
                );

                $isLate = ($aIdx === 3 && $rDate === $today);
                $checkInTime = $isLate ? '07:28:00' : '06:52:00';
                $checkOutTime = '19:05:00';
                $overtimeHrs = ($aIdx % 2 === 0) ? 2.00 : 0.00;

                $att = Attendance::updateOrCreate(
                    [
                        'employee_id' => $emp->id,
                        'attendance_date' => $rDate,
                    ],
                    [
                        'attendance_number' => "ATT-" . str_replace('-', '', $rDate) . "-{$emp->id}",
                        'site_id' => $emp->site_id,
                        'shift_id' => $shift->id,
                        'shift_assignment_id' => $roster->id,
                        'status' => $isLate ? 'late' : 'present',
                        'check_in_at' => "{$rDate} {$checkInTime}",
                        'check_out_at' => "{$rDate} {$checkOutTime}",
                        'scheduled_start_time' => $shift->start_time ?? '07:00:00',
                        'scheduled_end_time' => $shift->end_time ?? '19:00:00',
                        'late_minutes' => $isLate ? 28 : 0,
                        'work_duration_hours' => 12.00,
                        'overtime_hours' => $overtimeHrs,
                        'overtime_reason' => $overtimeHrs > 0 ? 'Penyelesaian ritase akhir shift & antrian dumping jetty' : null,
                        'overtime_status' => $overtimeHrs > 0 ? 'approved' : 'none',
                        'input_source' => ($aIdx % 2 === 0) ? 'mobile_hp' : 'web_portal',
                        'device_info' => ($aIdx % 2 === 0) ? 'Android 14 - TAP Mobile Check-In PWA' : 'Desktop Dispatch Terminal',
                        'gps_latitude' => -3.4572100 + ($aIdx * 0.0012),
                        'gps_longitude' => 115.6321800 + ($aIdx * 0.0012),
                        'approval_status' => 'approved',
                        'approved_by' => $adminUser?->id,
                        'approved_at' => now(),
                        'remarks' => 'Presensi tervalidasi sesuai zona waktu & jam operasional site',
                    ]
                );

                if ($isLate) {
                    AttendanceCorrection::updateOrCreate(
                        ['correction_number' => "ACOR-2026-000{$emp->id}"],
                        [
                            'attendance_id' => $att->id,
                            'employee_id' => $emp->id,
                            'site_id' => $emp->site_id,
                            'requested_check_in_at' => "{$rDate} 06:55:00",
                            'requested_check_out_at' => "{$rDate} 19:05:00",
                            'requested_overtime_hours' => 1.50,
                            'reason' => 'Hadir tepat waktu untuk P2H unit pukul 06:55 namun sinyal HP di area ROM lemah saat submit.',
                            'status' => 'pending',
                            'requested_by' => $adminUser?->id,
                        ]
                    );
                }
            }
        }

        // Seed 2 Leave Requests (1 Approved, 1 Pending Approval)
        if ($employees->count() >= 2) {
            $emp1 = $employees[0];
            LeaveRequest::updateOrCreate(
                ['leave_number' => 'LVR-TAP-2026-0001'],
                [
                    'site_id' => $emp1->site_id,
                    'employee_id' => $emp1->id,
                    'leave_type' => 'roster_break',
                    'start_date' => now()->addDays(5)->toDateString(),
                    'end_date' => now()->addDays(8)->toDateString(),
                    'total_days' => 4,
                    'reason' => 'Cuti roster berkala (Field Break 6 Minggu Kerja)',
                    'status' => 'approved',
                    'requested_by' => $adminUser?->id,
                    'approved_by' => $adminUser?->id,
                    'approved_at' => now()->subDay(),
                ]
            );

            $emp2 = $employees[1];
            LeaveRequest::updateOrCreate(
                ['leave_number' => 'LVR-TAP-2026-0002'],
                [
                    'site_id' => $emp2->site_id,
                    'employee_id' => $emp2->id,
                    'leave_type' => 'annual_leave',
                    'start_date' => now()->addDays(10)->toDateString(),
                    'end_date' => now()->addDays(12)->toDateString(),
                    'total_days' => 3,
                    'reason' => 'Keperluan keluarga di Banjarmasin',
                    'status' => 'pending_approval',
                    'requested_by' => $adminUser?->id,
                ]
            );
        }
    }
}
