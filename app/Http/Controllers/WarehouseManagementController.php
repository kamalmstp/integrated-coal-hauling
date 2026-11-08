<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\Site;
use App\Models\StockTransfer;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WarehouseManagementController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('status');
        $search = $request->input('search');

        $warehouses = Warehouse::with([
            'site:id,name,code',
            'storeman:id,name,employee_code',
            'locations',
            'balances.item:id,item_code,item_name,unit_of_measurement',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('location_address', 'like', "%{$search}%");
            })
            ->orderBy('site_id')
            ->orderBy('code')
            ->get()
            ->map(function (Warehouse $wh) {
                $wh->total_sku = $wh->balances->where('on_hand_qty', '>', 0)->count();
                $wh->total_qty = round((float) $wh->balances->sum('on_hand_qty'), 2);
                $wh->total_valuation = round((float) $wh->balances->sum('total_value'), 2);
                return $wh;
            });

        $transfers = StockTransfer::with([
            'fromSite:id,name,code',
            'fromWarehouse:id,name,code',
            'toSite:id,name,code',
            'toWarehouse:id,name,code',
            'requester:id,name',
            'approver:id,name',
            'dispatcher:id,name',
            'receiver:id,name',
            'items.item:id,item_code,item_name,unit_of_measurement',
        ])
            ->when($siteId, fn ($q) => $q->where(fn ($sq) => $sq->where('from_site_id', $siteId)->orWhere('to_site_id', $siteId)))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Warehouse/Warehouses/Index', [
            'warehouses' => $warehouses,
            'transfers' => $transfers,
            'filters' => [
                'site_id' => $siteId,
                'status' => $status,
                'search' => $search,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code', 'site_id')->get(),
                'items' => InventoryItem::where('is_active', true)->select('id', 'item_code', 'item_name', 'unit_of_measurement', 'standard_cost')->orderBy('item_code')->get(),
            ],
        ]);
    }

    public function storeWarehouse(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'code' => 'required|string|max:40|unique:warehouses,code',
            'name' => 'required|string|max:150',
            'warehouse_type' => 'required|string|max:40',
            'location_address' => 'nullable|string|max:255',
            'storeman_id' => 'nullable|exists:employees,id',
            'capacity' => 'nullable|string|max:100',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        $validated['code'] = strtoupper($validated['code']);
        $validated['is_active'] = $validated['status'] === 'active';

        $wh = Warehouse::create($validated);

        return redirect()->back()->with('success', "Gudang {$wh->code} ({$wh->name}) berhasil dibuat.");
    }

    public function updateWarehouse(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'code' => 'required|string|max:40|unique:warehouses,code,' . $warehouse->id,
            'name' => 'required|string|max:150',
            'warehouse_type' => 'required|string|max:40',
            'location_address' => 'nullable|string|max:255',
            'storeman_id' => 'nullable|exists:employees,id',
            'capacity' => 'nullable|string|max:100',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        $validated['code'] = strtoupper($validated['code']);
        $validated['is_active'] = $validated['status'] === 'active';

        $warehouse->update($validated);

        return redirect()->back()->with('success', "Data Gudang {$warehouse->code} berhasil diperbarui.");
    }

    public function storeLocation(Request $request)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'location_code' => 'required|string|max:60',
            'zone_name' => 'nullable|string|max:100',
            'rack_number' => 'nullable|string|max:40',
            'shelf_level' => 'nullable|string|max:40',
            'bin_code' => 'nullable|string|max:40',
            'capacity' => 'nullable|string|max:60',
        ]);

        $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
        $validated['site_id'] = $warehouse->site_id;
        $validated['location_code'] = strtoupper($validated['location_code']);
        $validated['is_active'] = true;

        $loc = WarehouseLocation::updateOrCreate(
            ['warehouse_id' => $warehouse->id, 'location_code' => $validated['location_code']],
            $validated
        );

        return redirect()->back()->with('success', "Lokasi Rack/Bin {$loc->location_code} berhasil ditambahkan ke {$warehouse->name}.");
    }

    public function storeTransfer(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'transfer_date' => 'required|date',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'requester_id' => 'nullable|exists:employees,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.qty_requested' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($validated, $inventoryService) {
            $fromWh = Warehouse::findOrFail($validated['from_warehouse_id']);
            $toWh = Warehouse::findOrFail($validated['to_warehouse_id']);

            $transfer = StockTransfer::create([
                'transfer_number' => $inventoryService->generateDocumentNumber('TRF-TAP'),
                'transfer_date' => $validated['transfer_date'],
                'from_site_id' => $fromWh->site_id,
                'from_warehouse_id' => $fromWh->id,
                'to_site_id' => $toWh->site_id,
                'to_warehouse_id' => $toWh->id,
                'requester_id' => $validated['requester_id'] ?? $toWh->storeman_id,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'status' => 'approved',
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $line) {
                $item = InventoryItem::findOrFail($line['inventory_item_id']);
                $transfer->items()->create([
                    'inventory_item_id' => $item->id,
                    'qty_requested' => $line['qty_requested'],
                    'qty_dispatched' => $line['qty_requested'],
                    'unit' => $item->unit_of_measurement,
                ]);
            }

            return redirect()->back()->with('success', "Dokumen Transfer Antar Gudang {$transfer->transfer_number} berhasil dibuat dan siap dikirim (Dispatch).");
        });
    }

    public function dispatchTransfer(Request $request, StockTransfer $stockTransfer, InventoryService $inventoryService)
    {
        $inventoryService->dispatchTransfer($stockTransfer, $request->input('dispatched_by'));

        return redirect()->back()->with('success', "Barang pada dokumen {$stockTransfer->transfer_number} telah dikirim (Transfer Out) dan berstatus In Transit.");
    }

    public function receiveTransfer(Request $request, StockTransfer $stockTransfer, InventoryService $inventoryService)
    {
        $inventoryService->receiveTransfer($stockTransfer, $request->input('received_by'));

        return redirect()->back()->with('success', "Barang pada dokumen {$stockTransfer->transfer_number} telah diterima (Transfer In) di gudang tujuan.");
    }
}
