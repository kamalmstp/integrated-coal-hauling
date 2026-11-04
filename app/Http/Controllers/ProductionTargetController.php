<?php

namespace App\Http\Controllers;

use App\Models\DumpingTicket;
use App\Models\ProductionTarget;
use App\Models\Site;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductionTargetController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $year = (int) $request->input('year', Carbon::today()->year);
        $month = (int) $request->input('month', Carbon::today()->month);

        $defaultSite = Site::where('is_active', true)->first();
        $targetSiteId = $siteId ?? ($defaultSite?->id ?? 1);

        // 1. Monthly target for the selected month/year
        $monthlyTarget = ProductionTarget::where('site_id', $targetSiteId)
            ->where('period_type', 'monthly')
            ->where('year', $year)
            ->where('month', $month)
            ->first();

        // Realisasi bulanan (from verified dumping tickets)
        $monthStartDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $monthEndDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        $monthlyActualTonnage = DumpingTicket::verifiedProduction()
            ->where('site_id', $targetSiteId)
            ->whereDate('ticket_date', '>=', $monthStartDate)
            ->whereDate('ticket_date', '<=', $monthEndDate)
            ->sum('tonnage');

        $monthlyActualRitase = DumpingTicket::verifiedProduction()
            ->where('site_id', $targetSiteId)
            ->whereDate('ticket_date', '>=', $monthStartDate)
            ->whereDate('ticket_date', '<=', $monthEndDate)
            ->count();

        $monthlyTargetTon = $monthlyTarget?->target_tonnage ?? 0;
        $monthlyTargetRit = $monthlyTarget?->target_ritase ?? 0;
        $monthlyAchievePercent = $monthlyTargetTon > 0 ? round(($monthlyActualTonnage / $monthlyTargetTon) * 100, 1) : 0;
        $monthlyVarianceTon = round($monthlyActualTonnage - $monthlyTargetTon, 2);

        // 2. Daily target for today
        $todayStr = Carbon::today()->toDateString();
        $dailyTarget = ProductionTarget::where('site_id', $targetSiteId)
            ->where('period_type', 'daily')
            ->whereDate('target_date', $todayStr)
            ->first();

        $todayActualTonnage = DumpingTicket::verifiedProduction()
            ->where('site_id', $targetSiteId)
            ->whereDate('ticket_date', $todayStr)
            ->sum('tonnage');

        $todayActualRitase = DumpingTicket::verifiedProduction()
            ->where('site_id', $targetSiteId)
            ->whereDate('ticket_date', $todayStr)
            ->count();

        $dailyTargetTon = $dailyTarget?->target_tonnage ?? 0;
        $dailyTargetRit = $dailyTarget?->target_ritase ?? 0;
        $dailyAchievePercent = $dailyTargetTon > 0 ? round(($todayActualTonnage / $dailyTargetTon) * 100, 1) : 0;
        $dailyVarianceTon = round($todayActualTonnage - $dailyTargetTon, 2);

        // List of all targets for the year
        $targetsList = ProductionTarget::with('site:id,name,code')
            ->where('site_id', $targetSiteId)
            ->where('year', $year)
            ->orderBy('period_type', 'desc')
            ->orderBy('month', 'desc')
            ->orderBy('target_date', 'desc')
            ->paginate(15);

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();

        return Inertia::render('Production/Targets/Index', [
            'filters' => [
                'site_id' => $targetSiteId,
                'year' => $year,
                'month' => $month,
            ],
            'daily_kpi' => [
                'target_date' => $todayStr,
                'target_tonnage' => $dailyTargetTon,
                'target_ritase' => $dailyTargetRit,
                'actual_tonnage' => round($todayActualTonnage, 2),
                'actual_ritase' => $todayActualRitase,
                'achievement_percent' => $dailyAchievePercent,
                'variance_tonnage' => $dailyVarianceTon,
            ],
            'monthly_kpi' => [
                'month' => $month,
                'year' => $year,
                'target_tonnage' => $monthlyTargetTon,
                'target_ritase' => $monthlyTargetRit,
                'actual_tonnage' => round($monthlyActualTonnage, 2),
                'actual_ritase' => $monthlyActualRitase,
                'achievement_percent' => $monthlyAchievePercent,
                'variance_tonnage' => $monthlyVarianceTon,
            ],
            'targets_list' => $targetsList,
            'sites' => $sites,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'period_type' => 'required|in:daily,monthly',
            'target_date' => 'required_if:period_type,daily|nullable|date',
            'month' => 'required_if:period_type,monthly|nullable|integer|between:1,12',
            'year' => 'required|integer|min:2020|max:2050',
            'target_tonnage' => 'required|numeric|min:0.01',
            'target_ritase' => 'required|integer|min:1',
            'working_days' => 'nullable|integer|min:1|max:31',
            'remarks' => 'nullable|string',
        ]);

        $uniqueCriteria = [
            'site_id' => $validated['site_id'],
            'period_type' => $validated['period_type'],
            'target_date' => $validated['period_type'] === 'daily' ? $validated['target_date'] : null,
            'month' => $validated['period_type'] === 'monthly' ? $validated['month'] : null,
            'year' => $validated['year'],
        ];

        ProductionTarget::updateOrCreate(
            $uniqueCriteria,
            array_merge($validated, [
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ])
        );

        return redirect()->back()->with('success', 'Target produksi berhasil disimpan.');
    }
}
