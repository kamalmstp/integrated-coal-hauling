<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\MaintenanceServiceInterval;
use App\Models\Shift;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HmKmMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::today()->subDays(7)->toDateString());
        $dateTo = $request->input('date_to', Carbon::today()->toDateString());
        $unitId = $request->input('unit_id');
        $shiftId = $request->input('shift_id');
        $onlyAnomaly = $request->boolean('only_anomaly');

        $query = UnitHmKmLog::with([
            'unit:id,unit_code,registration_number,unit_type',
            'driver.employee:id,name',
            'shift:id,name,code',
        ])
        ->whereDate('log_date', '>=', $dateFrom)
        ->whereDate('log_date', '<=', $dateTo);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($shiftId) {
            $query->where('shift_id', $shiftId);
        }
        if ($onlyAnomaly) {
            $query->where('is_anomaly', true);
        }

        $logs = $query->orderBy('log_date', 'desc')->paginate(15)->withQueryString();

        // Service Intervals (PM Planner)
        $serviceIntervals = MaintenanceServiceInterval::with('unit:id,unit_code,registration_number,last_hm')
            ->orderBy('remaining_hm', 'asc')
            ->get();

        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'last_hm', 'last_km')->get();
        $drivers = Driver::with('employee:id,name')->where('is_active', true)->get();
        $shifts = Shift::where('is_active', true)->get();

        // KPI Summary
        $allLogs = UnitHmKmLog::whereDate('log_date', '>=', $dateFrom)->whereDate('log_date', '<=', $dateTo)->get();
        $kpi = [
            'total_logs' => $allLogs->count(),
            'total_operating_hm' => round($allLogs->sum('diff_hm'), 1),
            'total_distance_km' => round($allLogs->sum('diff_km'), 1),
            'anomalies_detected' => $allLogs->where('is_anomaly', true)->count(),
            'service_due_soon' => $serviceIntervals->where('status', 'due_soon')->count(),
            'service_overdue' => $serviceIntervals->where('status', 'overdue')->count(),
        ];

        return Inertia::render('Fleet/HMKM/Index', [
            'logs' => $logs,
            'serviceIntervals' => $serviceIntervals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'unit_id' => $unitId,
                'shift_id' => $shiftId,
                'only_anomaly' => $onlyAnomaly,
            ],
            'kpi' => $kpi,
            'master' => [
                'units' => $units,
                'drivers' => $drivers,
                'shifts' => $shifts,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'shift_id' => 'required|exists:shifts,id',
            'log_date' => 'required|date',
            'start_hm' => 'required|numeric|min:0',
            'end_hm' => 'required|numeric|min:0',
            'start_km' => 'required|numeric|min:0',
            'end_km' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $unit = Unit::findOrFail($validated['unit_id']);
            $diffHm = round($validated['end_hm'] - $validated['start_hm'], 2);
            $diffKm = round($validated['end_km'] - $validated['start_km'], 2);

            // Validation: End must be >= Start
            if ($diffHm < 0) {
                return redirect()->back()->withErrors([
                    'end_hm' => 'HM Akhir tidak boleh lebih kecil dari HM Awal.',
                ]);
            }
            if ($diffKm < 0) {
                return redirect()->back()->withErrors([
                    'end_km' => 'KM Akhir tidak boleh lebih kecil dari KM Awal.',
                ]);
            }

            // Anomaly Detection:
            // 1. diff_hm > 14 hours in 1 shift (impossible in 12h normal shift)
            // 2. diff_km > 600 KM in 1 shift (abnormally high speed/distance)
            $isAnomaly = false;
            $anomalyReasons = [];

            if ($diffHm > 14.0) {
                $isAnomaly = true;
                $anomalyReasons[] = "Penambahan HM ({$diffHm} Jam) melebihi batas wajar durasi shift kerja (Max 14 Jam).";
            }
            if ($diffKm > 600.0) {
                $isAnomaly = true;
                $anomalyReasons[] = "Lompatan KM ({$diffKm} KM) melebihi batas rasional rute hauling.";
            }

            $log = UnitHmKmLog::create([
                'unit_id' => $validated['unit_id'],
                'driver_id' => $validated['driver_id'] ?? null,
                'shift_id' => $validated['shift_id'],
                'log_date' => $validated['log_date'],
                'start_hm' => $validated['start_hm'],
                'end_hm' => $validated['end_hm'],
                'diff_hm' => $diffHm,
                'start_km' => $validated['start_km'],
                'end_km' => $validated['end_km'],
                'diff_km' => $diffKm,
                'is_anomaly' => $isAnomaly,
                'anomaly_reason' => !empty($anomalyReasons) ? implode('; ', $anomalyReasons) : null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            // Sync Unit last HM & KM
            $unit->update([
                'last_hm' => max($unit->last_hm, $validated['end_hm']),
                'last_km' => max($unit->last_km, $validated['end_km']),
            ]);

            // Re-evaluate Service Intervals
            foreach ($unit->serviceIntervals as $interval) {
                $curHm = (float) $unit->last_hm;
                $rem = $interval->next_service_hm - $curHm;
                $newStatus = 'normal';
                if ($rem <= 0) {
                    $newStatus = 'overdue';
                } elseif ($rem <= 40) {
                    $newStatus = 'due_soon';
                }
                $interval->update([
                    'remaining_hm' => $rem,
                    'status' => $newStatus,
                ]);
            }

            if ($isAnomaly) {
                return redirect()->back()->with('warning', "Pencatatan HM/KM tersimpan, NAMUN TERDETEKSI ANOMALI: " . implode('; ', $anomalyReasons));
            }

            return redirect()->back()->with('success', "Pencatatan HM/KM untuk armada {$unit->unit_code} berhasil disimpan (Delta: {$diffHm} Jam, {$diffKm} KM).");
        });
    }
}
