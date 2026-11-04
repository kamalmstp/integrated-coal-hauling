<?php

namespace App\Http\Controllers;

use App\Models\DispatchAssignment;
use App\Models\Driver;
use App\Models\HaulingActivity;
use App\Models\Location;
use App\Models\Material;
use App\Models\Shift;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HaulingActivityController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $status = $request->input('status');
        $unitId = $request->input('unit_id');
        $shiftId = $request->input('shift_id');

        $query = HaulingActivity::with([
            'unit',
            'driver.employee',
            'loadingPoint',
            'dumpingPoint',
            'material',
            'shift',
            'assignment',
        ])->where('activity_date', $date);

        if ($status) {
            $query->where('journey_status', $status);
        }

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($shiftId) {
            $query->where('shift_id', $shiftId);
        }

        $activities = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type')->get();
        $drivers = Driver::with('employee:id,name')->where('is_active', true)->get();
        $loadingPoints = Location::whereIn('location_type', ['pit', 'front_loading'])->get();
        $dumpingPoints = Location::whereIn('location_type', ['stockpile', 'jetty', 'disposal'])->get();
        $materials = Material::where('is_active', true)->get();
        $shifts = Shift::where('is_active', true)->get();

        // Metrics
        $totalActivities = HaulingActivity::where('activity_date', $date)->count();
        $activeLoading = HaulingActivity::where('activity_date', $date)->where('journey_status', 'loading')->count();
        $inTransit = HaulingActivity::where('activity_date', $date)->where('journey_status', 'hauling')->count();
        $dumped = HaulingActivity::where('activity_date', $date)->where('journey_status', 'dumped')->count();
        $delayed = HaulingActivity::where('activity_date', $date)->where('journey_status', 'like', 'delay%')->count();

        return Inertia::render('Production/Hauling/Index', [
            'activities' => $activities,
            'filters' => [
                'date' => $date,
                'status' => $status,
                'unit_id' => $unitId,
                'shift_id' => $shiftId,
            ],
            'metrics' => [
                'total' => $totalActivities,
                'loading' => $activeLoading,
                'hauling' => $inTransit,
                'dumped' => $dumped,
                'delayed' => $delayed,
            ],
            'master' => [
                'units' => $units,
                'drivers' => $drivers,
                'loading_points' => $loadingPoints,
                'dumping_points' => $dumpingPoints,
                'materials' => $materials,
                'shifts' => $shifts,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'required|exists:drivers,id',
            'loading_point_id' => 'required|exists:locations,id',
            'dumping_point_id' => 'required|exists:locations,id',
            'material_id' => 'required|exists:materials,id',
            'shift_id' => 'required|exists:shifts,id',
            'activity_date' => 'required|date',
            'journey_status' => 'required|in:loading,hauling,queueing_dump,dumped,returning,delay_breakdown,delay_weather,delay_road',
            'delay_type' => 'nullable|string',
            'delay_duration_minutes' => 'nullable|integer|min:0',
            'delay_notes' => 'nullable|string',
        ]);

        $now = Carbon::now();
        $loadingStart = $validated['journey_status'] === 'loading' ? $now : $now->copy()->subMinutes(30);
        $haulingStart = in_array($validated['journey_status'], ['hauling', 'queueing_dump', 'dumped', 'returning']) ? $now->copy()->subMinutes(15) : null;
        $dumpingTime = $validated['journey_status'] === 'dumped' ? $now : null;

        $activity = HaulingActivity::create([
            'unit_id' => $validated['unit_id'],
            'driver_id' => $validated['driver_id'],
            'loading_point_id' => $validated['loading_point_id'],
            'dumping_point_id' => $validated['dumping_point_id'],
            'material_id' => $validated['material_id'],
            'shift_id' => $validated['shift_id'],
            'activity_date' => $validated['activity_date'],
            'loading_start_time' => $loadingStart,
            'loading_end_time' => $haulingStart,
            'hauling_start_time' => $haulingStart,
            'dumping_time' => $dumpingTime,
            'journey_status' => $validated['journey_status'],
            'delay_type' => $validated['delay_type'] ?? null,
            'delay_duration_minutes' => $validated['delay_duration_minutes'] ?? 0,
            'delay_notes' => $validated['delay_notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Aktivitas hauling unit berhasil dicatat.');
    }

    public function updateStatus(Request $request, HaulingActivity $activity)
    {
        $validated = $request->validate([
            'journey_status' => 'required|in:loading,hauling,queueing_dump,dumped,returning,delay_breakdown,delay_weather,delay_road',
            'delay_type' => 'nullable|string',
            'delay_duration_minutes' => 'nullable|integer|min:0',
            'delay_notes' => 'nullable|string',
        ]);

        $now = Carbon::now();
        $updates = [
            'journey_status' => $validated['journey_status'],
            'delay_type' => $validated['delay_type'] ?? $activity->delay_type,
            'delay_duration_minutes' => $validated['delay_duration_minutes'] ?? $activity->delay_duration_minutes,
            'delay_notes' => $validated['delay_notes'] ?? $activity->delay_notes,
            'updated_by' => Auth::id(),
        ];

        if ($validated['journey_status'] === 'hauling' && !$activity->hauling_start_time) {
            $updates['hauling_start_time'] = $now;
            $updates['loading_end_time'] = $now;
        } elseif ($validated['journey_status'] === 'dumped' && !$activity->dumping_time) {
            $updates['dumping_time'] = $now;
        }

        $activity->update($updates);

        return redirect()->back()->with('success', 'Status perjalanan unit diperbarui.');
    }
}
