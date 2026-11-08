<?php

namespace App\Http\Controllers;

use App\Models\DumpingTicket;
use App\Models\MaintenanceCost;
use App\Models\Site;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MaintenanceCostController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $costType = $request->input('cost_type');
        $dateFrom = $request->input('date_from', Carbon::today()->subDays(29)->toDateString());
        $dateTo = $request->input('date_to', Carbon::today()->toDateString());

        $query = MaintenanceCost::with([
            'unit:id,unit_code,registration_number,unit_type,last_hm,last_km',
            'site:id,name,code',
            'workOrder:id,wo_number,job_type,status',
            'creator:id,name',
        ])
        ->whereDate('cost_date', '>=', $dateFrom)
        ->whereDate('cost_date', '<=', $dateTo);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($costType) {
            $query->where('cost_type', $costType);
        }

        $costs = $query->orderBy('cost_date', 'desc')->paginate(15)->withQueryString();

        // Aggregate Totals
        $allCostsInRange = (clone $query)->get();
        $totalEstimated = (float) $allCostsInRange->sum('estimated_amount');
        $totalActual = (float) $allCostsInRange->sum('actual_amount');

        // Breakdown by Cost Type
        $byType = [
            'sparepart' => (float) $allCostsInRange->where('cost_type', 'sparepart')->sum('actual_amount'),
            'material' => (float) $allCostsInRange->where('cost_type', 'material')->sum('actual_amount'),
            'third_party' => (float) $allCostsInRange->where('cost_type', 'third_party_service')->sum('actual_amount'),
            'consumables' => (float) $allCostsInRange->where('cost_type', 'consumable')->sum('actual_amount'),
            'labor' => (float) $allCostsInRange->where('cost_type', 'mechanic_labor')->sum('actual_amount'),
            'other' => (float) $allCostsInRange->where('cost_type', 'other')->sum('actual_amount'),
        ];

        // Production & Operational metrics for normalization (Cost per HM, Cost per KM, Cost per Ton)
        $totalHm = (float) UnitHmKmLog::whereDate('log_date', '>=', $dateFrom)
            ->whereDate('log_date', '<=', $dateTo)
            ->when($unitId, fn($q) => $q->where('unit_id', $unitId))
            ->when($siteId, fn($q) => $q->whereHas('unit', fn($uq) => $uq->where('site_id', $siteId)))
            ->sum('diff_hm');

        $totalKm = (float) UnitHmKmLog::whereDate('log_date', '>=', $dateFrom)
            ->whereDate('log_date', '<=', $dateTo)
            ->when($unitId, fn($q) => $q->where('unit_id', $unitId))
            ->when($siteId, fn($q) => $q->whereHas('unit', fn($uq) => $uq->where('site_id', $siteId)))
            ->sum('diff_km');

        $totalTonnage = (float) DumpingTicket::whereDate('ticket_date', '>=', $dateFrom)
            ->whereDate('ticket_date', '<=', $dateTo)
            ->where('status', 'verified')
            ->when($unitId, fn($q) => $q->where('unit_id', $unitId))
            ->when($siteId, fn($q) => $q->where('site_id', $siteId))
            ->sum('tonnage');

        $costPerHm = $totalHm > 0 ? round($totalActual / $totalHm, 0) : 0;
        $costPerKm = $totalKm > 0 ? round($totalActual / $totalKm, 0) : 0;
        $costPerTon = $totalTonnage > 0 ? round($totalActual / $totalTonnage, 0) : 0;

        // Cost per Unit Breakdown table
        $unitsQuery = Unit::where('is_active', true);
        if ($siteId) $unitsQuery->where('site_id', $siteId);
        if ($unitId) $unitsQuery->where('id', $unitId);
        $units = $unitsQuery->get();

        $costPerUnitTable = [];
        foreach ($units as $u) {
            $uCosts = $allCostsInRange->where('unit_id', $u->id);
            $uActual = (float) $uCosts->sum('actual_amount');
            $uEstimated = (float) $uCosts->sum('estimated_amount');
            $uWoCount = WorkOrder::where('unit_id', $u->id)->whereDate('breakdown_time', '>=', $dateFrom)->whereDate('breakdown_time', '<=', $dateTo)->count();

            $costPerUnitTable[] = [
                'id' => $u->id,
                'unit_code' => $u->unit_code,
                'registration_number' => $u->registration_number,
                'unit_type' => $u->unit_type,
                'status' => $u->status,
                'wo_count' => $uWoCount,
                'estimated_cost' => $uEstimated,
                'actual_cost' => $uActual,
                'variance' => $uActual - $uEstimated,
            ];
        }

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $unitsList = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type')->get();
        $workOrders = WorkOrder::select('id', 'wo_number', 'unit_id')->orderBy('created_at', 'desc')->take(30)->get();

        return Inertia::render('Maintenance/Costs/Index', [
            'costs' => $costs,
            'costPerUnitTable' => $costPerUnitTable,
            'summary' => [
                'total_estimated' => $totalEstimated,
                'total_actual' => $totalActual,
                'variance' => $totalActual - $totalEstimated,
                'cost_per_hm' => $costPerHm,
                'cost_per_km' => $costPerKm,
                'cost_per_ton' => $costPerTon,
                'total_hm' => $totalHm,
                'total_km' => $totalKm,
                'total_tonnage' => $totalTonnage,
                'by_type' => $byType,
            ],
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'cost_type' => $costType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $unitsList,
                'workOrders' => $workOrders,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'cost_date' => 'required|date',
            'cost_type' => 'required|in:sparepart,material,third_party_service,consumable,mechanic_labor,other',
            'description' => 'required|string|max:255',
            'reference_number' => 'nullable|string|max:100',
            'estimated_amount' => 'nullable|numeric|min:0',
            'actual_amount' => 'required|numeric|min:0',
        ]);

        $wo = WorkOrder::findOrFail($validated['work_order_id']);

        MaintenanceCost::create([
            'work_order_id' => $wo->id,
            'site_id' => $wo->site_id,
            'unit_id' => $wo->unit_id,
            'cost_date' => $validated['cost_date'],
            'cost_type' => $validated['cost_type'],
            'description' => $validated['description'],
            'reference_number' => $validated['reference_number'] ?? null,
            'estimated_amount' => $validated['estimated_amount'] ?? $validated['actual_amount'],
            'actual_amount' => $validated['actual_amount'],
            'created_by' => Auth::id(),
        ]);

        $wo->increment('actual_cost', $validated['actual_amount']);

        return redirect()->back()->with('success', "Biaya perbaikan {$validated['description']} berhasil dicatat.");
    }
}
