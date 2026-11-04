<?php

namespace App\Http\Controllers;

use App\Models\DailyDispatch;
use App\Models\DumpingTicket;
use App\Models\HaulingActivity;
use App\Models\ProductionTarget;
use App\Models\Site;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductionDashboardController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $defaultSite = Site::where('is_active', true)->first();
        $targetSiteId = $siteId ?? ($defaultSite?->id ?? 1);

        $today = Carbon::today();
        $todayStr = $today->toDateString();

        // 1. Today production (verified ONLY)
        $todayQuery = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', $todayStr);

        $todayRitase = (clone $todayQuery)->count();
        $todayTonnage = (clone $todayQuery)->sum('dumping_tickets.tonnage');

        // 2. Targets & Achievement
        $dailyTarget = ProductionTarget::where('site_id', $targetSiteId)
            ->where('period_type', 'daily')
            ->whereDate('target_date', $todayStr)
            ->first();

        $dailyTargetTon = $dailyTarget?->target_tonnage ?? 15000.00;
        $dailyTargetRit = $dailyTarget?->target_ritase ?? 500;
        $dailyAchievePct = $dailyTargetTon > 0 ? round(($todayTonnage / $dailyTargetTon) * 100, 1) : 0;
        $dailyVariance = round($todayTonnage - $dailyTargetTon, 2);

        // Monthly Target & Achievement
        $monthlyTarget = ProductionTarget::where('site_id', $targetSiteId)
            ->where('period_type', 'monthly')
            ->where('year', $today->year)
            ->where('month', $today->month)
            ->first();

        $monthStartDate = $today->copy()->startOfMonth()->toDateString();
        $monthEndDate = $today->copy()->endOfMonth()->toDateString();

        $monthlyTonnage = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', '>=', $monthStartDate)
            ->whereDate('dumping_tickets.ticket_date', '<=', $monthEndDate)
            ->sum('dumping_tickets.tonnage');

        $monthlyRitase = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', '>=', $monthStartDate)
            ->whereDate('dumping_tickets.ticket_date', '<=', $monthEndDate)
            ->count();

        $monthlyTargetTon = $monthlyTarget?->target_tonnage ?? 450000.00;
        $monthlyAchievePct = $monthlyTargetTon > 0 ? round(($monthlyTonnage / $monthlyTargetTon) * 100, 1) : 0;
        $monthlyVariance = round($monthlyTonnage - $monthlyTargetTon, 2);

        // 3. Shift 1 vs Shift 2 breakdown today
        $shiftBreakdown = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', $todayStr)
            ->join('shifts', 'dumping_tickets.shift_id', '=', 'shifts.id')
            ->select('shifts.name as shift_name', DB::raw('count(*) as ritase'), DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'))
            ->groupBy('shifts.name')
            ->get();

        // 4. Ticket verification status counts
        $pendingVerificationCount = DumpingTicket::where('site_id', $targetSiteId)
            ->whereIn('status', ['submitted', 'pending_verification'])
            ->count();

        $rejectedCount = DumpingTicket::where('site_id', $targetSiteId)
            ->where('status', 'rejected')
            ->count();

        // 5. Top 10 Units based on verified tonnage
        $topUnits = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', '>=', $monthStartDate)
            ->join('units', 'dumping_tickets.unit_id', '=', 'units.id')
            ->select(
                'units.unit_code',
                'units.unit_type',
                'units.status as fleet_status',
                DB::raw('count(*) as total_ritase'),
                DB::raw('sum(dumping_tickets.tonnage) as total_tonnage')
            )
            ->groupBy('units.unit_code', 'units.unit_type', 'units.status')
            ->orderBy('total_tonnage', 'desc')
            ->limit(10)
            ->get();

        // 6. Top 10 Drivers based on verified tonnage
        $topDrivers = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', '>=', $monthStartDate)
            ->join('drivers', 'dumping_tickets.driver_id', '=', 'drivers.id')
            ->join('employees', 'drivers.employee_id', '=', 'employees.id')
            ->select(
                'drivers.driver_code',
                'employees.name as driver_name',
                'drivers.mcu_status',
                DB::raw('count(*) as total_ritase'),
                DB::raw('sum(dumping_tickets.tonnage) as total_tonnage')
            )
            ->groupBy('drivers.driver_code', 'employees.name', 'drivers.mcu_status')
            ->orderBy('total_tonnage', 'desc')
            ->limit(10)
            ->get();

        // 7. Daily production chart (Last 14 days)
        $dailyChart = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', '>=', $today->copy()->subDays(13)->toDateString())
            ->whereDate('dumping_tickets.ticket_date', '<=', $todayStr)
            ->select(
                'dumping_tickets.ticket_date',
                DB::raw('count(*) as ritase'),
                DB::raw('round(sum(dumping_tickets.tonnage), 2) as tonnage')
            )
            ->groupBy('dumping_tickets.ticket_date')
            ->orderBy('dumping_tickets.ticket_date', 'asc')
            ->get();

        // 8. Monthly production chart (Past 6 months)
        $monthlyChart = DumpingTicket::verifiedProduction()
            ->where('dumping_tickets.site_id', $targetSiteId)
            ->whereDate('dumping_tickets.ticket_date', '>=', $today->copy()->subMonths(5)->startOfMonth()->toDateString())
            ->select(
                DB::raw('DATE_FORMAT(dumping_tickets.ticket_date, "%Y-%m") as month_label'),
                DB::raw('count(*) as ritase'),
                DB::raw('round(sum(dumping_tickets.tonnage), 2) as tonnage')
            )
            ->groupBy('month_label')
            ->orderBy('month_label', 'asc')
            ->get();

        // 9. Active dispatch snapshot
        $activeDispatches = DailyDispatch::with(['shift', 'assignments.unit', 'assignments.driver.employee'])
            ->where('date', $todayStr)
            ->get();

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();

        return Inertia::render('Production/Dashboard', [
            'site_id' => $targetSiteId,
            'sites' => $sites,
            'kpi' => [
                'today_ritase' => $todayRitase,
                'today_tonnage' => round($todayTonnage, 2),
                'daily_target_ton' => $dailyTargetTon,
                'daily_target_rit' => $dailyTargetRit,
                'daily_achieve_pct' => $dailyAchievePct,
                'daily_variance' => $dailyVariance,
                'monthly_ritase' => $monthlyRitase,
                'monthly_tonnage' => round($monthlyTonnage, 2),
                'monthly_target_ton' => $monthlyTargetTon,
                'monthly_achieve_pct' => $monthlyAchievePct,
                'monthly_variance' => $monthlyVariance,
                'pending_verification_count' => $pendingVerificationCount,
                'rejected_count' => $rejectedCount,
            ],
            'shift_breakdown' => $shiftBreakdown,
            'top_units' => $topUnits,
            'top_drivers' => $topDrivers,
            'daily_chart' => $dailyChart,
            'monthly_chart' => $monthlyChart,
            'active_dispatches' => $activeDispatches,
        ]);
    }
}
