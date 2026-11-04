<?php

namespace App\Http\Controllers;

use App\Models\DumpingTicket;
use App\Models\Location;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductionRecapController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::today()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', Carbon::today()->toDateString());
        $shiftId = $request->input('shift_id');
        $loadingPointId = $request->input('loading_point_id');
        $dumpingPointId = $request->input('dumping_point_id');

        // Base query: ONLY verified official production
        $baseQuery = DumpingTicket::verifiedProduction()
            ->whereDate('dumping_tickets.ticket_date', '>=', $dateFrom)
            ->whereDate('dumping_tickets.ticket_date', '<=', $dateTo);

        if ($shiftId) {
            $baseQuery->where('dumping_tickets.shift_id', $shiftId);
        }
        if ($loadingPointId) {
            $baseQuery->where('dumping_tickets.loading_point_id', $loadingPointId);
        }
        if ($dumpingPointId) {
            $baseQuery->where('dumping_tickets.dumping_point_id', $dumpingPointId);
        }

        // Summary KPI
        $totalRitase = (clone $baseQuery)->count();
        $totalTonnage = (clone $baseQuery)->sum('dumping_tickets.tonnage');
        $avgTonnagePerRit = $totalRitase > 0 ? round($totalTonnage / $totalRitase, 2) : 0;

        // Today specific
        $todayRitase = DumpingTicket::verifiedProduction()->whereDate('dumping_tickets.ticket_date', Carbon::today())->count();
        $todayTonnage = DumpingTicket::verifiedProduction()->whereDate('dumping_tickets.ticket_date', Carbon::today())->sum('dumping_tickets.tonnage');

        // Produksi Per Shift
        $byShift = (clone $baseQuery)
            ->join('shifts', 'dumping_tickets.shift_id', '=', 'shifts.id')
            ->select('shifts.name as shift_name', DB::raw('count(*) as ritase'), DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'))
            ->groupBy('shifts.name')
            ->get();

        // Produksi Per Unit
        $byUnit = (clone $baseQuery)
            ->join('units', 'dumping_tickets.unit_id', '=', 'units.id')
            ->select(
                'units.unit_code',
                'units.unit_type',
                DB::raw('count(*) as ritase'),
                DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'),
                DB::raw('avg(dumping_tickets.tonnage) as avg_tonnage')
            )
            ->groupBy('units.unit_code', 'units.unit_type')
            ->orderBy('total_tonnage', 'desc')
            ->get();

        // Produksi Per Driver
        $byDriver = (clone $baseQuery)
            ->join('drivers', 'dumping_tickets.driver_id', '=', 'drivers.id')
            ->join('employees', 'drivers.employee_id', '=', 'employees.id')
            ->select(
                'drivers.driver_code',
                'employees.name as driver_name',
                DB::raw('count(*) as ritase'),
                DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'),
                DB::raw('avg(dumping_tickets.tonnage) as avg_tonnage')
            )
            ->groupBy('drivers.driver_code', 'employees.name')
            ->orderBy('total_tonnage', 'desc')
            ->get();

        // Produksi Per Loading Point
        $byLoadingPoint = (clone $baseQuery)
            ->join('locations', 'dumping_tickets.loading_point_id', '=', 'locations.id')
            ->select('locations.name as loading_name', 'locations.code', DB::raw('count(*) as ritase'), DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'))
            ->groupBy('locations.name', 'locations.code')
            ->orderBy('total_tonnage', 'desc')
            ->get();

        // Produksi Per Dumping Point
        $byDumpingPoint = (clone $baseQuery)
            ->join('locations', 'dumping_tickets.dumping_point_id', '=', 'locations.id')
            ->select('locations.name as dumping_name', 'locations.code', DB::raw('count(*) as ritase'), DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'))
            ->groupBy('locations.name', 'locations.code')
            ->orderBy('total_tonnage', 'desc')
            ->get();

        // Daily Production Timeline
        $dailyTrend = (clone $baseQuery)
            ->select('dumping_tickets.ticket_date', DB::raw('count(*) as ritase'), DB::raw('sum(dumping_tickets.tonnage) as total_tonnage'))
            ->groupBy('dumping_tickets.ticket_date')
            ->orderBy('dumping_tickets.ticket_date', 'asc')
            ->get();

        // Weekly breakdown (grouped by YEARWEEK)
        $weeklyBreakdown = (clone $baseQuery)
            ->select(
                DB::raw('YEARWEEK(dumping_tickets.ticket_date, 1) as year_week'),
                DB::raw('MIN(dumping_tickets.ticket_date) as start_of_week'),
                DB::raw('MAX(dumping_tickets.ticket_date) as end_of_week'),
                DB::raw('count(*) as ritase'),
                DB::raw('sum(dumping_tickets.tonnage) as total_tonnage')
            )
            ->groupBy(DB::raw('YEARWEEK(dumping_tickets.ticket_date, 1)'))
            ->orderBy(DB::raw('YEARWEEK(dumping_tickets.ticket_date, 1)'), 'asc')
            ->get();

        // Monthly breakdown
        $monthlyBreakdown = (clone $baseQuery)
            ->select(
                DB::raw('DATE_FORMAT(dumping_tickets.ticket_date, "%Y-%m") as month_year'),
                DB::raw('count(*) as ritase'),
                DB::raw('sum(dumping_tickets.tonnage) as total_tonnage')
            )
            ->groupBy(DB::raw('DATE_FORMAT(dumping_tickets.ticket_date, "%Y-%m")'))
            ->orderBy('month_year', 'asc')
            ->get();

        $shifts = Shift::where('is_active', true)->get();
        $loadingPoints = Location::whereIn('location_type', ['pit', 'front_loading'])->get();
        $dumpingPoints = Location::whereIn('location_type', ['stockpile', 'jetty', 'disposal'])->get();

        return Inertia::render('Production/Recap/Index', [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'shift_id' => $shiftId,
                'loading_point_id' => $loadingPointId,
                'dumping_point_id' => $dumpingPointId,
            ],
            'summary' => [
                'total_ritase' => $totalRitase,
                'total_tonnage' => round($totalTonnage, 2),
                'avg_tonnage_per_rit' => $avgTonnagePerRit,
                'today_ritase' => $todayRitase,
                'today_tonnage' => round($todayTonnage, 2),
            ],
            'by_shift' => $byShift,
            'by_unit' => $byUnit,
            'by_driver' => $byDriver,
            'by_loading_point' => $byLoadingPoint,
            'by_dumping_point' => $byDumpingPoint,
            'daily_trend' => $dailyTrend,
            'weekly_breakdown' => $weeklyBreakdown,
            'monthly_breakdown' => $monthlyBreakdown,
            'master' => [
                'shifts' => $shifts,
                'loading_points' => $loadingPoints,
                'dumping_points' => $dumpingPoints,
            ],
        ]);
    }
}
