<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\Unit;
use App\Services\FuelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FuelConsumptionAnalysisController extends Controller
{
    public function index(Request $request, FuelService $fuelService)
    {
        $filters = [
            'site_id' => $request->input('site_id'),
            'unit_id' => $request->input('unit_id'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ];

        $analysis = $fuelService->analyzeFuelConsumption($filters);

        $siteParameters = Site::where('is_active', true)->get()->map(function (Site $s) use ($fuelService) {
            return $fuelService->getOrCreateSiteParameter($s->id)->load('site:id,code,name');
        });

        return Inertia::render('Fuel/Analytics/Index', [
            'summary' => $analysis['summary'],
            'consumptionPerUnit' => $analysis['consumption_per_unit'],
            'consumptionPerShift' => $analysis['consumption_per_shift'],
            'consumptionPerMonth' => $analysis['consumption_per_month'],
            'siteParameters' => $siteParameters,
            'filters' => $filters,
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'units' => Unit::where('is_active', true)->select('id', 'site_id', 'unit_code', 'brand', 'model')->orderBy('unit_code')->get(),
            ],
        ]);
    }
}
