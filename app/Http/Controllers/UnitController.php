<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Site;
use App\Models\Unit;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    /**
     * Display listing of units with Server-Side Processing
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $unitType = $request->input('unit_type');
        $status = $request->input('status');
        $siteId = $request->input('site_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        $allowedSorts = ['id', 'unit_code', 'registration_number', 'unit_type', 'brand', 'capacity_ton', 'last_hm', 'last_km', 'status', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query = Unit::with(['site', 'vendor']);

        // Search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('unit_code', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('chassis_number', 'like', "%{$search}%");
            });
        }

        // Filters
        if (!empty($unitType) && $unitType !== 'all') {
            $query->where('unit_type', $unitType);
        }
        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }
        if (!empty($siteId) && $siteId !== 'all') {
            $query->where('site_id', $siteId);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        $units = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Units/Index', [
            'units' => $units,
            'filters' => [
                'search' => $search ?? '',
                'unit_type' => $unitType ?? 'all',
                'status' => $status ?? 'all',
                'site_id' => $siteId ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
            'vendors' => Vendor::where('is_active', true)->select('id', 'name', 'vendor_code')->get(),
            'statistics' => [
                'total' => Unit::count(),
                'operating' => Unit::where('status', 'operating')->count(),
                'standby' => Unit::where('status', 'standby')->count(),
                'breakdown' => Unit::where('status', 'breakdown')->count(),
                'maintenance' => Unit::where('status', 'maintenance')->count(),
            ],
        ]);
    }

    /**
     * Store new unit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_code' => 'required|string|max:50|unique:units,unit_code',
            'registration_number' => 'required|string|max:30',
            'unit_type' => 'required|in:dump_truck_10,dump_truck_12,light_vehicle,fuel_truck,service_truck,support_equipment',
            'brand' => 'required|string|max:50',
            'model' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'capacity_ton' => 'required|numeric|min:0',
            'capacity_m3' => 'nullable|numeric|min:0',
            'chassis_number' => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'last_hm' => 'nullable|numeric|min:0',
            'last_km' => 'nullable|numeric|min:0',
            'status' => 'required|in:operating,standby,breakdown,maintenance',
            'operation_start_date' => 'nullable|date',
            'site_id' => 'required|exists:sites,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $unit = Unit::create($validated);

        ActivityLog::log('create', 'unit', "Mendaftarkan unit armada baru: {$unit->unit_code} ({$unit->brand})");

        notify()->success('Unit Berhasil Ditambahkan!', "Unit {$unit->unit_code} berhasil didaftarkan ke sistem.");
        return redirect()->back();
    }

    /**
     * Update unit
     */
    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'unit_code' => "required|string|max:50|unique:units,unit_code,{$unit->id}",
            'registration_number' => 'required|string|max:30',
            'unit_type' => 'required|in:dump_truck_10,dump_truck_12,light_vehicle,fuel_truck,service_truck,support_equipment',
            'brand' => 'required|string|max:50',
            'model' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'capacity_ton' => 'required|numeric|min:0',
            'capacity_m3' => 'nullable|numeric|min:0',
            'chassis_number' => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'last_hm' => 'nullable|numeric|min:0',
            'last_km' => 'nullable|numeric|min:0',
            'status' => 'required|in:operating,standby,breakdown,maintenance',
            'operation_start_date' => 'nullable|date',
            'site_id' => 'required|exists:sites,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $unit->update($validated);

        ActivityLog::log('update', 'unit', "Memperbarui data unit: {$unit->unit_code}");

        notify()->success('Data Unit Diperbarui!', "Unit {$unit->unit_code} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Delete unit
     */
    public function destroy(Unit $unit)
    {
        $code = $unit->unit_code;
        $unit->delete();

        ActivityLog::log('delete', 'unit', "Menghapus unit: {$code}");

        notify()->success('Unit Dihapus!', "Unit {$code} telah dipindahkan ke arsip soft delete.");
        return redirect()->back();
    }
}
