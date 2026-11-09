<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\HrSiteSetting;
use App\Models\LeaveRequest;
use App\Models\Site;
use App\Services\HrManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrDashboardController extends Controller
{
    public function index(Request $request, HrManagementService $hrService)
    {
        $siteId = $request->input('site_id');
        $today = now()->toDateString();

        $employeesQuery = Employee::query()
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId));

        $totalEmployees = (clone $employeesQuery)->count();
        $activeEmployees = (clone $employeesQuery)->where('is_active', true)->count();
        $inactiveEmployees = $totalEmployees - $activeEmployees;

        // Employee by Site
        $employeeBySite = Site::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('id', $siteId))
            ->get()
            ->map(function (Site $s) {
                $total = Employee::where('site_id', $s->id)->count();
                $active = Employee::where('site_id', $s->id)->where('is_active', true)->count();
                $drivers = Driver::whereHas('employee', fn ($q) => $q->where('site_id', $s->id)->where('is_active', true))->count();

                return [
                    'site_id' => $s->id,
                    'site_code' => $s->code,
                    'site_name' => $s->name,
                    'total_employees' => $total,
                    'active_employees' => $active,
                    'active_drivers' => $drivers,
                ];
            });

        // Employee by Department
        $employeeByDepartment = Department::where('is_active', true)
            ->get()
            ->map(function (Department $dept) use ($siteId) {
                $count = Employee::where('department_id', $dept->id)
                    ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                    ->where('is_active', true)
                    ->count();

                return [
                    'department_id' => $dept->id,
                    'department_code' => $dept->code,
                    'department_name' => $dept->name,
                    'site_name' => $siteId ? (Site::find($siteId)?->name ?? 'Selected Site') : 'All Sites',
                    'active_count' => $count,
                ];
            })
            ->filter(fn ($d) => $d['active_count'] > 0)
            ->values();

        // Contract Expiring (within 30 days)
        $expiringContracts = $hrService->getExpiringContracts($siteId ? (int) $siteId : null, 30);

        // SIMPER Expiring & MCU Expiring (within 30 days)
        $cutoffDate = now()->addDays(30)->toDateString();

        $simperExpiring = Driver::with(['employee:id,employee_code,name,site_id', 'employee.site:id,code,name', 'assignedUnit:id,unit_code'])
            ->where('is_active', true)
            ->whereNotNull('simper_expiry')
            ->whereDate('simper_expiry', '<=', $cutoffDate)
            ->when($siteId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('site_id', $siteId)))
            ->orderBy('simper_expiry')
            ->get()
            ->map(function (Driver $d) {
                $days = (int) now()->startOfDay()->diffInDays($d->simper_expiry->startOfDay(), false);
                $d->setAttribute('days_remaining', $days);
                return $d;
            });

        $mcuExpiring = Driver::with(['employee:id,employee_code,name,site_id', 'employee.site:id,code,name', 'assignedUnit:id,unit_code'])
            ->where('is_active', true)
            ->whereNotNull('mcu_expiry')
            ->whereDate('mcu_expiry', '<=', $cutoffDate)
            ->when($siteId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('site_id', $siteId)))
            ->orderBy('mcu_expiry')
            ->get()
            ->map(function (Driver $d) {
                $days = (int) now()->startOfDay()->diffInDays($d->mcu_expiry->startOfDay(), false);
                $d->setAttribute('days_remaining', $days);
                return $d;
            });

        // Attendance Summary (Last 7 days / Current Month)
        $monthStart = now()->startOfMonth()->toDateString();
        $attendancesQuery = Attendance::query()
            ->whereDate('attendance_date', '>=', $monthStart)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId));

        $attendanceSummary = [
            'total_records' => (clone $attendancesQuery)->count(),
            'present_count' => (clone $attendancesQuery)->where('status', 'present')->count(),
            'late_count' => (clone $attendancesQuery)->where('status', 'late')->count(),
            'absent_count' => (clone $attendancesQuery)->where('status', 'absent')->count(),
            'on_leave_count' => (clone $attendancesQuery)->whereIn('status', ['on_leave', 'sick', 'permit'])->count(),
            'mobile_hp_count' => (clone $attendancesQuery)->where('input_source', 'mobile_hp')->count(),
            'today_present' => Attendance::whereDate('attendance_date', $today)
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->whereIn('status', ['present', 'late'])
                ->count(),
        ];

        // Overtime Summary
        $overtimeRecords = (clone $attendancesQuery)->where('overtime_hours', '>', 0)->get();
        $overtimeSummary = [
            'total_overtime_hours' => round((float) $overtimeRecords->sum('overtime_hours'), 2),
            'approved_overtime_hours' => round((float) $overtimeRecords->where('overtime_status', 'approved')->sum('overtime_hours'), 2),
            'pending_overtime_hours' => round((float) $overtimeRecords->where('overtime_status', 'pending')->sum('overtime_hours'), 2),
            'overtime_events_count' => $overtimeRecords->count(),
            'pending_leaves_count' => LeaveRequest::where('status', 'pending_approval')
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->count(),
        ];

        $siteSettings = Site::where('is_active', true)->get()->map(function (Site $s) use ($hrService) {
            return $hrService->getOrCreateSiteSetting($s->id)->load('site:id,code,name');
        });

        return Inertia::render('Hr/Dashboard/Index', [
            'metrics' => [
                'total_employees' => $totalEmployees,
                'active_employees' => $activeEmployees,
                'inactive_employees' => $inactiveEmployees,
                'expiring_contracts_count' => $expiringContracts->count(),
                'simper_expiring_count' => $simperExpiring->count(),
                'mcu_expiring_count' => $mcuExpiring->count(),
                'attendance_summary' => $attendanceSummary,
                'overtime_summary' => $overtimeSummary,
            ],
            'employeeBySite' => $employeeBySite,
            'employeeByDepartment' => $employeeByDepartment,
            'expiringContracts' => $expiringContracts,
            'simperExpiring' => $simperExpiring,
            'mcuExpiring' => $mcuExpiring,
            'siteSettings' => $siteSettings,
            'sites' => Site::where('is_active', true)->get(['id', 'code', 'name']),
            'filters' => [
                'site_id' => $siteId,
            ],
        ]);
    }

    public function updateSiteSetting(Request $request, HrSiteSetting $hrSiteSetting)
    {
        $validated = $request->validate([
            'check_in_grace_minutes' => 'required|integer|min:0|max:120',
            'earliest_check_in_minutes_before' => 'required|integer|min:15|max:240',
            'max_overtime_hours_per_day' => 'required|numeric|min:0|max:12',
            'contract_reminder_days' => 'required|integer|min:7|max:90',
            'document_reminder_days' => 'required|integer|min:7|max:90',
            'require_gps_on_mobile' => 'required|boolean',
        ]);

        $hrSiteSetting->update($validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Konfigurasi HR Site Diperbarui',
            'message' => 'Parameter validasi waktu presensi, lembur & reminder kontrak site berhasil disimpan.',
        ]);
    }
}
