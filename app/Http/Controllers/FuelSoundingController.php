<?php

namespace App\Http\Controllers;

use App\Models\FuelAdjustment;
use App\Models\FuelReconciliation;
use App\Models\FuelSounding;
use App\Models\FuelTank;
use App\Models\Site;
use App\Services\FuelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FuelSoundingController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $tankId = $request->input('fuel_tank_id');

        $tanks = FuelTank::with(['site:id,name,code', 'calibrations'])
            ->where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->get();

        $soundings = FuelSounding::with([
            'site:id,name,code',
            'tank:id,tank_number,tank_name,capacity_liters,max_height_cm',
            'recorder:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($tankId, fn ($q) => $q->where('fuel_tank_id', $tankId))
            ->orderByDesc('sounding_date')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $reconciliations = FuelReconciliation::with([
            'site:id,name,code',
            'tank:id,tank_number,tank_name',
            'sounding:id,sounding_number,measurement_cm,estimated_volume_liters',
            'reconciler:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($tankId, fn ($q) => $q->where('fuel_tank_id', $tankId))
            ->orderByDesc('reconciliation_date')
            ->orderByDesc('id')
            ->limit(15)
            ->get();

        $adjustments = FuelAdjustment::with([
            'site:id,name,code',
            'tank:id,tank_number,tank_name',
            'requester:id,name',
            'approver:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($tankId, fn ($q) => $q->where('fuel_tank_id', $tankId))
            ->orderByDesc('id')
            ->limit(15)
            ->get();

        return Inertia::render('Fuel/Soundings/Index', [
            'tanks' => $tanks,
            'soundings' => $soundings,
            'reconciliations' => $reconciliations,
            'adjustments' => $adjustments,
            'filters' => [
                'site_id' => $siteId,
                'fuel_tank_id' => $tankId,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
            ],
        ]);
    }

    public function storeSounding(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'fuel_tank_id' => 'required|exists:fuel_tanks,id',
            'sounding_date' => 'required|date',
            'sounding_time' => 'required|string|max:10',
            'measurement_cm' => 'required|numeric|min:0',
            'water_level_cm' => 'nullable|numeric|min:0',
            'temperature_celsius' => 'nullable|numeric',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'remarks' => 'nullable|string|max:500',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment_path'] = $request->file('attachment')->store('fuel/soundings', 'public');
        }

        $sounding = $fuelService->recordTankSounding($validated);

        return redirect()->back()->with('success', "Daily Tank Sounding {$sounding->sounding_number} ({$sounding->measurement_cm} cm → {$sounding->estimated_volume_liters} L via {$sounding->calibration_method}) berhasil dicatat. Selisih terhadap stok buku: {$sounding->variance_liters} L.");
    }

    public function storeReconciliation(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'fuel_tank_id' => 'required|exists:fuel_tanks,id',
            'reconciliation_date' => 'required|date',
            'opening_stock_liters' => 'nullable|numeric|min:0',
            'physical_sounding_cm' => 'nullable|numeric|min:0',
            'physical_sounding_liters' => 'nullable|numeric|min:0',
            'fuel_sounding_id' => 'nullable|exists:fuel_soundings,id',
            'investigation_findings' => 'nullable|string',
            'corrective_action' => 'nullable|string',
        ]);

        $recon = $fuelService->generateTankReconciliation($validated);

        return redirect()->back()->with('success', "Rekonsiliasi BBM {$recon->reconciliation_number} selesai. System Closing: {$recon->system_closing_stock_liters} L vs Fisik Sounding: {$recon->physical_sounding_liters} L (Selisih: {$recon->variance_liters} L).");
    }

    public function storeAdjustment(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'fuel_tank_id' => 'required|exists:fuel_tanks,id',
            'fuel_sounding_id' => 'nullable|exists:fuel_soundings,id',
            'adjustment_date' => 'required|date',
            'adjustment_type' => 'required|in:gain,loss,sounding_correction,evaporation,meter_calibration',
            'adjustment_liters' => 'required|numeric',
            'reason' => 'required|string|max:500',
            'investigation_notes' => 'nullable|string|max:500',
        ]);

        $adj = $fuelService->createAndApproveFuelAdjustment($validated, true);

        return redirect()->back()->with('success', "Prosedur Adjustment Resmi {$adj->adjustment_number} ({$adj->adjustment_liters} L) telah disetujui dan saldo tangki diperbarui menjadi {$adj->physical_stock_after_liters} L.");
    }
}
