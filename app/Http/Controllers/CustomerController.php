<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $siteId = $request->input('site_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        $query = Customer::with('site');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('customer_code', 'like', "%{$search}%")
                  ->orWhere('contract_number', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        if (!empty($siteId) && $siteId !== 'all') {
            $query->where('site_id', $siteId);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        $customers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search ?? '',
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
            'site_id' => 'nullable|exists:sites,id',
            'customer_code' => 'required|string|max:50|unique:customers,customer_code',
            'name' => 'required|string|max:255',
            'contract_number' => 'nullable|string|max:100',
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => 'nullable|date',
            'target_tonnage' => 'required|numeric|min:0',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $customer = Customer::create($validated);
        ActivityLog::log('create', 'customer', "Mendaftarkan klien/owner IUP baru: {$customer->name}");

        notify()->success('Klien IUP Berhasil Didaftarkan!', "Klien {$customer->name} berhasil ditambahkan.");
        return redirect()->back();
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'customer_code' => "required|string|max:50|unique:customers,customer_code,{$customer->id}",
            'name' => 'required|string|max:255',
            'contract_number' => 'nullable|string|max:100',
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => 'nullable|date',
            'target_tonnage' => 'required|numeric|min:0',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $customer->update($validated);
        ActivityLog::log('update', 'customer', "Memperbarui klien: {$customer->name}");

        notify()->success('Data Klien Diperbarui!', "Data klien {$customer->name} berhasil disimpan.");
        return redirect()->back();
    }

    public function destroy(Customer $customer)
    {
        $name = $customer->name;
        $customer->delete();
        ActivityLog::log('delete', 'customer', "Menghapus klien: {$name}");

        notify()->success('Klien Dihapus!', "Data klien {$name} berhasil dihapus.");
        return redirect()->back();
    }
}
