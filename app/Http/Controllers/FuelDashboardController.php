<?php

namespace App\Http\Controllers;

use App\Models\FuelParameter;
use App\Models\FuelReceipt;
use App\Models\FuelSounding;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\Site;
use App\Services\FuelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FuelDashboardController extends Controller
{
    public function index(Request $request, FuelService $fuelService)
    {
        $siteId = $request->input('site_id');
        $today = now()->toDateString();

        $tanks = FuelTank::with(['site:id,code,name', 'location:id,code,name', 'unit:id,unit_code'])
            ->where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->get();

        $totalFuelStock = round((float) $tanks->sum('current_stock_liters'), 2);
        $totalCapacity = round((float) $tanks->sum('capacity_liters'), 2);

        $dailyReceived = (float) FuelTransaction::where('transaction_type', 'receiving')
            ->where('status', 'completed')
            ->whereDate('transaction_date', $today)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->sum('liters');

        $dailyIssued = (float) FuelTransaction::where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->whereDate('transaction_date', $today)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->sum('liters');

        // Low Stock Alerts
        $lowStockTanks = $tanks->filter(function (FuelTank $tank) {
            return (float) $tank->current_stock_liters <= (float) $tank->minimum_alert_liters;
        })->values();

        // Tank Sounding Compliance Today
        $soundedTankIdsToday = FuelSounding::whereDate('sounding_date', $today)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->pluck('fuel_tank_id')
            ->unique();

        $totalActiveTanks = $tanks->count();
        $soundedTanksCount = $tanks->whereIn('id', $soundedTankIdsToday)->count();
        $soundingComplianceRate = $totalActiveTanks > 0
            ? round(($soundedTanksCount / $totalActiveTanks) * 100, 1)
            : 100.0;

        // Consumption & Fuel Ratio Analysis
        $analysis = $fuelService->analyzeFuelConsumption([
            'site_id' => $siteId,
        ]);

        $siteParameters = Site::where('is_active', true)->get()->map(function (Site $s) use ($fuelService) {
            return $fuelService->getOrCreateSiteParameter($s->id)->load('site:id,code,name');
        });

        return Inertia::render('Fuel/Dashboard/Index', [
            'metrics' => [
                'total_fuel_stock_liters' => $totalFuelStock,
                'total_capacity_liters' => $totalCapacity,
                'daily_fuel_received_liters' => round($dailyReceived, 2),
                'daily_fuel_issued_liters' => round($dailyIssued, 2),
                'fuel_consumption_per_ton' => $analysis['summary']['liter_per_ton'],
                'fuel_ratio_liter_per_hm' => $analysis['summary']['liter_per_hm'],
                'fuel_ratio_liter_per_km' => $analysis['summary']['liter_per_km'],
                'fuel_cost_per_ton' => $analysis['summary']['fuel_cost_per_ton'],
                'low_stock_alert_count' => $lowStockTanks->count(),
                'tank_sounding_compliance_percent' => $soundingComplianceRate,
                'sounded_tanks_today' => $soundedTanksCount,
                'total_active_tanks' => $totalActiveTanks,
                'actual_fuel_liters' => $analysis['summary']['actual_fuel_liters'],
                'estimated_fuel_liters' => $analysis['summary']['estimated_fuel_liters'],
                'verified_tonnage' => $analysis['summary']['verified_tonnage'],
            ],
            'tanks' => $tanks,
            'lowStockTanks' => $lowStockTanks,
            'consumptionPerUnit' => $analysis['consumption_per_unit'],
            'consumptionPerShift' => $analysis['consumption_per_shift'],
            'siteParameters' => $siteParameters,
            'filters' => [
                'site_id' => $siteId,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
            ],
        ]);
    }

    public function updateParameter(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'estimation_factor' => 'required|numeric|min:0.0001|max:5',
            'default_haul_distance_km' => 'required|numeric|min:0.1|max:500',
            'standard_fuel_price_per_liter' => 'required|numeric|min:100',
            'low_stock_threshold_percent' => 'nullable|numeric|min:1|max:90',
            'variance_tolerance_percent' => 'nullable|numeric|min:0.01|max:20',
            'authorization_notes' => 'required|string|max:500',
        ]);

        $param = $fuelService->updateSiteParameter((int) $validated['site_id'], $validated);

        return redirect()->back()->with('success', "Parameter Estimasi Solar untuk Site {$param->site->code} berhasil diperbarui menjadi {$param->estimation_factor}.");
    }
}
