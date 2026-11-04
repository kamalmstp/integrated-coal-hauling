<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $vendorType = $request->input('vendor_type');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        $query = Vendor::withCount('units');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('vendor_code', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($vendorType) && $vendorType !== 'all') {
            $query->where('vendor_type', $vendorType);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        $vendors = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Vendors/Index', [
            'vendors' => $vendors,
            'filters' => [
                'search' => $search ?? '',
                'vendor_type' => $vendorType ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_code' => 'required|string|max:50|unique:vendors,vendor_code',
            'name' => 'required|string|max:255',
            'vendor_type' => 'required|in:spareparts,tyre,fuel,subcontractor,rental,service',
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'npwp' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $vendor = Vendor::create($validated);
        ActivityLog::log('create', 'vendor', "Mendaftarkan vendor baru: {$vendor->name}");

        notify()->success('Vendor Ditambahkan!', "Vendor {$vendor->name} berhasil ditambahkan.");
        return redirect()->back();
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'vendor_code' => "required|string|max:50|unique:vendors,vendor_code,{$vendor->id}",
            'name' => 'required|string|max:255',
            'vendor_type' => 'required|in:spareparts,tyre,fuel,subcontractor,rental,service',
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'npwp' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $vendor->update($validated);
        ActivityLog::log('update', 'vendor', "Memperbarui vendor: {$vendor->name}");

        notify()->success('Vendor Diperbarui!', "Data vendor {$vendor->name} berhasil diperbarui.");
        return redirect()->back();
    }

    public function destroy(Vendor $vendor)
    {
        if ($vendor->units()->exists()) {
            notify()->error('Gagal Menghapus!', 'Vendor masih memiliki unit armada sewa/kontrak yang terhubung.');
            return redirect()->back();
        }

        $name = $vendor->name;
        $vendor->delete();
        ActivityLog::log('delete', 'vendor', "Menghapus vendor: {$name}");

        notify()->success('Vendor Dihapus!', "Vendor {$name} berhasil dihapus.");
        return redirect()->back();
    }
}
