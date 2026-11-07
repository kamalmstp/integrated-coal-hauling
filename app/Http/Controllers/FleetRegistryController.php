<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\Unit;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FleetRegistryController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');
        $unitType = $request->input('unit_type');
        $search = $request->input('search');
        $siteId = $request->input('site_id');

        $query = Unit::with([
            'site:id,name,code',
            'vendor:id,name',
            'latestP2h.driver.employee:id,name',
            'activeWorkOrder',
            'serviceIntervals',
        ]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($unitType) {
            $query->where('unit_type', $unitType);
        }
        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('unit_code', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%");
            });
        }

        $units = $query->orderBy('unit_code', 'asc')->paginate(12)->withQueryString();

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $vendors = Vendor::where('is_active', true)->select('id', 'name')->get();

        // Summary counts for Status Monitoring
        $allUnits = Unit::all();
        $summary = [
            'total' => $allUnits->count(),
            'operating' => $allUnits->where('status', 'operating')->count(),
            'standby' => $allUnits->where('status', 'standby')->count(),
            'breakdown' => $allUnits->where('status', 'breakdown')->count(),
            'maintenance' => $allUnits->where('status', 'maintenance')->count(),
            'rfu_ready' => $allUnits->filter(fn($u) => $u->isRfu())->count(),
        ];

        return Inertia::render('Fleet/Registry/Index', [
            'units' => $units,
            'filters' => [
                'status' => $status,
                'unit_type' => $unitType,
                'search' => $search,
                'site_id' => $siteId,
            ],
            'summary' => $summary,
            'master' => [
                'sites' => $sites,
                'vendors' => $vendors,
            ],
        ]);
    }

    public function show(Unit $unit)
    {
        $unit->load([
            'site',
            'vendor',
            'p2hInspections.driver.employee',
            'p2hInspections.items',
            'workOrders.mechanic',
            'hmKmLogs.shift',
            'serviceIntervals',
            'dailyKpis',
        ]);

        return response()->json($unit);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_code' => 'required|string|max:50|unique:units,unit_code',
            'registration_number' => 'required|string|max:30',
            'unit_type' => 'required|in:dump_truck_10,dump_truck_12,light_vehicle,fuel_truck,service_truck,support_equipment',
            'brand' => 'required|string|max:50',
            'model' => 'nullable|string|max:50',
            'year' => 'nullable|integer|between:1990,2030',
            'capacity_ton' => 'required|numeric|min:0',
            'capacity_m3' => 'nullable|numeric|min:0',
            'chassis_number' => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'last_hm' => 'required|numeric|min:0',
            'last_km' => 'required|numeric|min:0',
            'status' => 'required|in:operating,standby,breakdown,maintenance',
            'site_id' => 'required|exists:sites,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'operation_start_date' => 'nullable|date',
        ]);

        $unit = Unit::create(array_merge($validated, [
            'is_active' => true,
            'created_by' => Auth::id(),
        ]));

        // Auto initialize PM intervals
        $serviceIntervals = [250, 500, 1000, 2000];
        foreach ($serviceIntervals as $interval) {
            $curHm = (float) $unit->last_hm;
            $nextHm = (ceil($curHm / $interval) ?: 1) * $interval;
            $unit->serviceIntervals()->create([
                'service_type' => "PM_{$interval}",
                'interval_hm' => $interval,
                'last_service_hm' => floor($curHm / $interval) * $interval,
                'next_service_hm' => $nextHm,
                'remaining_hm' => $nextHm - $curHm,
                'status' => 'normal',
                'notes' => "Program Service Berkala PM {$interval} HM",
            ]);
        }

        return redirect()->back()->with('success', "Armada {$unit->unit_code} berhasil ditambahkan ke Unit Registry.");
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'registration_number' => 'required|string|max:30',
            'unit_type' => 'required|in:dump_truck_10,dump_truck_12,light_vehicle,fuel_truck,service_truck,support_equipment',
            'brand' => 'required|string|max:50',
            'model' => 'nullable|string|max:50',
            'year' => 'nullable|integer|between:1990,2030',
            'capacity_ton' => 'required|numeric|min:0',
            'capacity_m3' => 'nullable|numeric|min:0',
            'chassis_number' => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'last_hm' => 'required|numeric|min:0',
            'last_km' => 'required|numeric|min:0',
            'status' => 'required|in:operating,standby,breakdown,maintenance',
            'site_id' => 'required|exists:sites,id',
            'vendor_id' => 'nullable|exists:vendors,id',
        ]);

        $unit->update(array_merge($validated, [
            'updated_by' => Auth::id(),
        ]));

        return redirect()->back()->with('success', "Data armada {$unit->unit_code} berhasil diperbarui.");
    }

    public function updateStatus(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'status' => 'required|in:operating,standby,breakdown,maintenance',
        ]);

        $unit->update([
            'status' => $validated['status'],
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Status armada {$unit->unit_code} diubah menjadi {$validated['status']}.");
    }
}
