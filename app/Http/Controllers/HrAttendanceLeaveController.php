<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Shift;
use App\Models\ShiftAssignment;
use App\Models\Site;
use App\Models\Unit;
use App\Services\HrManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrAttendanceLeaveController extends Controller
{
    public function index(Request $request, HrManagementService $hrService)
    {
        $siteId = $request->input('site_id');
        $dateFilter = $request->input('attendance_date');
        $statusFilter = $request->input('status');

        $attendances = Attendance::with([
            'employee:id,employee_code,name,site_id,department_id',
            'employee.department:id,code,name',
            'site:id,code,name',
            'shift:id,code,name,start_time,end_time',
            'approver:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($dateFilter, fn ($q) => $q->whereDate('attendance_date', $dateFilter))
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->latest('attendance_date')
            ->latest('id')
            ->limit(80)
            ->get();

        $shiftAssignments = ShiftAssignment::with([
            'employee:id,employee_code,name,site_id',
            'site:id,code,name',
            'shift:id,code,name,start_time,end_time',
            'assignedUnit:id,unit_code',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($dateFilter, fn ($q) => $q->whereDate('roster_date', $dateFilter))
            ->latest('roster_date')
            ->limit(60)
            ->get();

        $corrections = AttendanceCorrection::with([
            'attendance:id,attendance_number,attendance_date,check_in_at,check_out_at,status',
            'employee:id,employee_code,name',
            'site:id,code,name',
            'approver:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->latest('id')
            ->limit(40)
            ->get();

        $leaveRequests = LeaveRequest::with([
            'employee:id,employee_code,name,site_id',
            'site:id,code,name',
            'substituteEmployee:id,employee_code,name',
            'approver:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->latest('id')
            ->limit(50)
            ->get();

        $siteSettings = Site::where('is_active', true)->get()->map(function (Site $s) use ($hrService) {
            return $hrService->getOrCreateSiteSetting($s->id)->load('site:id,code,name');
        });

        return Inertia::render('Hr/Attendance/Index', [
            'attendances' => $attendances,
            'shiftAssignments' => $shiftAssignments,
            'corrections' => $corrections,
            'leaveRequests' => $leaveRequests,
            'siteSettings' => $siteSettings,
            'employees' => Employee::where('is_active', true)
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->orderBy('name')
                ->get(['id', 'employee_code', 'name', 'site_id']),
            'shifts' => Shift::where('is_active', true)
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->get(['id', 'site_id', 'code', 'name', 'start_time', 'end_time']),
            'units' => Unit::where('is_active', true)
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->get(['id', 'unit_code', 'site_id']),
            'sites' => Site::where('is_active', true)->get(['id', 'code', 'name']),
            'filters' => [
                'site_id' => $siteId,
                'attendance_date' => $dateFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    public function storeShiftAssignment(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'required|exists:shifts,id',
            'roster_date' => 'required|date',
            'work_status' => 'nullable|in:scheduled,off_day,leave,standby',
            'assigned_unit_id' => 'nullable|exists:units,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $roster = $hrService->assignShift($validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Jadwal Shift Ditambahkan',
            'message' => "Roster {$roster->assignment_code} pada tanggal {$validated['roster_date']} berhasil disimpan.",
        ]);
    }

    public function storeAttendance(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'attendance_date' => 'required|date',
            'status' => 'nullable|in:present,late,absent,on_leave,sick,permit,off_day',
            'check_in_at' => 'nullable|string',
            'check_out_at' => 'nullable|string',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_reason' => 'nullable|string|max:300',
            'input_source' => 'nullable|in:mobile_hp,web_portal,biometric',
            'device_info' => 'nullable|string|max:160',
            'gps_latitude' => 'nullable|numeric',
            'gps_longitude' => 'nullable|numeric',
            'enforce_shift_window' => 'nullable|boolean',
            'remarks' => 'nullable|string|max:500',
        ]);

        $att = $hrService->recordAttendance($validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Presensi Tercatat',
            'message' => "Presensi {$att->attendance_number} tercatat dengan status " . strtoupper($att->status) . ".",
        ]);
    }

    public function storeCorrection(Request $request, Attendance $attendance, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'requested_check_in_at' => 'nullable|string',
            'requested_check_out_at' => 'nullable|string',
            'requested_overtime_hours' => 'nullable|numeric|min:0|max:12',
            'reason' => 'required|string|max:500',
        ]);

        $cor = $hrService->requestAttendanceCorrection($attendance, $validated);

        return back()->with('notify', [
            'type' => 'info',
            'title' => 'Koreksi Presensi Diajukan',
            'message' => "Pengajuan koreksi {$cor->correction_number} menunggu persetujuan HR/Supervisor.",
        ]);
    }

    public function approveCorrection(AttendanceCorrection $attendanceCorrection, HrManagementService $hrService)
    {
        $cor = $hrService->approveAttendanceCorrection($attendanceCorrection);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Koreksi Presensi Disetujui',
            'message' => "Koreksi {$cor->correction_number} telah disetujui dan jam kerja presensi diperbarui.",
        ]);
    }

    public function storeLeave(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:annual_leave,sick_leave,roster_break,maternity_paternity,unpaid_leave,emergency_permit',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
            'substitute_employee_id' => 'nullable|exists:employees,id',
        ]);

        $leave = $hrService->createLeaveRequest($validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Pengajuan Cuti / Izin Terkirim',
            'message' => "Dokumen cuti {$leave->leave_number} ({$leave->total_days} hari) berhasil diajukan.",
        ]);
    }

    public function approveLeave(LeaveRequest $leaveRequest, HrManagementService $hrService)
    {
        $approved = $hrService->approveLeaveRequest($leaveRequest);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Cuti Disetujui & Presensi Disinkronkan',
            'message' => "Cuti {$approved->leave_number} disetujui dan status presensi otomatis tercatat.",
        ]);
    }
}
