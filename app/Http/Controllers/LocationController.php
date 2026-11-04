<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Location;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $locationType = $request->input('location_type');
        $siteId = $request->input('site_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        $query = Location::with('site');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('km_marker', 'like', "%{$search}%");
            });
        }

        if (!empty($locationType) && $locationType !== 'all') {
            $query->where('location_type', $locationType);
        }

        if (!empty($siteId) && $siteId !== 'all') {
            $query->where('site_id', $siteId);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        $locations = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
            'filters' => [
                'search' => $search ?? '',
                'location_type' => $locationType ?? 'all',
                'site_id' => $siteId ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'code' => 'required|string|max:50|unique:locations,code',
            'name' => 'required|string|max:255',
            'location_type' => 'required|in:pit,front_loading,hauling_road,stockpile,jetty,disposal,workshop,warehouse,fuel_station',
            'km_marker' => 'nullable|string|max:30',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $loc = Location::create($validated);
        ActivityLog::log('create', 'location', "Menambahkan lokasi: {$loc->name} ({$loc->code})");

        notify()->success('Lokasi Berhasil Ditambahkan!', "Lokasi {$loc->name} telah didaftarkan.");
        return redirect()->back();
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'code' => "required|string|max:50|unique:locations,code,{$location->id}",
            'name' => 'required|string|max:255',
            'location_type' => 'required|in:pit,front_loading,hauling_road,stockpile,jetty,disposal,workshop,warehouse,fuel_station',
            'km_marker' => 'nullable|string|max:30',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $location->update($validated);
        ActivityLog::log('update', 'location', "Memperbarui lokasi: {$location->name}");

        notify()->success('Lokasi Diperbarui!', "Data lokasi {$location->name} berhasil disimpan.");
        return redirect()->back();
    }

    public function destroy(Location $location)
    {
        $name = $location->name;
        $location->delete();
        ActivityLog::log('delete', 'location', "Menghapus lokasi: {$name}");

        notify()->success('Lokasi Dihapus!', "Lokasi {$name} berhasil dihapus.");
        return redirect()->back();
    }
}
