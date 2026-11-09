<?php

namespace App\Http\Controllers;

use App\Models\DailyDispatch;
use App\Models\DispatchAssignment;
use App\Models\DispatchAssignmentLog;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Material;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DailyDispatchController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $shiftId = $request->input('shift_id');
        $siteId = $request->input('site_id');

        $query = DailyDispatch::with([
            'site',
            'shift',
            'supervisor',
            'assignments.unit',
            'assignments.driver.employee',
            'assignments.loadingPoint',
            'assignments.dumpingPoint',
            'assignments.material',
            'assignments.logs.user',
        ])->where('date', $date);

        if ($shiftId) {
            $query->where('shift_id', $shiftId);
        }

        if ($siteId) {
            $query->where('site_id', $siteId);
        }

        $dispatches = $query->orderBy('created_at', 'desc')->get();

        // Master lists for modals
        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $shifts = Shift::where('is_active', true)->select('id', 'name', 'code', 'start_time', 'end_time')->get();
        $supervisors = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status', 'capacity_ton')->get();
        $drivers = Driver::with('employee:id,name')->where('is_active', true)->select('id', 'driver_code', 'employee_id', 'mcu_status')->get();
        $loadingPoints = Location::whereIn('location_type', ['pit', 'front_loading'])->where('is_active', true)->select('id', 'name', 'code')->get();
        $dumpingPoints = Location::whereIn('location_type', ['stockpile', 'jetty', 'disposal'])->where('is_active', true)->select('id', 'name', 'code')->get();
        $materials = Material::where('is_active', true)->select('id', 'name', 'code')->get();

        // Summary stats
        $totalAssignedUnits = 0;
        $totalOperating = 0;
        $totalStandby = 0;
        $totalBreakdown = 0;
        $totalTargetRitase = 0;
        $totalActualRitase = 0;

        foreach ($dispatches as $d) {
            foreach ($d->assignments as $asg) {
                $totalAssignedUnits++;
                if ($asg->status === 'operating') $totalOperating++;
                elseif ($asg->status === 'standby') $totalStandby++;
                elseif ($asg->status === 'breakdown') $totalBreakdown++;
                $totalTargetRitase += $asg->target_ritase;
                $totalActualRitase += $asg->actual_ritase;
            }
        }

        return Inertia::render('Production/Dispatch/Index', [
            'dispatches' => $dispatches,
            'filters' => [
                'date' => $date,
                'shift_id' => $shiftId,
                'site_id' => $siteId,
            ],
            'summary' => [
                'total_dispatches' => $dispatches->count(),
                'assigned_units' => $totalAssignedUnits,
                'operating_units' => $totalOperating,
                'standby_units' => $totalStandby,
                'breakdown_units' => $totalBreakdown,
                'target_ritase' => $totalTargetRitase,
                'actual_ritase' => $totalActualRitase,
            ],
            'master' => [
                'sites' => $sites,
                'shifts' => $shifts,
                'supervisors' => $supervisors,
                'units' => $units,
                'drivers' => $drivers,
                'loading_points' => $loadingPoints,
                'dumping_points' => $dumpingPoints,
                'materials' => $materials,
            ],
        ]);
    }

    protected function validateDispatchUnitAndDriver(int $siteId, int $unitId, int $driverId, string $errorKey = 'unit_id'): void
    {
        $unit = Unit::findOrFail($unitId);
        if (!$unit->isRfu()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                $errorKey => "Unit {$unit->unit_code} tidak dapat ditugaskan karena status operasional tidak memenuhi syarat (Status: {$unit->status}, Not RFU / Perlu Perbaikan).",
            ]);
        }

        if ($unit->site_id && (int) $unit->site_id !== $siteId) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                $errorKey => "Site isolation violation: Unit {$unit->unit_code} tidak terdaftar pada site operasional dispatch ini.",
            ]);
        }

        $driver = Driver::with('employee')->findOrFail($driverId);
        if ($driver->administrative_eligibility_status === 'ineligible' || $driver->mcu_status === 'unfit') {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'driver_id' => "Driver {$driver->driver_code} tidak memenuhi syarat kelayakan administrasi/MCU (Status: {$driver->administrative_eligibility_status}, MCU: {$driver->mcu_status}).",
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'site_id' => 'required|exists:sites,id',
            'shift_id' => 'required|exists:shifts,id',
            'supervisor_id' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
            'assignments' => 'nullable|array',
            'assignments.*.unit_id' => 'required|exists:units,id',
            'assignments.*.driver_id' => 'required|exists:drivers,id',
            'assignments.*.loading_point_id' => 'required|exists:locations,id',
            'assignments.*.dumping_point_id' => 'required|exists:locations,id',
            'assignments.*.material_id' => 'required|exists:materials,id',
            'assignments.*.target_ritase' => 'nullable|integer|min:1',
            'assignments.*.remarks' => 'nullable|string',
        ]);

        $this->authorizeSiteAccess((int) $validated['site_id']);

        return DB::transaction(function () use ($validated, $request) {
            $dispatchNumber = 'DSP-' . Carbon::parse($validated['date'])->format('Ymd') . '-S' . $validated['shift_id'] . '-' . rand(10, 99);

            $dispatch = DailyDispatch::create([
                'dispatch_number' => $dispatchNumber,
                'date' => $validated['date'],
                'site_id' => $validated['site_id'],
                'shift_id' => $validated['shift_id'],
                'supervisor_id' => $validated['supervisor_id'] ?? null,
                'status' => 'active',
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            if (!empty($validated['assignments'])) {
                foreach ($validated['assignments'] as $asg) {
                    $this->validateDispatchUnitAndDriver(
                        (int) $dispatch->site_id,
                        (int) $asg['unit_id'],
                        (int) $asg['driver_id'],
                        'assignments'
                    );

                    $assignment = DispatchAssignment::create([
                        'daily_dispatch_id' => $dispatch->id,
                        'unit_id' => $asg['unit_id'],
                        'driver_id' => $asg['driver_id'],
                        'loading_point_id' => $asg['loading_point_id'],
                        'dumping_point_id' => $asg['dumping_point_id'],
                        'material_id' => $asg['material_id'],
                        'target_ritase' => $asg['target_ritase'] ?? 5,
                        'actual_ritase' => 0,
                        'status' => 'assigned',
                        'start_time' => Carbon::now()->format('H:i:s'),
                        'remarks' => $asg['remarks'] ?? null,
                        'created_by' => Auth::id(),
                    ]);

                    DispatchAssignmentLog::create([
                        'dispatch_assignment_id' => $assignment->id,
                        'changed_by' => Auth::id(),
                        'change_type' => 'status_change',
                        'old_values' => null,
                        'new_values' => ['status' => 'assigned'],
                        'reason' => 'Initial dispatch assignment created',
                    ]);
                }
            }

            return redirect()->back()->with('success', "Daily Dispatch {$dispatchNumber} berhasil dibuat dengan alokasi armada.");
        });
    }

    public function addAssignment(Request $request, DailyDispatch $dispatch)
    {
        $this->authorizeSiteAccess((int) $dispatch->site_id);

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'required|exists:drivers,id',
            'loading_point_id' => 'required|exists:locations,id',
            'dumping_point_id' => 'required|exists:locations,id',
            'material_id' => 'required|exists:materials,id',
            'target_ritase' => 'nullable|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($dispatch, $validated) {
            $this->validateDispatchUnitAndDriver(
                (int) $dispatch->site_id,
                (int) $validated['unit_id'],
                (int) $validated['driver_id'],
                'unit_id'
            );

            $assignment = DispatchAssignment::create([
                'daily_dispatch_id' => $dispatch->id,
                'unit_id' => $validated['unit_id'],
                'driver_id' => $validated['driver_id'],
                'loading_point_id' => $validated['loading_point_id'],
                'dumping_point_id' => $validated['dumping_point_id'],
                'material_id' => $validated['material_id'],
                'target_ritase' => $validated['target_ritase'] ?? 5,
                'status' => 'assigned',
                'start_time' => Carbon::now()->format('H:i:s'),
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => Auth::id(),
            ]);

            DispatchAssignmentLog::create([
                'dispatch_assignment_id' => $assignment->id,
                'changed_by' => Auth::id(),
                'change_type' => 'status_change',
                'old_values' => null,
                'new_values' => ['status' => 'assigned'],
                'reason' => 'Unit & Driver ditambahkan ke dispatch harian.',
            ]);

            return redirect()->back()->with('success', 'Penugasan unit baru berhasil ditambahkan.');
        });
    }

    public function updateAssignmentStatus(Request $request, DispatchAssignment $assignment)
    {
        $this->authorizeSiteAccess((int) $assignment->dispatch?->site_id);

        $validated = $request->validate([
            'status' => 'required|in:assigned,operating,standby,breakdown,completed,cancelled',
            'reason' => 'required|string|min:3',
        ]);

        return DB::transaction(function () use ($assignment, $validated) {
            $oldStatus = $assignment->status;
            $assignment->update([
                'status' => $validated['status'],
                'updated_by' => Auth::id(),
            ]);

            DispatchAssignmentLog::create([
                'dispatch_assignment_id' => $assignment->id,
                'changed_by' => Auth::id(),
                'change_type' => 'status_change',
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => $validated['status']],
                'reason' => $validated['reason'],
            ]);

            return redirect()->back()->with('success', "Status penugasan unit diperbarui menjadi {$validated['status']}.");
        });
    }

    public function swapUnitOrDriver(Request $request, DispatchAssignment $assignment)
    {
        $dispatchSiteId = (int) ($assignment->dispatch?->site_id ?? Unit::find($assignment->unit_id)?->site_id);
        $this->authorizeSiteAccess($dispatchSiteId);

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'required|exists:drivers,id',
            'reason' => 'required|string|min:5',
        ]);

        return DB::transaction(function () use ($assignment, $validated, $dispatchSiteId) {
            $this->validateDispatchUnitAndDriver(
                $dispatchSiteId,
                (int) $validated['unit_id'],
                (int) $validated['driver_id'],
                'unit_id'
            );

            $oldValues = [
                'unit_id' => $assignment->unit_id,
                'driver_id' => $assignment->driver_id,
            ];

            $assignment->update([
                'unit_id' => $validated['unit_id'],
                'driver_id' => $validated['driver_id'],
                'updated_by' => Auth::id(),
            ]);

            DispatchAssignmentLog::create([
                'dispatch_assignment_id' => $assignment->id,
                'changed_by' => Auth::id(),
                'change_type' => 'swap_unit_driver',
                'old_values' => $oldValues,
                'new_values' => [
                    'unit_id' => $validated['unit_id'],
                    'driver_id' => $validated['driver_id'],
                ],
                'reason' => $validated['reason'],
            ]);

            return redirect()->back()->with('success', 'Perubahan unit/driver penugasan berhasil dicatat di audit trail.');
        });
    }
}
