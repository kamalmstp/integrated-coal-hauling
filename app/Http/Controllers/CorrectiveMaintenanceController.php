<?php

namespace App\Http\Controllers;

use App\Models\BreakdownReport;
use App\Models\Site;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CorrectiveMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $dateFrom = $request->input('date_from', Carbon::today()->subDays(29)->toDateString());
        $dateTo = $request->input('date_to', Carbon::today()->toDateString());
        $damageCategory = $request->input('damage_category');

        $query = WorkOrder::with([
            'unit:id,unit_code,registration_number,unit_type,status,last_hm,last_km',
            'site:id,name,code',
            'mechanic:id,name,employee_code',
            'assignments.mechanic',
            'sparepartRequests.items',
            'latestInspection',
            'costs',
        ])
        ->whereIn('job_type', ['corrective_maintenance', 'emergency_repair', 'tire_maintenance', 'electrical_repair', 'general_repair'])
        ->whereDate('breakdown_time', '>=', $dateFrom)
        ->whereDate('breakdown_time', '<=', $dateTo);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $orders = $query->orderBy('breakdown_time', 'desc')->paginate(12)->withQueryString();

        // Unit-by-Unit Reliability & CM Analytics
        $unitsQuery = Unit::where('is_active', true);
        if ($siteId) $unitsQuery->where('site_id', $siteId);
        if ($unitId) $unitsQuery->where('id', $unitId);
        $units = $unitsQuery->get();

        $allOrdersInRange = (clone $query)->get();
        $totalBreakdowns = $allOrdersInRange->count();
        $totalDowntimeHours = round($allOrdersInRange->sum('downtime_minutes') / 60, 1);
        $totalCmCost = (float) $allOrdersInRange->sum('actual_cost');

        // MTTR Formula: Total Downtime Hours / Breakdown Count
        $mttr = $totalBreakdowns > 0 ? round($totalDowntimeHours / $totalBreakdowns, 1) : 0;

        // Operating Hours for MTBF
        $totalOh = (float) UnitHmKmLog::whereDate('log_date', '>=', $dateFrom)
            ->whereDate('log_date', '<=', $dateTo)
            ->when($unitId, fn($q) => $q->where('unit_id', $unitId))
            ->when($siteId, fn($q) => $q->whereHas('unit', fn($uq) => $uq->where('site_id', $siteId)))
            ->sum('diff_hm');

        // MTBF Formula: Total Operating Hours (OH) / Breakdown Count (only if breakdowns > 0 and OH > 0)
        $mtbf = ($totalBreakdowns > 0 && $totalOh > 0) ? round($totalOh / $totalBreakdowns, 1) : null;

        // Unit breakdown statistics table
        $unitAnalytics = [];
        foreach ($units as $u) {
            $uOrders = $allOrdersInRange->where('unit_id', $u->id);
            $uCount = $uOrders->count();
            $uDtHours = round($uOrders->sum('downtime_minutes') / 60, 1);
            $uCost = (float) $uOrders->sum('actual_cost');
            $uMttr = $uCount > 0 ? round($uDtHours / $uCount, 1) : 0;

            $unitAnalytics[] = [
                'id' => $u->id,
                'unit_code' => $u->unit_code,
                'registration_number' => $u->registration_number,
                'unit_type' => $u->unit_type,
                'status' => $u->status,
                'breakdown_count' => $uCount,
                'downtime_hours' => $uDtHours,
                'actual_cost' => $uCost,
                'mttr' => $uMttr,
            ];
        }

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $unitsList = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status')->get();

        return Inertia::render('Maintenance/Corrective/Index', [
            'orders' => $orders,
            'unitAnalytics' => $unitAnalytics,
            'kpi' => [
                'total_breakdowns' => $totalBreakdowns,
                'total_downtime_hours' => $totalDowntimeHours,
                'total_cost' => $totalCmCost,
                'mttr_hours' => $mttr,
                'mtbf_hours' => $mtbf,
                'operating_hours' => $totalOh,
                'has_sufficient_mtbf_data' => ($totalBreakdowns > 0 && $totalOh > 0),
            ],
            'formulas' => [
                'mttr' => 'MTTR = Total Jam Downtime / Frekuensi Breakdown (Rata-rata jam penanganan perbaikan per kasus kerusakan)',
                'mtbf' => 'MTBF = Total Jam Operasi Mesin (OH) / Frekuensi Breakdown (Rata-rata interval jam kerja antar kerusakan)',
                'downtime' => 'Downtime = Jam Selesai Perbaikan - Jam Mulai Breakdown (Waktu henti operasional armada)',
            ],
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'damage_category' => $damageCategory,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $unitsList,
            ],
        ]);
    }
}
