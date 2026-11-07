<?php

namespace App\Http\Controllers;

use App\Models\FleetDailyKpi;
use App\Models\Site;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetKpiController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::today()->subDays(6)->toDateString());
        $dateTo = $request->input('date_to', Carbon::today()->toDateString());
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');

        $startDate = Carbon::parse($dateFrom)->startOfDay();
        $endDate = Carbon::parse($dateTo)->endOfDay();
        $daysCount = max(1, $startDate->diffInDays($endDate) + 1);

        // Unit Query
        $unitQuery = Unit::where('is_active', true);
        if ($siteId) {
            $unitQuery->where('site_id', $siteId);
        }
        if ($unitId) {
            $unitQuery->where('id', $unitId);
        }
        $units = $unitQuery->with('site:id,name,code')->get();
        $totalUnits = max(1, $units->count());

        // 1. Total Calendar Hours (TH) = 24 hours * number of active units * number of days
        $totalCalendarHours = round(24.0 * $totalUnits * $daysCount, 2);

        // 2. Total Operating Hours (OH) from UnitHmKmLogs
        $logsQuery = UnitHmKmLog::whereDate('log_date', '>=', $dateFrom)
            ->whereDate('log_date', '<=', $dateTo);
        if ($unitId) {
            $logsQuery->where('unit_id', $unitId);
        } elseif ($siteId) {
            $logsQuery->whereHas('unit', fn($q) => $q->where('site_id', $siteId));
        }
        $totalOperatingHours = round((float) $logsQuery->sum('diff_hm'), 2);

        // 3. Total Downtime Hours (DT) from WorkOrders
        $woQuery = WorkOrder::whereDate('breakdown_time', '>=', $dateFrom)
            ->whereDate('breakdown_time', '<=', $dateTo);
        if ($unitId) {
            $woQuery->where('unit_id', $unitId);
        } elseif ($siteId) {
            $woQuery->whereHas('unit', fn($q) => $q->where('site_id', $siteId));
        }
        $workOrders = $woQuery->get();
        $totalDowntimeMinutes = $workOrders->sum(function ($wo) {
            if ($wo->downtime_minutes) {
                return $wo->downtime_minutes;
            }
            if ($wo->breakdown_time) {
                $end = $wo->completion_time ? Carbon::parse($wo->completion_time) : Carbon::now();
                return max(0, Carbon::parse($wo->breakdown_time)->diffInMinutes($end));
            }
            return 0;
        });
        $totalDowntimeHours = round($totalDowntimeMinutes / 60, 2);

        // Cap downtime if exceeds calendar hours
        if ($totalDowntimeHours > $totalCalendarHours) {
            $totalDowntimeHours = $totalCalendarHours;
        }

        // 4. Standby Hours (SB) = Total Calendar Hours - Operating Hours - Downtime Hours
        $totalStandbyHours = max(0, round($totalCalendarHours - $totalOperatingHours - $totalDowntimeHours, 2));

        // 5. Breakdown Frequency
        $breakdownCount = $workOrders->count();

        // 6. Explicit Availability Formulas
        // Physical Availability (PA) = (OH + SB) / TH * 100%
        $pa = $totalCalendarHours > 0 ? round((($totalOperatingHours + $totalStandbyHours) / $totalCalendarHours) * 100, 2) : 100;
        if ($pa > 100) $pa = 100;

        // Mechanical Availability (MA) = OH / (OH + DT) * 100%
        $ohPlusDt = $totalOperatingHours + $totalDowntimeHours;
        $ma = $ohPlusDt > 0 ? round(($totalOperatingHours / $ohPlusDt) * 100, 2) : 100;
        if ($ma > 100) $ma = 100;

        // Utilization of Availability (UA) = OH / (OH + SB) * 100%
        $ohPlusSb = $totalOperatingHours + $totalStandbyHours;
        $ua = $ohPlusSb > 0 ? round(($totalOperatingHours / $ohPlusSb) * 100, 2) : 0;
        if ($ua > 100) $ua = 100;

        // MTTR (Mean Time to Repair) = Total DT / Breakdown Count
        $mttr = $breakdownCount > 0 ? round($totalDowntimeHours / $breakdownCount, 2) : 0;

        // MTBF (Mean Time Between Failures) = Total OH / Breakdown Count
        $mtbf = $breakdownCount > 0 ? round($totalOperatingHours / $breakdownCount, 2) : $totalOperatingHours;

        // Daily trend data across date range
        $period = CarbonPeriod::create($dateFrom, $dateTo);
        $dailyTrends = [];

        foreach ($period as $day) {
            $dayStr = $day->toDateString();
            $dayCalHours = 24.0 * $totalUnits;

            $dayLogs = UnitHmKmLog::whereDate('log_date', $dayStr);
            if ($unitId) {
                $dayLogs->where('unit_id', $unitId);
            } elseif ($siteId) {
                $dayLogs->whereHas('unit', fn($q) => $q->where('site_id', $siteId));
            }
            $dayOh = (float) $dayLogs->sum('diff_hm');

            $dayWo = WorkOrder::whereDate('breakdown_time', $dayStr);
            if ($unitId) {
                $dayWo->where('unit_id', $unitId);
            } elseif ($siteId) {
                $dayWo->whereHas('unit', fn($q) => $q->where('site_id', $siteId));
            }
            $dayDt = round($dayWo->sum('downtime_minutes') / 60, 2);
            $daySb = max(0, $dayCalHours - $dayOh - $dayDt);

            $dayPa = $dayCalHours > 0 ? round((($dayOh + $daySb) / $dayCalHours) * 100, 1) : 100;
            $dayMa = ($dayOh + $dayDt) > 0 ? round(($dayOh / ($dayOh + $dayDt)) * 100, 1) : 100;
            $dayUa = ($dayOh + $daySb) > 0 ? round(($dayOh / ($dayOh + $daySb)) * 100, 1) : 0;

            $dailyTrends[] = [
                'date' => $day->format('d M'),
                'raw_date' => $dayStr,
                'calendar_hours' => $dayCalHours,
                'operating_hours' => round($dayOh, 1),
                'standby_hours' => round($daySb, 1),
                'downtime_hours' => round($dayDt, 1),
                'pa' => min(100, $dayPa),
                'ma' => min(100, $dayMa),
                'ua' => min(100, $dayUa),
                'breakdowns' => $dayWo->count(),
            ];
        }

        // Unit-by-unit KPI breakdown
        $unitKpiBreakdown = [];
        foreach ($units as $u) {
            $uCalHours = 24.0 * $daysCount;
            $uLogs = UnitHmKmLog::where('unit_id', $u->id)
                ->whereDate('log_date', '>=', $dateFrom)
                ->whereDate('log_date', '<=', $dateTo)
                ->get();
            $uOh = (float) $uLogs->sum('diff_hm');

            $uWo = WorkOrder::where('unit_id', $u->id)
                ->whereDate('breakdown_time', '>=', $dateFrom)
                ->whereDate('breakdown_time', '<=', $dateTo)
                ->get();
            $uDt = round($uWo->sum('downtime_minutes') / 60, 2);
            $uSb = max(0, $uCalHours - $uOh - $uDt);

            $uPa = $uCalHours > 0 ? round((($uOh + $uSb) / $uCalHours) * 100, 1) : 100;
            $uMa = ($uOh + $uDt) > 0 ? round(($uOh / ($uOh + $uDt)) * 100, 1) : 100;
            $uUa = ($uOh + $uSb) > 0 ? round(($uOh / ($uOh + $uSb)) * 100, 1) : 0;

            $unitKpiBreakdown[] = [
                'id' => $u->id,
                'unit_code' => $u->unit_code,
                'registration_number' => $u->registration_number,
                'unit_type' => $u->unit_type,
                'status' => $u->status,
                'calendar_hours' => $uCalHours,
                'operating_hours' => round($uOh, 1),
                'standby_hours' => round($uSb, 1),
                'downtime_hours' => round($uDt, 1),
                'pa' => min(100, $uPa),
                'ma' => min(100, $uMa),
                'ua' => min(100, $uUa),
                'breakdown_count' => $uWo->count(),
            ];
        }

        $allSites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $allUnitsList = Unit::where('is_active', true)->select('id', 'unit_code', 'registration_number')->get();

        return Inertia::render('Fleet/KPI/Index', [
            'metrics' => [
                'total_calendar_hours' => $totalCalendarHours,
                'total_operating_hours' => $totalOperatingHours,
                'total_standby_hours' => $totalStandbyHours,
                'total_downtime_hours' => $totalDowntimeHours,
                'physical_availability' => $pa,
                'mechanical_availability' => $ma,
                'utilization_ua' => $ua,
                'breakdown_frequency' => $breakdownCount,
                'mttr_hours' => $mttr,
                'mtbf_hours' => $mtbf,
                'days_count' => $daysCount,
                'fleet_size' => $totalUnits,
            ],
            'formulas' => [
                'calendar_hours' => 'TH = 24.0 jam × Jumlah Unit × Jumlah Hari',
                'operating_hours' => 'OH = Akumulasi selisih jam mesin (HM Akhir - HM Awal) dari log operasional',
                'downtime_hours' => 'DT = Akumulasi durasi perbaikan + breakdown dari Work Order',
                'standby_hours' => 'SB = Max(0, TH - OH - DT) (Jam unit siap operasi namun standby/tidak jalan)',
                'physical_availability' => 'PA = ((OH + SB) / TH) × 100% = ((TH - DT) / TH) × 100% [Pembagi: Total Calendar Hours]',
                'mechanical_availability' => 'MA = (OH / (OH + DT)) × 100% [Pembagi: Jam Operasi + Jam Downtime]',
                'utilization_ua' => 'UA = (OH / (OH + SB)) × 100% [Pembagi: Jam Siap Operasi / RFU Hours]',
                'mttr' => 'MTTR = Total DT / Frekuensi Breakdown (Rata-rata jam perbaikan per insiden)',
                'mtbf' => 'MTBF = Total OH / Frekuensi Breakdown (Rata-rata jam operasi antar kerusakan)',
            ],
            'dailyTrends' => $dailyTrends,
            'unitBreakdown' => $unitKpiBreakdown,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'site_id' => $siteId,
                'unit_id' => $unitId,
            ],
            'master' => [
                'sites' => $allSites,
                'units' => $allUnitsList,
            ],
        ]);
    }
}
