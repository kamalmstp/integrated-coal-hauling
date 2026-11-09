<?php

namespace App\Services;

use App\Models\BreakdownReport;
use App\Models\Department;
use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\FleetDailyKpi;
use App\Models\FuelParameter;
use App\Models\FuelSounding;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\InventoryBalance;
use App\Models\InventoryTransaction;
use App\Models\MaintenanceCost;
use App\Models\MaintenanceSchedule;
use App\Models\ProductionTarget;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Shift;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\SparepartRequestItem;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorInvoice;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ManagementAnalyticsService
{
    /**
     * Resolve and sanitize all 7 report filters while enforcing user site-based access control.
     */
    public function resolveAuthorizedFilters(?User $user, array $raw = []): array
    {
        $isRestrictedToSite = false;
        $lockedSiteId = null;

        if ($user && $user->site_id) {
            $isAdmin = in_array($user->role, ['admin', 'super_admin'], true)
                || (method_exists($user, 'hasRole') && $user->hasRole(['super_admin', 'admin']));

            if (!$isAdmin) {
                $isRestrictedToSite = true;
                $lockedSiteId = (int) $user->site_id;
            }
        }

        $siteId = $isRestrictedToSite
            ? $lockedSiteId
            : (!empty($raw['site_id']) ? (int) $raw['site_id'] : null);

        $dateTo = !empty($raw['date_to'])
            ? Carbon::parse($raw['date_to'])->toDateString()
            : now()->toDateString();

        $dateFrom = !empty($raw['date_from'])
            ? Carbon::parse($raw['date_from'])->toDateString()
            : Carbon::parse($dateTo)->startOfMonth()->toDateString();

        $fromCarbon = Carbon::parse($dateFrom)->startOfDay();
        $toCarbon = Carbon::parse($dateTo)->startOfDay();
        if ($fromCarbon->gt($toCarbon)) {
            [$fromCarbon, $toCarbon] = [$toCarbon, $fromCarbon];
            $dateFrom = $fromCarbon->toDateString();
            $dateTo = $toCarbon->toDateString();
        }

        $daysSpan = max(1, (int) $fromCarbon->diffInDays($toCarbon) + 1);
        $prevToCarbon = $fromCarbon->copy()->subDay();
        $prevFromCarbon = $prevToCarbon->copy()->subDays($daysSpan - 1);

        return [
            'site_id' => $siteId,
            'is_site_locked' => $isRestrictedToSite,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'prev_date_from' => $prevFromCarbon->toDateString(),
            'prev_date_to' => $prevToCarbon->toDateString(),
            'days_span' => $daysSpan,
            'department_id' => !empty($raw['department_id']) ? (int) $raw['department_id'] : null,
            'unit_id' => !empty($raw['unit_id']) ? (int) $raw['unit_id'] : null,
            'driver_id' => !empty($raw['driver_id']) ? (int) $raw['driver_id'] : null,
            'shift_id' => !empty($raw['shift_id']) ? (int) $raw['shift_id'] : null,
            'status' => !empty($raw['status']) ? (string) $raw['status'] : null,
        ];
    }

    public function getFilterMasterOptions(?User $user, array $filters = []): array
    {
        $siteId = $filters['site_id'] ?? null;
        $isLocked = !empty($filters['is_site_locked']);

        $sites = Site::where('is_active', true)
            ->when($isLocked && $siteId, fn ($q) => $q->where('id', $siteId))
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $units = Unit::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderBy('unit_code')
            ->get(['id', 'unit_code', 'brand', 'model', 'site_id', 'status']);

        $drivers = Driver::with('employee:id,employee_code,name,site_id,department_id')
            ->where('is_active', true)
            ->when($siteId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('site_id', $siteId)))
            ->orderBy('driver_code')
            ->get(['id', 'driver_code', 'employee_id']);

        $shifts = Shift::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'site_id']);

        return [
            'sites' => $sites,
            'departments' => $departments,
            'units' => $units,
            'drivers' => $drivers,
            'shifts' => $shifts,
        ];
    }

    /**
     * Apply common filters to DumpingTicket query.
     */
    protected function buildTicketQuery(array $filters, ?string $overrideFrom = null, ?string $overrideTo = null, bool $applyDateRange = true)
    {
        $from = $overrideFrom ?? $filters['date_from'];
        $to = $overrideTo ?? $filters['date_to'];

        return DumpingTicket::query()
            ->where('is_production', true)
            ->when(
                !empty($filters['status']) && $filters['status'] !== 'all',
                fn ($q) => $q->where('status', $filters['status']),
                fn ($q) => $q->where('status', 'verified')
            )
            ->when($applyDateRange, fn ($q) => $q->whereBetween('ticket_date', [$from, $to]))
            ->when($filters['site_id'], fn ($q, $sid) => $q->where('site_id', $sid))
            ->when($filters['unit_id'], fn ($q, $uid) => $q->where('unit_id', $uid))
            ->when($filters['driver_id'], fn ($q, $did) => $q->where('driver_id', $did))
            ->when($filters['shift_id'], fn ($q, $shid) => $q->where('shift_id', $shid))
            ->when($filters['department_id'], function ($q, $deptId) {
                $q->whereHas('driver.employee', fn ($eq) => $eq->where('department_id', $deptId));
            });
    }

    /**
     * 1. EXECUTIVE DASHBOARD
     */
    public function getExecutiveDashboard(array $filters): array
    {
        $siteId = $filters['site_id'];
        $dateFrom = $filters['date_from'];
        $dateTo = $filters['date_to'];
        $refDate = Carbon::parse($dateTo);

        // Site & Unit KPIs
        $totalSites = Site::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('id', $siteId))
            ->count();

        $unitsQuery = Unit::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($filters['unit_id'], fn ($q, $uid) => $q->where('id', $uid));

        $totalUnits = (clone $unitsQuery)->count();
        $breakdownUnits = (clone $unitsQuery)->whereIn('status', ['breakdown', 'maintenance'])->count();
        $availableUnits = $totalUnits - $breakdownUnits;

        // Production Today (on reference date_to), Monthly Production, Period Production & Ritase
        $productionToday = round((float) $this->buildTicketQuery($filters, $dateTo, $dateTo, true)->sum('tonnage'), 2);
        $ritaseToday = (int) $this->buildTicketQuery($filters, $dateTo, $dateTo, true)->count();

        $monthStart = $refDate->copy()->startOfMonth()->toDateString();
        $monthEnd = $refDate->copy()->endOfMonth()->toDateString();
        $monthlyProduction = round((float) $this->buildTicketQuery($filters, $monthStart, $monthEnd, true)->sum('tonnage'), 2);

        $periodTicketQuery = $this->buildTicketQuery($filters);
        $periodTonnage = round((float) (clone $periodTicketQuery)->sum('tonnage'), 2);
        $totalRitase = (int) (clone $periodTicketQuery)->count();

        // Target vs Actual (from ProductionTarget)
        $targetQuery = ProductionTarget::query()
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->where(function ($q) use ($dateFrom, $dateTo, $refDate) {
                $q->whereBetween('target_date', [$dateFrom, $dateTo])
                    ->orWhere(function ($mq) use ($refDate) {
                        $mq->where('period_type', 'monthly')
                            ->where('month', (int) $refDate->month)
                            ->where('year', (int) $refDate->year);
                    });
            });

        $dailyTargetSum = (float) (clone $targetQuery)->where('period_type', 'daily')->sum('target_tonnage');
        $monthlyTargetSum = (float) (clone $targetQuery)->where('period_type', 'monthly')->sum('target_tonnage');
        $targetTonnage = round($dailyTargetSum > 0 ? $dailyTargetSum : $monthlyTargetSum, 2);

        $achievementPercent = $targetTonnage > 0
            ? round(($periodTonnage / $targetTonnage) * 100, 2)
            : ($periodTonnage > 0 ? 100.0 : 0.0);

        // Fuel Consumption (Actual Dispensing from FuelTransaction)
        $fuelQuery = FuelTransaction::query()
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($filters['unit_id'], fn ($q, $uid) => $q->where('unit_id', $uid))
            ->when($filters['driver_id'], fn ($q, $did) => $q->where('driver_id', $did))
            ->when($filters['shift_id'], fn ($q, $shid) => $q->where('shift_id', $shid));

        $fuelConsumptionLiters = round((float) (clone $fuelQuery)->sum('liters'), 2);
        $fuelPerTon = $periodTonnage > 0 ? round($fuelConsumptionLiters / $periodTonnage, 4) : 0.0;

        // Period Comparison (Current Period vs Previous Period)
        $prevTonnage = round((float) $this->buildTicketQuery($filters, $filters['prev_date_from'], $filters['prev_date_to'], true)->sum('tonnage'), 2);
        $prevRitase = (int) $this->buildTicketQuery($filters, $filters['prev_date_from'], $filters['prev_date_to'], true)->count();
        $prevFuelLiters = round((float) FuelTransaction::query()
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [$filters['prev_date_from'], $filters['prev_date_to']])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($filters['unit_id'], fn ($q, $uid) => $q->where('unit_id', $uid))
            ->sum('liters'), 2);

        $periodComparison = [
            'current_period' => "{$dateFrom} s/d {$dateTo}",
            'previous_period' => "{$filters['prev_date_from']} s/d {$filters['prev_date_to']}",
            'tonnage_current' => $periodTonnage,
            'tonnage_previous' => $prevTonnage,
            'tonnage_growth_percent' => $prevTonnage > 0 ? round((($periodTonnage - $prevTonnage) / $prevTonnage) * 100, 2) : 0.0,
            'ritase_current' => $totalRitase,
            'ritase_previous' => $prevRitase,
            'ritase_growth_percent' => $prevRitase > 0 ? round((($totalRitase - $prevRitase) / $prevRitase) * 100, 2) : 0.0,
            'fuel_current_liters' => $fuelConsumptionLiters,
            'fuel_previous_liters' => $prevFuelLiters,
        ];

        // Site Comparison
        $siteComparison = Site::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('id', $siteId))
            ->orderBy('code')
            ->get()
            ->map(function (Site $s) use ($filters, $dateFrom, $dateTo) {
                $sFilters = array_merge($filters, ['site_id' => $s->id]);
                $sTickets = $this->buildTicketQuery($sFilters);
                $sTon = round((float) (clone $sTickets)->sum('tonnage'), 2);
                $sRit = (int) (clone $sTickets)->count();

                $sUnits = Unit::where('is_active', true)->where('site_id', $s->id)->count();
                $sBd = Unit::where('is_active', true)->where('site_id', $s->id)->whereIn('status', ['breakdown', 'maintenance'])->count();

                $sFuel = round((float) FuelTransaction::where('transaction_type', 'dispensing')
                    ->where('status', 'completed')
                    ->where('site_id', $s->id)
                    ->whereBetween('transaction_date', [$dateFrom, $dateTo])
                    ->sum('liters'), 2);

                $sMaintCost = round((float) MaintenanceCost::where('site_id', $s->id)
                    ->whereBetween('cost_date', [$dateFrom, $dateTo])
                    ->sum('actual_amount'), 2);

                return [
                    'site_id' => $s->id,
                    'site_code' => $s->code,
                    'site_name' => $s->name,
                    'total_units' => $sUnits,
                    'available_units' => $sUnits - $sBd,
                    'breakdown_units' => $sBd,
                    'ritase' => $sRit,
                    'tonnage' => $sTon,
                    'fuel_consumption_liters' => $sFuel,
                    'fuel_per_ton' => $sTon > 0 ? round($sFuel / $sTon, 4) : 0.0,
                    'maintenance_cost_idr' => $sMaintCost,
                ];
            })
            ->values();

        // Daily Trend (Traceable to Ticket Date & Fuel Transaction Date)
        $ticketsByDate = (clone $periodTicketQuery)
            ->selectRaw('DATE(ticket_date) as dt, COUNT(*) as ritase, SUM(tonnage) as tonnage')
            ->groupBy(DB::raw('DATE(ticket_date)'))
            ->orderBy('dt')
            ->get()
            ->keyBy('dt');

        $fuelByDate = (clone $fuelQuery)
            ->selectRaw('DATE(transaction_date) as dt, SUM(liters) as liters')
            ->groupBy(DB::raw('DATE(transaction_date)'))
            ->get()
            ->keyBy('dt');

        $allDates = $ticketsByDate->keys()->merge($fuelByDate->keys())->unique()->sort()->values();
        $dailyTrend = $allDates->map(function ($d) use ($ticketsByDate, $fuelByDate) {
            $tRow = $ticketsByDate->get($d);
            $fRow = $fuelByDate->get($d);
            return [
                'date' => $d,
                'ritase' => (int) ($tRow->ritase ?? 0),
                'tonnage' => round((float) ($tRow->tonnage ?? 0), 2),
                'fuel_liters' => round((float) ($fRow->liters ?? 0), 2),
            ];
        })->values();

        // Drill-down Source Transactions
        $drillDown = [
            'production_tickets' => (clone $periodTicketQuery)
                ->with(['site:id,code,name', 'unit:id,unit_code', 'driver.employee:id,name', 'shift:id,name'])
                ->latest('ticket_date')
                ->limit(25)
                ->get(['id', 'ticket_number', 'ticket_date', 'site_id', 'unit_id', 'driver_id', 'shift_id', 'tonnage', 'status']),
            'breakdown_units_list' => (clone $unitsQuery)
                ->with('site:id,code,name')
                ->whereIn('status', ['breakdown', 'maintenance'])
                ->get(['id', 'unit_code', 'brand', 'model', 'site_id', 'status', 'last_hm', 'last_km']),
            'fuel_dispensing' => (clone $fuelQuery)
                ->with(['site:id,code,name', 'unit:id,unit_code', 'tank:id,tank_number,tank_name'])
                ->latest('transaction_date')
                ->limit(25)
                ->get(['id', 'transaction_number', 'transaction_date', 'site_id', 'unit_id', 'source_tank_id', 'liters', 'total_cost']),
        ];

        $financeSummary = $this->getFinanceOperatingCostSummary($filters);

        return [
            'kpis' => [
                'total_sites' => $totalSites,
                'total_units' => $totalUnits,
                'available_units' => $availableUnits,
                'breakdown_units' => $breakdownUnits,
                'total_production_today' => $productionToday,
                'ritase_today' => $ritaseToday,
                'monthly_production' => $monthlyProduction,
                'period_production_tonnage' => $periodTonnage,
                'target_tonnage' => $targetTonnage,
                'target_vs_actual_percent' => $achievementPercent,
                'target_variance_tonnage' => round($periodTonnage - $targetTonnage, 2),
                'total_ritase' => $totalRitase,
                'fuel_consumption_liters' => $fuelConsumptionLiters,
                'fuel_per_ton' => $fuelPerTon,
                'operating_cost_idr' => $financeSummary['operating_cost_idr'],
                'cost_per_ton_idr' => $financeSummary['cost_per_ton_idr'],
                'revenue_idr' => $financeSummary['revenue_idr'],
            ],
            'finance_summary' => $financeSummary,
            'period_comparison' => $periodComparison,
            'site_comparison' => $siteComparison,
            'daily_trend' => $dailyTrend,
            'drill_down' => $drillDown,
        ];
    }

    /**
     * Cross-Module Finance & Operating Cost Summary (Workflow E):
     * Production (Verified Tonnage) -> Revenue -> Fuel Cost -> Maintenance Cost -> Warehouse Cost -> Operating Cost -> Cost per Ton.
     * STRICT DATA INTEGRITY RULE: Warehouse Cost ONLY counts non-maintenance operational issues ('operational_issue', 'general_issue')
     * and explicitly excludes 'maintenance_issue' and 'transfer_out' so sparepart costs already recorded in MaintenanceCost are NEVER double-counted!
     */
    public function getFinanceOperatingCostSummary(array $filters, float $haulingTariffPerTon = 135000.0): array
    {
        $siteId = $filters['site_id'] ?? null;
        $dateFrom = $filters['date_from'] ?? now()->startOfMonth()->toDateString();
        $dateTo = $filters['date_to'] ?? now()->toDateString();
        $unitId = $filters['unit_id'] ?? null;

        // 1. Production & Revenue (Verified Production Tickets)
        $ticketQuery = $this->buildTicketQuery($filters);
        $verifiedTonnage = round((float) (clone $ticketQuery)->sum('tonnage'), 2);
        $verifiedRitase = (int) (clone $ticketQuery)->count();
        $revenueIdr = round($verifiedTonnage * $haulingTariffPerTon, 2);

        // 2. Fuel Cost (Completed Fuel Dispensing Transactions)
        $fuelCostIdr = round((float) FuelTransaction::query()
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->sum('total_cost'), 2);

        // 3. Maintenance Cost (All Work Order Maintenance Costs: Spareparts + Labor + Third Party + Consumables)
        $maintenanceCostIdr = round((float) MaintenanceCost::query()
            ->whereBetween('cost_date', [$dateFrom, $dateTo])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->sum('actual_amount'), 2);

        // 4. Warehouse Operational Cost (Non-Maintenance Stock Issues: operational_issue, general_issue)
        // Excludes 'maintenance_issue' to prevent double cost recording with MaintenanceCost!
        $warehouseCostIdr = round((float) InventoryTransaction::query()
            ->where('direction', 'OUT')
            ->where('status', 'confirmed')
            ->whereIn('transaction_type', ['operational_issue', 'general_issue'])
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->sum('total_amount'), 2);

        // 5. Total Operating Cost & Cost per Ton
        $operatingCostIdr = round($fuelCostIdr + $maintenanceCostIdr + $warehouseCostIdr, 2);
        $operatingMarginIdr = round($revenueIdr - $operatingCostIdr, 2);

        return [
            'verified_tonnage' => $verifiedTonnage,
            'verified_ritase' => $verifiedRitase,
            'hauling_tariff_per_ton_idr' => $haulingTariffPerTon,
            'revenue_idr' => $revenueIdr,
            'fuel_cost_idr' => $fuelCostIdr,
            'maintenance_cost_idr' => $maintenanceCostIdr,
            'warehouse_cost_idr' => $warehouseCostIdr,
            'operating_cost_idr' => $operatingCostIdr,
            'operating_margin_idr' => $operatingMarginIdr,
            'fuel_cost_per_ton_idr' => $verifiedTonnage > 0 ? round($fuelCostIdr / $verifiedTonnage, 2) : 0.0,
            'maintenance_cost_per_ton_idr' => $verifiedTonnage > 0 ? round($maintenanceCostIdr / $verifiedTonnage, 2) : 0.0,
            'warehouse_cost_per_ton_idr' => $verifiedTonnage > 0 ? round($warehouseCostIdr / $verifiedTonnage, 2) : 0.0,
            'cost_per_ton_idr' => $verifiedTonnage > 0 ? round($operatingCostIdr / $verifiedTonnage, 2) : 0.0,
            'margin_per_ton_idr' => $verifiedTonnage > 0 ? round($operatingMarginIdr / $verifiedTonnage, 2) : 0.0,
        ];
    }

    /**
     * 2. PRODUCTION REPORT
     */
    public function getProductionReport(array $filters): array
    {
        $baseQuery = $this->buildTicketQuery($filters);
        $tickets = (clone $baseQuery)
            ->with([
                'site:id,code,name',
                'unit:id,unit_code,brand,model',
                'driver.employee:id,employee_code,name,department_id',
                'shift:id,code,name',
                'loadingPoint:id,code,name',
                'dumpingPoint:id,code,name',
                'material:id,code,name',
            ])
            ->orderBy('ticket_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $totalTonnage = round((float) $tickets->sum('tonnage'), 2);
        $totalRitase = $tickets->count();
        $avgTonPerRit = $totalRitase > 0 ? round($totalTonnage / $totalRitase, 2) : 0.0;

        // Target vs Actual
        $targetQuery = ProductionTarget::query()
            ->when($filters['site_id'], fn ($q, $sid) => $q->where('site_id', $sid))
            ->whereBetween('target_date', [$filters['date_from'], $filters['date_to']])
            ->where('period_type', 'daily');

        $targetTonnage = round((float) (clone $targetQuery)->sum('target_tonnage'), 2);
        $targetRitase = (int) (clone $targetQuery)->sum('target_ritase');

        if ($targetTonnage <= 0) {
            $refDate = Carbon::parse($filters['date_to']);
            $mQuery = ProductionTarget::query()
                ->when($filters['site_id'], fn ($q, $sid) => $q->where('site_id', $sid))
                ->where('period_type', 'monthly')
                ->where('month', (int) $refDate->month)
                ->where('year', (int) $refDate->year);
            $targetTonnage = round((float) (clone $mQuery)->sum('target_tonnage'), 2);
            $targetRitase = (int) (clone $mQuery)->sum('target_ritase');
        }

        $achievementPercent = $targetTonnage > 0
            ? round(($totalTonnage / $targetTonnage) * 100, 2)
            : ($totalTonnage > 0 ? 100.0 : 0.0);

        // Daily Production
        $dailyProduction = $tickets->groupBy(fn ($t) => $t->ticket_date?->format('Y-m-d'))
            ->map(function ($rows, $dateStr) {
                $ton = round((float) $rows->sum('tonnage'), 2);
                $rit = $rows->count();
                return [
                    'date' => $dateStr,
                    'ritase' => $rit,
                    'tonnage' => $ton,
                    'avg_tonnage' => $rit > 0 ? round($ton / $rit, 2) : 0.0,
                ];
            })
            ->sortBy('date')
            ->values();

        // Weekly Production
        $weeklyProduction = $tickets->groupBy(fn ($t) => $t->ticket_date?->format('o-\WW'))
            ->map(function ($rows, $weekKey) {
                $ton = round((float) $rows->sum('tonnage'), 2);
                $rit = $rows->count();
                return [
                    'week' => $weekKey,
                    'start_date' => $rows->min(fn ($r) => $r->ticket_date?->format('Y-m-d')),
                    'end_date' => $rows->max(fn ($r) => $r->ticket_date?->format('Y-m-d')),
                    'ritase' => $rit,
                    'tonnage' => $ton,
                ];
            })
            ->sortBy('week')
            ->values();

        // Monthly Production
        $monthlyProduction = $tickets->groupBy(fn ($t) => $t->ticket_date?->format('Y-m'))
            ->map(function ($rows, $monthKey) {
                $ton = round((float) $rows->sum('tonnage'), 2);
                $rit = $rows->count();
                return [
                    'month' => $monthKey,
                    'ritase' => $rit,
                    'tonnage' => $ton,
                ];
            })
            ->sortBy('month')
            ->values();

        // Unit Productivity
        $hmLogsByUnit = UnitHmKmLog::whereBetween('log_date', [$filters['date_from'], $filters['date_to']])
            ->selectRaw('unit_id, SUM(diff_hm) as total_hm, SUM(diff_km) as total_km')
            ->groupBy('unit_id')
            ->get()
            ->keyBy('unit_id');

        $unitProductivity = $tickets->groupBy('unit_id')
            ->map(function ($rows, $unitId) use ($hmLogsByUnit) {
                $first = $rows->first();
                $ton = round((float) $rows->sum('tonnage'), 2);
                $rit = $rows->count();
                $hmRow = $hmLogsByUnit->get($unitId);
                $hm = round((float) ($hmRow->total_hm ?? 0), 2);
                $km = round((float) ($hmRow->total_km ?? 0), 2);

                return [
                    'unit_id' => $unitId,
                    'unit_code' => $first->unit?->unit_code ?? "UNIT-{$unitId}",
                    'brand_model' => trim(($first->unit?->brand ?? '') . ' ' . ($first->unit?->model ?? '')),
                    'ritase' => $rit,
                    'tonnage' => $ton,
                    'avg_ton_per_rit' => $rit > 0 ? round($ton / $rit, 2) : 0.0,
                    'operating_hm' => $hm,
                    'distance_km' => $km,
                    'ton_per_hm' => $hm > 0 ? round($ton / $hm, 2) : 0.0,
                ];
            })
            ->sortByDesc('tonnage')
            ->values();

        // Driver Productivity
        $driverProductivity = $tickets->groupBy('driver_id')
            ->map(function ($rows, $driverId) {
                $first = $rows->first();
                $ton = round((float) $rows->sum('tonnage'), 2);
                $rit = $rows->count();

                return [
                    'driver_id' => $driverId,
                    'driver_code' => $first->driver?->driver_code ?? "DRV-{$driverId}",
                    'driver_name' => $first->driver?->employee?->name ?? 'Driver Operasional',
                    'ritase' => $rit,
                    'tonnage' => $ton,
                    'avg_ton_per_rit' => $rit > 0 ? round($ton / $rit, 2) : 0.0,
                ];
            })
            ->sortByDesc('tonnage')
            ->values();

        // Shift Productivity
        $shiftProductivity = $tickets->groupBy('shift_id')
            ->map(function ($rows, $shiftId) use ($totalTonnage) {
                $first = $rows->first();
                $ton = round((float) $rows->sum('tonnage'), 2);
                $rit = $rows->count();

                return [
                    'shift_id' => $shiftId,
                    'shift_code' => $first->shift?->code ?? "SH-{$shiftId}",
                    'shift_name' => $first->shift?->name ?? 'Shift Reguler',
                    'ritase' => $rit,
                    'tonnage' => $ton,
                    'share_percent' => $totalTonnage > 0 ? round(($ton / $totalTonnage) * 100, 2) : 0.0,
                ];
            })
            ->sortByDesc('tonnage')
            ->values();

        // Loading Point & Dumping Point Breakdown
        $loadingPointSummary = $tickets->groupBy('loading_point_id')
            ->map(function ($rows, $locId) {
                $first = $rows->first();
                return [
                    'location_id' => $locId,
                    'location_code' => $first->loadingPoint?->code ?? "LP-{$locId}",
                    'location_name' => $first->loadingPoint?->name ?? 'Loading Point',
                    'ritase' => $rows->count(),
                    'tonnage' => round((float) $rows->sum('tonnage'), 2),
                ];
            })
            ->sortByDesc('tonnage')
            ->values();

        $dumpingPointSummary = $tickets->groupBy('dumping_point_id')
            ->map(function ($rows, $locId) {
                $first = $rows->first();
                return [
                    'location_id' => $locId,
                    'location_code' => $first->dumpingPoint?->code ?? "DP-{$locId}",
                    'location_name' => $first->dumpingPoint?->name ?? 'Dumping Point',
                    'ritase' => $rows->count(),
                    'tonnage' => round((float) $rows->sum('tonnage'), 2),
                ];
            })
            ->sortByDesc('tonnage')
            ->values();

        return [
            'summary' => [
                'total_tonnage' => $totalTonnage,
                'total_ritase' => $totalRitase,
                'avg_ton_per_ritase' => $avgTonPerRit,
                'target_tonnage' => $targetTonnage,
                'target_ritase' => $targetRitase,
                'achievement_percent' => $achievementPercent,
                'variance_tonnage' => round($totalTonnage - $targetTonnage, 2),
            ],
            'daily_production' => $dailyProduction,
            'weekly_production' => $weeklyProduction,
            'monthly_production' => $monthlyProduction,
            'unit_productivity' => $unitProductivity,
            'driver_productivity' => $driverProductivity,
            'shift_productivity' => $shiftProductivity,
            'loading_point_summary' => $loadingPointSummary,
            'dumping_point_summary' => $dumpingPointSummary,
            'source_tickets' => $tickets->take(100)->values(),
        ];
    }

    /**
     * 3. FLEET REPORT
     */
    public function getFleetReport(array $filters): array
    {
        $units = Unit::with(['site:id,code,name', 'vendor:id,name'])
            ->where('is_active', true)
            ->when($filters['site_id'], fn ($q, $sid) => $q->where('site_id', $sid))
            ->when($filters['unit_id'], fn ($q, $uid) => $q->where('id', $uid))
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', fn ($q) => $q->where('status', $filters['status']))
            ->orderBy('unit_code')
            ->get();

        $unitIds = $units->pluck('id');

        $kpis = FleetDailyKpi::whereIn('unit_id', $unitIds)
            ->whereBetween('date', [$filters['date_from'], $filters['date_to']])
            ->get()
            ->groupBy('unit_id');

        $hmKmLogs = UnitHmKmLog::whereIn('unit_id', $unitIds)
            ->whereBetween('log_date', [$filters['date_from'], $filters['date_to']])
            ->when($filters['driver_id'], fn ($q, $did) => $q->where('driver_id', $did))
            ->when($filters['shift_id'], fn ($q, $shid) => $q->where('shift_id', $shid))
            ->get()
            ->groupBy('unit_id');

        $breakdowns = BreakdownReport::whereIn('unit_id', $unitIds)
            ->whereBetween('breakdown_date', [$filters['date_from'], $filters['date_to']])
            ->get()
            ->groupBy('unit_id');

        $workOrders = WorkOrder::whereIn('unit_id', $unitIds)
            ->whereBetween(DB::raw('DATE(COALESCE(breakdown_time, created_at))'), [$filters['date_from'], $filters['date_to']])
            ->get()
            ->groupBy('unit_id');

        $ticketsByUnit = $this->buildTicketQuery($filters)
            ->selectRaw('unit_id, COUNT(*) as ritase, SUM(tonnage) as tonnage')
            ->groupBy('unit_id')
            ->get()
            ->keyBy('unit_id');

        $unitPerformance = $units->map(function (Unit $unit) use ($kpis, $hmKmLogs, $breakdowns, $workOrders, $ticketsByUnit, $filters) {
            $uKpis = $kpis->get($unit->id, collect());
            $uLogs = $hmKmLogs->get($unit->id, collect());
            $uBds = $breakdowns->get($unit->id, collect());
            $uWos = $workOrders->get($unit->id, collect());
            $uTkt = $ticketsByUnit->get($unit->id);

            $opHours = round((float) ($uKpis->sum('operating_hours') ?: $uLogs->sum('diff_hm')), 2);
            $downHours = round((float) ($uKpis->sum('downtime_hours') ?: ($uWos->sum('downtime_minutes') / 60)), 2);
            $calHours = round((float) ($uKpis->sum('calendar_hours') ?: ($filters['days_span'] * 24)), 2);
            $standbyHours = max(0, round($calHours - $opHours - $downHours, 2));

            $paPercent = $calHours > 0 ? round((($calHours - $downHours) / $calHours) * 100, 2) : 100.0;
            $maPercent = ($opHours + $downHours) > 0 ? round(($opHours / ($opHours + $downHours)) * 100, 2) : 100.0;
            $uaPercent = ($calHours - $downHours) > 0 ? round(($opHours / ($calHours - $downHours)) * 100, 2) : 0.0;

            $bdFrequency = max($uBds->count(), (int) $uKpis->sum('breakdown_count'));

            return [
                'unit_id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'brand_model' => "{$unit->brand} {$unit->model}",
                'site_code' => $unit->site?->code,
                'status' => $unit->status,
                'last_hm' => round((float) $unit->last_hm, 2),
                'last_km' => round((float) $unit->last_km, 2),
                'operating_hours' => $opHours,
                'downtime_hours' => $downHours,
                'standby_hours' => $standbyHours,
                'pa_percent' => $paPercent,
                'ma_percent' => $maPercent,
                'ua_percent' => $uaPercent,
                'breakdown_frequency' => $bdFrequency,
                'ritase' => (int) ($uTkt->ritase ?? 0),
                'tonnage' => round((float) ($uTkt->tonnage ?? 0), 2),
            ];
        })->values();

        // Unit History (Traceable logs from HM/KM, Breakdowns & Work Orders)
        $recentHmLogs = UnitHmKmLog::with(['unit:id,unit_code', 'driver.employee:id,name', 'shift:id,name'])
            ->whereIn('unit_id', $unitIds)
            ->whereBetween('log_date', [$filters['date_from'], $filters['date_to']])
            ->latest('log_date')
            ->limit(40)
            ->get();

        $recentBreakdowns = BreakdownReport::with(['unit:id,unit_code', 'site:id,code,name'])
            ->whereIn('unit_id', $unitIds)
            ->whereBetween('breakdown_date', [$filters['date_from'], $filters['date_to']])
            ->latest('breakdown_date')
            ->limit(40)
            ->get();

        return [
            'summary' => [
                'total_units' => $units->count(),
                'available_units' => $units->whereNotIn('status', ['breakdown', 'maintenance'])->count(),
                'breakdown_units' => $units->whereIn('status', ['breakdown', 'maintenance'])->count(),
                'avg_pa_percent' => round((float) ($unitPerformance->avg('pa_percent') ?? 100), 2),
                'avg_ma_percent' => round((float) ($unitPerformance->avg('ma_percent') ?? 100), 2),
                'avg_ua_percent' => round((float) ($unitPerformance->avg('ua_percent') ?? 0), 2),
                'total_operating_hours' => round((float) $unitPerformance->sum('operating_hours'), 2),
                'total_downtime_hours' => round((float) $unitPerformance->sum('downtime_hours'), 2),
                'total_standby_hours' => round((float) $unitPerformance->sum('standby_hours'), 2),
                'total_breakdown_frequency' => (int) $unitPerformance->sum('breakdown_frequency'),
            ],
            'unit_performance' => $unitPerformance,
            'unit_history' => [
                'hm_km_logs' => $recentHmLogs,
                'breakdown_reports' => $recentBreakdowns,
            ],
        ];
    }

    /**
     * 4. MAINTENANCE REPORT
     */
    public function getMaintenanceReport(array $filters): array
    {
        $siteId = $filters['site_id'];
        $unitId = $filters['unit_id'];

        // PM Compliance
        $schedules = MaintenanceSchedule::with(['unit:id,unit_code,last_hm,last_km', 'site:id,code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->get();

        $totalSchedules = $schedules->count();
        $overdueSchedules = $schedules->where('status', 'overdue')->count();
        $compliantSchedules = $totalSchedules - $overdueSchedules;
        $pmCompliancePercent = $totalSchedules > 0
            ? round(($compliantSchedules / $totalSchedules) * 100, 2)
            : 100.0;

        // Work Orders (PM & CM Summary)
        $workOrders = WorkOrder::with(['unit:id,unit_code', 'site:id,code,name', 'mechanic:id,employee_code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', fn ($q) => $q->where('status', $filters['status']))
            ->whereBetween(DB::raw('DATE(COALESCE(breakdown_time, created_at))'), [$filters['date_from'], $filters['date_to']])
            ->latest('id')
            ->get();

        $cmWorkOrders = $workOrders->whereIn('job_type', ['corrective', 'breakdown', 'unscheduled']);
        $pmWorkOrders = $workOrders->where('job_type', 'preventive');

        // MTTR & MTBF Calculation from real WorkOrder downtime & Unit operating hours
        $totalDowntimeHours = round((float) $workOrders->sum('downtime_minutes') / 60, 2);
        $failureEvents = max(1, $cmWorkOrders->count());
        $mttrHours = $cmWorkOrders->count() > 0 ? round($totalDowntimeHours / $failureEvents, 2) : 0.0;

        $operatingHours = (float) UnitHmKmLog::query()
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($siteId, fn ($q) => $q->whereHas('unit', fn ($uq) => $uq->where('site_id', $siteId)))
            ->whereBetween('log_date', [$filters['date_from'], $filters['date_to']])
            ->sum('diff_hm');

        if ($operatingHours <= 0) {
            $operatingHours = (float) FleetDailyKpi::query()
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
                ->whereBetween('date', [$filters['date_from'], $filters['date_to']])
                ->sum('operating_hours');
        }

        $mtbfHours = $cmWorkOrders->count() > 0
            ? round($operatingHours / $failureEvents, 2)
            : round($operatingHours, 2);

        // Maintenance Cost
        $costs = MaintenanceCost::with(['unit:id,unit_code', 'workOrder:id,wo_number', 'site:id,code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->whereBetween('cost_date', [$filters['date_from'], $filters['date_to']])
            ->orderBy('cost_date', 'desc')
            ->get();

        $costByType = $costs->groupBy('cost_type')->map(function ($rows, $type) {
            return [
                'cost_type' => $type,
                'count' => $rows->count(),
                'estimated_amount' => round((float) $rows->sum('estimated_amount'), 2),
                'actual_amount' => round((float) $rows->sum('actual_amount'), 2),
            ];
        })->values();

        // Sparepart Usage
        $sparepartRequests = SparepartRequest::with(['workOrder:id,wo_number,unit_id', 'workOrder.unit:id,unit_code', 'warehouse:id,code,name', 'items'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->whereHas('workOrder', fn ($wq) => $wq->where('unit_id', $unitId)))
            ->whereBetween('request_date', [$filters['date_from'], $filters['date_to']])
            ->latest('request_date')
            ->get();

        // Breakdown Analysis by Damage Category
        $breakdowns = BreakdownReport::with(['unit:id,unit_code', 'site:id,code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->whereBetween('breakdown_date', [$filters['date_from'], $filters['date_to']])
            ->get();

        $breakdownAnalysis = $breakdowns->groupBy('damage_category')->map(function ($rows, $cat) {
            return [
                'damage_category' => $cat ?: 'General Mechanical',
                'incident_count' => $rows->count(),
                'critical_count' => $rows->where('is_critical', true)->count(),
            ];
        })->sortByDesc('incident_count')->values();

        return [
            'summary' => [
                'pm_compliance_percent' => $pmCompliancePercent,
                'total_pm_schedules' => $totalSchedules,
                'compliant_pm_schedules' => $compliantSchedules,
                'overdue_pm_schedules' => $overdueSchedules,
                'total_work_orders' => $workOrders->count(),
                'pm_work_orders_count' => $pmWorkOrders->count(),
                'cm_work_orders_count' => $cmWorkOrders->count(),
                'completed_work_orders_count' => $workOrders->whereIn('status', ['completed', 'closed'])->count(),
                'open_work_orders_count' => $workOrders->whereNotIn('status', ['completed', 'closed', 'cancelled'])->count(),
                'mttr_hours' => $mttrHours,
                'mtbf_hours' => $mtbfHours,
                'total_maintenance_cost_idr' => round((float) $costs->sum('actual_amount'), 2),
                'total_sparepart_usage_cost_idr' => round((float) $sparepartRequests->sum('total_cost'), 2),
            ],
            'pm_schedules' => $schedules,
            'work_orders' => $workOrders,
            'cost_by_type' => $costByType,
            'maintenance_costs' => $costs,
            'sparepart_usage' => $sparepartRequests,
            'breakdown_analysis' => $breakdownAnalysis,
        ];
    }

    /**
     * 5. WAREHOUSE & PROCUREMENT REPORT
     */
    public function getWarehouseProcurementReport(array $filters): array
    {
        $siteId = $filters['site_id'];
        $deptId = $filters['department_id'];

        // Stock Balance & Stock Valuation
        $balances = InventoryBalance::with([
            'site:id,code,name',
            'warehouse:id,code,name',
            'location:id,location_code,zone_name',
            'item:id,item_code,item_name,category_code,unit_of_measurement,minimum_stock,reorder_point,part_number',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->get();

        $totalValuationIdr = round((float) $balances->sum('total_value'), 2);
        $totalOnHandQty = round((float) $balances->sum('on_hand_qty'), 2);
        $totalAvailableQty = round((float) $balances->sum('available_qty'), 2);
        $totalReservedQty = round((float) $balances->sum('reserved_qty'), 2);

        // Minimum Stock / Reorder Alert Items
        $minimumStockItems = $balances->filter(function (InventoryBalance $b) {
            $minStock = (float) ($b->item?->minimum_stock ?? 0);
            $reorderPt = (float) ($b->item?->reorder_point ?? 0);
            $threshold = max($minStock, $reorderPt);
            return $threshold > 0 && (float) $b->on_hand_qty <= $threshold;
        })->values();

        // Stock Movement (Inventory Transactions in Date Range)
        $movements = InventoryTransaction::with(['site:id,code,name', 'warehouse:id,code,name', 'unit:id,unit_code', 'vendor:id,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($filters['unit_id'], fn ($q, $uid) => $q->where('unit_id', $uid))
            ->whereBetween('transaction_date', [$filters['date_from'], $filters['date_to']])
            ->latest('transaction_date')
            ->get();

        $inMovements = $movements->where('direction', 'IN');
        $outMovements = $movements->where('direction', 'OUT');

        // Purchase Summary & Purchase Outstanding
        $purchaseRequests = PurchaseRequest::with(['site:id,code,name', 'department:id,code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($deptId, fn ($q) => $q->where('department_id', $deptId))
            ->whereBetween('request_date', [$filters['date_from'], $filters['date_to']])
            ->get();

        $purchaseOrders = PurchaseOrder::with(['site:id,code,name', 'vendor:id,vendor_code,name', 'department:id,code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($deptId, fn ($q) => $q->where('department_id', $deptId))
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', fn ($q) => $q->where('status', $filters['status']))
            ->whereBetween('po_date', [$filters['date_from'], $filters['date_to']])
            ->orderBy('po_date', 'desc')
            ->get();

        $outstandingPos = PurchaseOrder::with(['site:id,code,name', 'vendor:id,vendor_code,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($deptId, fn ($q) => $q->where('department_id', $deptId))
            ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
            ->orderBy('po_date', 'desc')
            ->get();

        $invoices = VendorInvoice::when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->whereBetween('invoice_date', [$filters['date_from'], $filters['date_to']])
            ->get();

        // Vendor Performance
        $vendorPerformance = $purchaseOrders->groupBy('vendor_id')->map(function ($rows, $vendorId) {
            $vendor = $rows->first()?->vendor;
            return [
                'vendor_id' => $vendorId,
                'vendor_code' => $vendor?->code ?? "VND-{$vendorId}",
                'vendor_name' => $vendor?->name ?? 'Vendor Partner',
                'po_count' => $rows->count(),
                'completed_po_count' => $rows->where('status', 'completed')->count(),
                'total_po_value_idr' => round((float) $rows->sum('grand_total'), 2),
                'rating' => round((float) ($vendor?->rating ?? 4.5), 2),
            ];
        })->sortByDesc('total_po_value_idr')->values();

        return [
            'summary' => [
                'total_sku_balances' => $balances->count(),
                'total_on_hand_qty' => $totalOnHandQty,
                'total_available_qty' => $totalAvailableQty,
                'total_reserved_qty' => $totalReservedQty,
                'stock_valuation_idr' => $totalValuationIdr,
                'minimum_stock_alert_count' => $minimumStockItems->count(),
                'stock_in_transactions_count' => $inMovements->count(),
                'stock_in_value_idr' => round((float) $inMovements->sum('total_amount'), 2),
                'stock_out_transactions_count' => $outMovements->count(),
                'stock_out_value_idr' => round((float) $outMovements->sum('total_amount'), 2),
                'total_pr_count' => $purchaseRequests->count(),
                'total_po_count' => $purchaseOrders->count(),
                'total_po_value_idr' => round((float) $purchaseOrders->sum('grand_total'), 2),
                'purchase_outstanding_count' => $outstandingPos->count(),
                'purchase_outstanding_value_idr' => round((float) $outstandingPos->sum('grand_total'), 2),
                'total_invoiced_value_idr' => round((float) $invoices->sum('total_amount'), 2),
            ],
            'stock_balances' => $balances,
            'minimum_stock_items' => $minimumStockItems,
            'stock_movements' => $movements,
            'purchase_orders' => $purchaseOrders,
            'purchase_outstanding' => $outstandingPos,
            'vendor_performance' => $vendorPerformance,
        ];
    }

    /**
     * 6. FUEL REPORT
     */
    public function getFuelReport(array $filters): array
    {
        $siteId = $filters['site_id'];
        $unitId = $filters['unit_id'];
        $driverId = $filters['driver_id'];
        $shiftId = $filters['shift_id'];

        // Fuel Stock (Tanks)
        $tanks = FuelTank::with(['site:id,code,name', 'location:id,code,name'])
            ->where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderBy('tank_number')
            ->get();

        $totalFuelStockLiters = round((float) $tanks->sum('current_stock_liters'), 2);
        $totalCapacityLiters = round((float) $tanks->sum('capacity_liters'), 2);

        // Fuel Received (Receiving Transactions)
        $receivedTx = FuelTransaction::with(['site:id,code,name', 'tank:id,tank_number,tank_name'])
            ->where('transaction_type', 'receiving')
            ->where('status', 'completed')
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->whereBetween('transaction_date', [$filters['date_from'], $filters['date_to']])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $fuelReceivedLiters = round((float) $receivedTx->sum('liters'), 2);

        // Fuel Issued / Dispensing Transactions
        $issuedTx = FuelTransaction::with([
            'site:id,code,name',
            'tank:id,tank_number,tank_name',
            'unit:id,unit_code,brand,model',
            'driver.employee:id,employee_code,name',
            'shift:id,code,name',
        ])
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($driverId, fn ($q) => $q->where('driver_id', $driverId))
            ->when($shiftId, fn ($q) => $q->where('shift_id', $shiftId))
            ->whereBetween('transaction_date', [$filters['date_from'], $filters['date_to']])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $fuelIssuedLiters = round((float) $issuedTx->sum('liters'), 2);
        $fuelIssuedCostIdr = round((float) $issuedTx->sum('total_cost'), 2);

        // Verified Tonnage & HM/KM for Fuel Ratio & Fuel per Ton
        $tickets = $this->buildTicketQuery($filters)->get();
        $verifiedTonnage = round((float) $tickets->sum('tonnage'), 2);

        $hmKmLogs = UnitHmKmLog::query()
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($driverId, fn ($q) => $q->where('driver_id', $driverId))
            ->when($shiftId, fn ($q) => $q->where('shift_id', $shiftId))
            ->when($siteId, fn ($q) => $q->whereHas('unit', fn ($uq) => $uq->where('site_id', $siteId)))
            ->whereBetween('log_date', [$filters['date_from'], $filters['date_to']])
            ->get();

        $totalHm = round((float) $hmKmLogs->sum('diff_hm'), 2);
        $totalKm = round((float) $hmKmLogs->sum('diff_km'), 2);

        $fuelPerTon = $verifiedTonnage > 0 ? round($fuelIssuedLiters / $verifiedTonnage, 4) : 0.0;
        $fuelRatioPerHm = $totalHm > 0 ? round($fuelIssuedLiters / $totalHm, 2) : 0.0;
        $fuelRatioPerKm = $totalKm > 0 ? round($fuelIssuedLiters / $totalKm, 4) : 0.0;

        // Fuel per Unit
        $ticketsByUnit = $tickets->groupBy('unit_id');
        $hmByUnit = $hmKmLogs->groupBy('unit_id');

        $fuelPerUnit = $issuedTx->groupBy('unit_id')->map(function ($rows, $uId) use ($ticketsByUnit, $hmByUnit) {
            $first = $rows->first();
            $liters = round((float) $rows->sum('liters'), 2);
            $uTickets = $ticketsByUnit->get($uId, collect());
            $uHm = $hmByUnit->get($uId, collect());

            $ton = round((float) $uTickets->sum('tonnage'), 2);
            $rit = $uTickets->count();
            $hm = round((float) $uHm->sum('diff_hm'), 2);
            $km = round((float) $uHm->sum('diff_km'), 2);

            return [
                'unit_id' => $uId,
                'unit_code' => $first->unit?->unit_code ?? "UNIT-{$uId}",
                'brand_model' => trim(($first->unit?->brand ?? '') . ' ' . ($first->unit?->model ?? '')),
                'dispensing_count' => $rows->count(),
                'liters_consumed' => $liters,
                'total_cost_idr' => round((float) $rows->sum('total_cost'), 2),
                'tonnage' => $ton,
                'ritase' => $rit,
                'operating_hm' => $hm,
                'distance_km' => $km,
                'fuel_per_ton' => $ton > 0 ? round($liters / $ton, 4) : 0.0,
                'fuel_per_hm' => $hm > 0 ? round($liters / $hm, 2) : 0.0,
                'fuel_per_km' => $km > 0 ? round($liters / $km, 4) : 0.0,
            ];
        })->sortByDesc('liters_consumed')->values();

        // Sounding Variance
        $soundings = FuelSounding::with(['site:id,code,name', 'tank:id,tank_number,tank_name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->whereBetween('sounding_date', [$filters['date_from'], $filters['date_to']])
            ->orderBy('sounding_date', 'desc')
            ->get();

        return [
            'summary' => [
                'fuel_stock_liters' => $totalFuelStockLiters,
                'fuel_capacity_liters' => $totalCapacityLiters,
                'fuel_received_liters' => $fuelReceivedLiters,
                'fuel_issued_liters' => $fuelIssuedLiters,
                'fuel_consumption_liters' => $fuelIssuedLiters,
                'fuel_issued_cost_idr' => $fuelIssuedCostIdr,
                'verified_tonnage' => $verifiedTonnage,
                'fuel_per_ton' => $fuelPerTon,
                'fuel_ratio_liter_per_hm' => $fuelRatioPerHm,
                'fuel_ratio_liter_per_km' => $fuelRatioPerKm,
                'sounding_records_count' => $soundings->count(),
                'total_sounding_variance_liters' => round((float) $soundings->sum('variance_liters'), 2),
            ],
            'tanks' => $tanks,
            'received_transactions' => $receivedTx,
            'issued_transactions' => $issuedTx->take(80)->values(),
            'fuel_per_unit' => $fuelPerUnit,
            'sounding_variances' => $soundings,
        ];
    }

    /**
     * Build flat tabular rows for Excel / CSV / PDF Export for any report type.
     */
    public function buildExportDataset(string $reportType, array $filters): array
    {
        return match ($reportType) {
            'production' => $this->buildProductionExportRows($filters),
            'fleet' => $this->buildFleetExportRows($filters),
            'maintenance' => $this->buildMaintenanceExportRows($filters),
            'warehouse_procurement' => $this->buildWarehouseProcurementExportRows($filters),
            'fuel' => $this->buildFuelExportRows($filters),
            default => $this->buildExecutiveExportRows($filters),
        };
    }

    protected function buildExecutiveExportRows(array $filters): array
    {
        $data = $this->getExecutiveDashboard($filters);
        $headers = ['Site Code', 'Site Name', 'Total Units', 'Available Units', 'Breakdown Units', 'Ritase', 'Tonase (MT)', 'Fuel Consumed (L)', 'Fuel/Ton (L/MT)', 'Maintenance Cost (IDR)'];
        $rows = collect($data['site_comparison'])->map(fn ($s) => [
            $s['site_code'],
            $s['site_name'],
            $s['total_units'],
            $s['available_units'],
            $s['breakdown_units'],
            $s['ritase'],
            $s['tonnage'],
            $s['fuel_consumption_liters'],
            $s['fuel_per_ton'],
            $s['maintenance_cost_idr'],
        ])->all();

        return [
            'title' => 'Executive Summary & Site Comparison Report',
            'headers' => $headers,
            'rows' => $rows,
            'summary' => $data['kpis'],
        ];
    }

    protected function buildProductionExportRows(array $filters): array
    {
        $data = $this->getProductionReport($filters);
        $headers = ['Ticket Number', 'Date', 'Site', 'Unit', 'Driver', 'Shift', 'Loading Point', 'Dumping Point', 'Tonase (MT)', 'Status'];
        $rows = collect($data['source_tickets'])->map(fn ($t) => [
            $t->ticket_number,
            $t->ticket_date?->format('Y-m-d'),
            $t->site?->code,
            $t->unit?->unit_code,
            $t->driver?->employee?->name ?? $t->driver?->driver_code,
            $t->shift?->name,
            $t->loadingPoint?->name,
            $t->dumpingPoint?->name,
            (float) $t->tonnage,
            $t->status,
        ])->all();

        return [
            'title' => 'Production & Hauling Ticket Report',
            'headers' => $headers,
            'rows' => $rows,
            'summary' => $data['summary'],
        ];
    }

    protected function buildFleetExportRows(array $filters): array
    {
        $data = $this->getFleetReport($filters);
        $headers = ['Unit Code', 'Brand/Model', 'Site', 'Status', 'Operating Hours', 'Downtime Hours', 'PA (%)', 'MA (%)', 'UA (%)', 'Breakdown Freq', 'Ritase', 'Tonase (MT)'];
        $rows = collect($data['unit_performance'])->map(fn ($u) => [
            $u['unit_code'],
            $u['brand_model'],
            $u['site_code'],
            $u['status'],
            $u['operating_hours'],
            $u['downtime_hours'],
            $u['pa_percent'],
            $u['ma_percent'],
            $u['ua_percent'],
            $u['breakdown_frequency'],
            $u['ritase'],
            $u['tonnage'],
        ])->all();

        return [
            'title' => 'Fleet Availability, Utilization & Performance Report',
            'headers' => $headers,
            'rows' => $rows,
            'summary' => $data['summary'],
        ];
    }

    protected function buildMaintenanceExportRows(array $filters): array
    {
        $data = $this->getMaintenanceReport($filters);
        $headers = ['WO Number', 'Site', 'Unit', 'Job Type', 'Priority', 'Downtime (Min)', 'Estimated Cost', 'Actual Cost', 'Status'];
        $rows = collect($data['work_orders'])->map(fn ($wo) => [
            $wo->wo_number,
            $wo->site?->code,
            $wo->unit?->unit_code,
            $wo->job_type,
            $wo->priority,
            (int) $wo->downtime_minutes,
            (float) $wo->estimated_cost,
            (float) $wo->actual_cost,
            $wo->status,
        ])->all();

        return [
            'title' => 'Maintenance, Work Order, MTTR/MTBF & Cost Report',
            'headers' => $headers,
            'rows' => $rows,
            'summary' => $data['summary'],
        ];
    }

    protected function buildWarehouseProcurementExportRows(array $filters): array
    {
        $data = $this->getWarehouseProcurementReport($filters);
        $headers = ['Warehouse', 'Item Code', 'Item Name', 'Category', 'On Hand Qty', 'Available Qty', 'Unit Cost (IDR)', 'Total Valuation (IDR)'];
        $rows = collect($data['stock_balances'])->map(fn ($b) => [
            $b->warehouse?->code,
            $b->item?->item_code,
            $b->item?->name,
            $b->item?->category,
            (float) $b->on_hand_qty,
            (float) $b->available_qty,
            (float) $b->average_unit_cost,
            (float) $b->total_value,
        ])->all();

        return [
            'title' => 'Warehouse Stock Valuation & Procurement Summary Report',
            'headers' => $headers,
            'rows' => $rows,
            'summary' => $data['summary'],
        ];
    }

    protected function buildFuelExportRows(array $filters): array
    {
        $data = $this->getFuelReport($filters);
        $headers = ['Unit Code', 'Brand/Model', 'Dispensing Count', 'Fuel Consumed (L)', 'Tonase (MT)', 'Operating HM', 'Distance KM', 'L/Ton', 'L/HM', 'L/KM'];
        $rows = collect($data['fuel_per_unit'])->map(fn ($f) => [
            $f['unit_code'],
            $f['brand_model'],
            $f['dispensing_count'],
            $f['liters_consumed'],
            $f['tonnage'],
            $f['operating_hm'],
            $f['distance_km'],
            $f['fuel_per_ton'],
            $f['fuel_per_hm'],
            $f['fuel_per_km'],
        ])->all();

        return [
            'title' => 'Fuel Stock, Consumption, Ratio & Sounding Variance Report',
            'headers' => $headers,
            'rows' => $rows,
            'summary' => $data['summary'],
        ];
    }
}
