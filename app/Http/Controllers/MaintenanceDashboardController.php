<?php

namespace App\Http\Controllers;

use App\Models\BreakdownReport;
use App\Models\DumpingTicket;
use App\Models\MaintenanceCost;
use App\Models\MaintenanceRequest;
use App\Models\MaintenanceSchedule;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceDashboardController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $dateFrom = $request->input('date_from', Carbon::today()->subDays(29)->toDateString());
        $dateTo = $request->input('date_to', Carbon::today()->toDateString());
        $status = $request->input('status');
        $jobType = $request->input('job_type');
        $priority = $request->input('priority');

        // Base Queries
        $woQuery = WorkOrder::query();
        $bdrQuery = BreakdownReport::query();
        $costQuery = MaintenanceCost::query();

        if ($siteId) {
            $woQuery->where('site_id', $siteId);
            $bdrQuery->where('site_id', $siteId);
            $costQuery->where('site_id', $siteId);
        }
        if ($unitId) {
            $woQuery->where('unit_id', $unitId);
            $bdrQuery->where('unit_id', $unitId);
            $costQuery->where('unit_id', $unitId);
        }
        if ($jobType) {
            $woQuery->where('job_type', $jobType);
        }
        if ($priority) {
            $woQuery->where('priority', $priority);
            $bdrQuery->where('priority', $priority);
        }
        if ($status) {
            $woQuery->where('status', $status);
        }

        // Summary Statistics
        $allUnits = Unit::when($siteId, fn($q) => $q->where('site_id', $siteId))->get();
        $breakdownUnitsCount = $allUnits->where('status', 'breakdown')->count();
        $maintenanceUnitsCount = $allUnits->where('status', 'maintenance')->count();
        $standbyUnitsCount = $allUnits->where('status', 'standby')->count();
        $operatingUnitsCount = $allUnits->where('status', 'operating')->count();

        // Work Orders Metrics
        $totalWoCount = (clone $woQuery)->count();
        $openWoCount = (clone $woQuery)->whereIn('status', ['open', 'submitted', 'approved', 'assigned'])->count();
        $inProgressWoCount = (clone $woQuery)->where('status', 'in_progress')->count();
        $waitingPartsCount = (clone $woQuery)->where('status', 'waiting_sparepart')->count();
        $waitingInspectionCount = (clone $woQuery)->where('status', 'waiting_inspection')->count();
        $completedWoCount = (clone $woQuery)->where('status', 'completed')->count();

        // Downtime Hours Calculation
        $totalDowntimeMinutes = (clone $woQuery)->sum('downtime_minutes');
        $totalDowntimeHours = round($totalDowntimeMinutes / 60, 1);

        // Maintenance Cost Calculations
        $totalEstimatedCost = (clone $woQuery)->sum('estimated_cost');
        $totalActualCost = (clone $woQuery)->sum('actual_cost');
        $sparepartCost = (clone $costQuery)->where('cost_type', 'sparepart')->sum('actual_amount');
        $laborCost = (clone $costQuery)->where('cost_type', 'mechanic_labor')->sum('actual_amount');
        $serviceCost = (clone $costQuery)->where('cost_type', 'third_party_service')->sum('actual_amount');

        // PM Schedules Metrics
        $schedQuery = MaintenanceSchedule::when($siteId, fn($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn($q) => $q->where('unit_id', $unitId));
        $pmNormal = (clone $schedQuery)->where('status', 'normal')->count();
        $pmDueSoon = (clone $schedQuery)->where('status', 'due_soon')->count();
        $pmOverdue = (clone $schedQuery)->where('status', 'overdue')->count();

        // Top 10 Breakdown Units
        $topBreakdownUnits = Unit::with('site:id,name,code')
            ->withCount(['breakdownReports' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereDate('breakdown_date', '>=', $dateFrom)
                  ->whereDate('breakdown_date', '<=', $dateTo);
            }])
            ->withSum(['workOrders as total_downtime_mins' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo);
            }], 'downtime_minutes')
            ->orderBy('breakdown_reports_count', 'desc')
            ->take(10)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'unit_code' => $u->unit_code,
                    'registration_number' => $u->registration_number,
                    'unit_type' => $u->unit_type,
                    'status' => $u->status,
                    'site_name' => $u->site?->name ?? 'Site Muara Teweh',
                    'breakdown_count' => $u->breakdown_reports_count ?? 0,
                    'downtime_hours' => round(($u->total_downtime_mins ?? 0) / 60, 1),
                ];
            });

        // Recent Work Orders
        $recentWorkOrders = WorkOrder::with([
            'unit:id,unit_code,registration_number,status',
            'site:id,name,code',
            'mechanic:id,name,employee_code',
        ])
        ->orderBy('created_at', 'desc')
        ->take(8)
        ->get();

        // Master Lists
        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $unitsList = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status')->get();

        return Inertia::render('Maintenance/Dashboard/Index', [
            'metrics' => [
                'breakdown_units' => $breakdownUnitsCount,
                'under_maintenance' => $maintenanceUnitsCount,
                'standby_units' => $standbyUnitsCount,
                'operating_units' => $operatingUnitsCount,
                'total_units' => $allUnits->count(),
                'total_wo' => $totalWoCount,
                'open_wo' => $openWoCount,
                'in_progress_wo' => $inProgressWoCount,
                'waiting_spareparts' => $waitingPartsCount,
                'waiting_inspection' => $waitingInspectionCount,
                'completed_wo' => $completedWoCount,
                'downtime_hours' => $totalDowntimeHours,
                'estimated_cost' => (float) $totalEstimatedCost,
                'actual_cost' => (float) $totalActualCost,
                'sparepart_cost' => (float) $sparepartCost,
                'labor_cost' => (float) $laborCost,
                'service_cost' => (float) $serviceCost,
                'pm_due_soon' => $pmDueSoon,
                'pm_overdue' => $pmOverdue,
                'pm_normal' => $pmNormal,
            ],
            'topBreakdownUnits' => $topBreakdownUnits,
            'recentWorkOrders' => $recentWorkOrders,
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
                'job_type' => $jobType,
                'priority' => $priority,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $unitsList,
            ],
        ]);
    }
}
