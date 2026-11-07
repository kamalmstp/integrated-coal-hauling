<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Employee;
use App\Models\P2hInspection;
use App\Models\P2hItem;
use App\Models\Shift;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DigitalP2hController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $condition = $request->input('condition');
        $unitId = $request->input('unit_id');
        $shiftId = $request->input('shift_id');

        $query = P2hInspection::with([
            'unit:id,unit_code,registration_number,unit_type,status',
            'driver.employee:id,name',
            'shift:id,name,code',
            'supervisor:id,name',
            'items',
            'workOrder',
        ])->where('inspection_date', $date);

        if ($condition) {
            $query->where('overall_condition', $condition);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($shiftId) {
            $query->where('shift_id', $shiftId);
        }

        $inspections = $query->orderBy('created_at', 'desc')->paginate(12)->withQueryString();

        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status', 'last_hm', 'last_km')->get();
        $drivers = Driver::with('employee:id,name')->where('is_active', true)->get();
        $shifts = Shift::where('is_active', true)->get();

        // Metrics
        $allToday = P2hInspection::where('inspection_date', $date)->get();
        $metrics = [
            'total' => $allToday->count(),
            'rfu' => $allToday->where('overall_condition', 'rfu')->count(),
            'rfu_with_notes' => $allToday->where('overall_condition', 'rfu_with_notes')->count(),
            'not_rfu' => $allToday->where('overall_condition', 'not_rfu')->count(),
            'critical_defects' => $allToday->where('has_critical_defect', true)->count(),
        ];

        return Inertia::render('Fleet/P2H/Index', [
            'inspections' => $inspections,
            'filters' => [
                'date' => $date,
                'condition' => $condition,
                'unit_id' => $unitId,
                'shift_id' => $shiftId,
            ],
            'metrics' => $metrics,
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
            'driver_id' => 'required|exists:drivers,id',
            'shift_id' => 'required|exists:shifts,id',
            'inspection_date' => 'required|date',
            'inspection_time' => 'required|string',
            'current_hm' => 'required|numeric|min:0',
            'current_km' => 'required|numeric|min:0',
            'driver_notes' => 'nullable|string',
            'items' => 'required|array|min:15',
            'items.*.item_name' => 'required|string',
            'items.*.category' => 'required|string',
            'items.*.is_critical' => 'required|boolean',
            'items.*.status' => 'required|in:good,not_good,not_applicable',
            'items.*.defect_description' => 'nullable|string',
            'items.*.photo_path' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $unit = Unit::findOrFail($validated['unit_id']);
            $driver = Driver::with('employee')->findOrFail($validated['driver_id']);

            $hasCriticalDefect = false;
            $hasMinorDefect = false;
            $defectSummary = [];

            foreach ($validated['items'] as $item) {
                if ($item['status'] === 'not_good') {
                    if ($item['is_critical']) {
                        $hasCriticalDefect = true;
                        $defectSummary[] = "KRITIS: {$item['item_name']} (" . ($item['defect_description'] ?? 'Rusak') . ")";
                    } else {
                        $hasMinorDefect = true;
                        $defectSummary[] = "MINOR: {$item['item_name']} (" . ($item['defect_description'] ?? 'Perlu perhatian') . ")";
                    }
                }
            }

            // Determine Overall Condition
            // CRITICAL RULE: If critical defect found, unit CANNOT be RFU!
            $overallCondition = $hasCriticalDefect
                ? 'not_rfu'
                : ($hasMinorDefect ? 'rfu_with_notes' : 'rfu');

            $inspNumber = 'P2H-' . Carbon::parse($validated['inspection_date'])->format('Ymd') . '-' . rand(100, 999);

            $signatureHash = hash('sha256', $driver->driver_code . $validated['inspection_date'] . $validated['inspection_time']);

            $p2h = P2hInspection::create([
                'inspection_number' => $inspNumber,
                'unit_id' => $validated['unit_id'],
                'driver_id' => $validated['driver_id'],
                'shift_id' => $validated['shift_id'],
                'inspection_date' => $validated['inspection_date'],
                'inspection_time' => $validated['inspection_time'],
                'current_hm' => $validated['current_hm'],
                'current_km' => $validated['current_km'],
                'overall_condition' => $overallCondition,
                'has_critical_defect' => $hasCriticalDefect,
                'driver_notes' => $validated['driver_notes'] ?? null,
                'driver_signature_hash' => $signatureHash,
                'is_acknowledged' => true,
                'created_by' => Auth::id(),
            ]);

            // Save Checklist Items
            foreach ($validated['items'] as $item) {
                P2hItem::create([
                    'p2h_inspection_id' => $p2h->id,
                    'category' => $item['category'],
                    'item_name' => $item['item_name'],
                    'is_critical' => $item['is_critical'],
                    'status' => $item['status'],
                    'defect_description' => $item['defect_description'] ?? null,
                    'photo_path' => $item['photo_path'] ?? null,
                ]);
            }

            // Sync Unit HM/KM
            $unit->update([
                'last_hm' => max($unit->last_hm, $validated['current_hm']),
                'last_km' => max($unit->last_km, $validated['current_km']),
            ]);

            // CRITICAL INTEGRATION WITH MAINTENANCE & STATUS:
            // If critical defect exists, Unit status MUST NOT be operating/RFU! It becomes breakdown, and generates a Work Order!
            if ($hasCriticalDefect) {
                $unit->update(['status' => 'breakdown']);

                $woNumber = 'WO-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);
                WorkOrder::create([
                    'wo_number' => $woNumber,
                    'unit_id' => $unit->id,
                    'p2h_inspection_id' => $p2h->id,
                    'source' => 'p2h_defect',
                    'priority' => 'critical_emergency',
                    'breakdown_time' => Carbon::now(),
                    'defect_summary' => "Kerusakan Kritis Hasil P2H Digital: " . implode('; ', $defectSummary),
                    'status' => 'open',
                    'created_by' => Auth::id(),
                ]);

                return redirect()->back()->with('error', "P2H Selesai: DITEMUKAN KERUSAKAN KRITIS! Unit {$unit->unit_code} dinyatakan TIDAK SIAP OPERASI (NOT RFU), status diubah menjadi BREAKDOWN, dan Work Order otomatis diterbitkan ke tim Maintenance.");
            }

            return redirect()->back()->with('success', "Form P2H {$p2h->inspection_number} berhasil disimpan. Unit {$unit->unit_code} dinyatakan " . ($overallCondition === 'rfu' ? 'SIAP OPERASI (RFU).' : 'RFU DENGAN CATATAN MINOR.'));
        });
    }

    public function show(P2hInspection $p2h)
    {
        $p2h->load([
            'unit',
            'driver.employee',
            'shift',
            'supervisor',
            'items',
            'workOrder',
        ]);

        return response()->json($p2h);
    }
}
