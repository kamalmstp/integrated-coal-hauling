<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Site;
use App\Models\Unit;
use App\Models\Vendor;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use App\Models\WorkOrder;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryTransactionController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $warehouseId = $request->input('warehouse_id');
        $direction = $request->input('direction');
        $transactionType = $request->input('transaction_type');
        $search = $request->input('search');

        $query = InventoryTransaction::with([
            'site:id,name,code',
            'warehouse:id,name,code',
            'unit:id,unit_code',
            'workOrder:id,wo_number',
            'vendor:id,name',
            'requester:id,name,employee_code',
            'approver:id,name',
            'storeman:id,name,employee_code',
            'items.item:id,item_code,part_number,item_name,unit_of_measurement',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }
        if ($direction) {
            $query->where('direction', strtoupper($direction));
        }
        if ($transactionType) {
            $query->where('transaction_type', $transactionType);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                  ->orWhere('reference_document', 'like', "%{$search}%")
                  ->orWhere('remarks', 'like', "%{$search}%")
                  ->orWhereHas('items.item', fn ($iq) => $iq->where('item_code', 'like', "%{$search}%")->orWhere('item_name', 'like', "%{$search}%"));
            });
        }

        $transactions = $query->orderByDesc('transaction_datetime')->paginate(15)->withQueryString();

        $allTx = InventoryTransaction::when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->get();

        return Inertia::render('Warehouse/Transactions/Index', [
            'transactions' => $transactions,
            'metrics' => [
                'total_transactions' => $allTx->count(),
                'stock_in_count' => $allTx->where('direction', 'IN')->count(),
                'stock_out_count' => $allTx->where('direction', 'OUT')->count(),
                'total_in_value' => round((float) $allTx->where('direction', 'IN')->sum('total_amount'), 2),
                'total_out_value' => round((float) $allTx->where('direction', 'OUT')->sum('total_amount'), 2),
            ],
            'filters' => [
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'direction' => $direction,
                'transaction_type' => $transactionType,
                'search' => $search,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name', 'storeman_id')->get(),
                'locations' => WarehouseLocation::where('is_active', true)->select('id', 'warehouse_id', 'location_code')->get(),
                'items' => InventoryItem::where('is_active', true)->select('id', 'item_code', 'part_number', 'item_name', 'unit_of_measurement', 'standard_cost')->orderBy('item_code')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code', 'site_id')->get(),
                'units' => Unit::select('id', 'unit_code', 'site_id')->orderBy('unit_code')->get(),
                'workOrders' => WorkOrder::select('id', 'wo_number', 'unit_id', 'site_id')->orderByDesc('id')->limit(50)->get(),
                'vendors' => Vendor::select('id', 'name', 'vendor_code')->get(),
                'stockInTypes' => InventoryService::STOCK_IN_TYPES,
                'stockOutTypes' => InventoryService::STOCK_OUT_TYPES,
            ],
        ]);
    }

    public function storeStockIn(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'document_number' => 'nullable|string|max:60|unique:inventory_transactions,document_number',
            'transaction_date' => 'required|date',
            'transaction_type' => 'required|in:' . implode(',', InventoryService::STOCK_IN_TYPES),
            'site_id' => 'required|exists:sites,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'reference_document' => 'nullable|string|max:100',
            'vendor_id' => 'nullable|exists:vendors,id',
            'work_order_id' => 'nullable|exists:work_orders,id',
            'requester_id' => 'nullable|exists:employees,id',
            'storeman_id' => 'nullable|exists:employees,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.warehouse_location_id' => 'nullable|exists:warehouse_locations,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'nullable|numeric|min:0',
            'items.*.remarks' => 'nullable|string|max:255',
        ]);

        $tx = $inventoryService->stockIn($validated, $validated['items']);

        return redirect()->back()->with('success', "Transaksi Stock In {$tx->document_number} ({$tx->transaction_type}) berhasil disimpan dan saldo stok diperbarui.");
    }

    public function storeStockOut(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'document_number' => 'nullable|string|max:60|unique:inventory_transactions,document_number',
            'transaction_date' => 'required|date',
            'transaction_type' => 'required|in:' . implode(',', InventoryService::STOCK_OUT_TYPES),
            'site_id' => 'required|exists:sites,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'reference_document' => 'nullable|string|max:100',
            'unit_id' => 'nullable|exists:units,id',
            'work_order_id' => 'nullable|exists:work_orders,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'requester_id' => 'nullable|exists:employees,id',
            'storeman_id' => 'nullable|exists:employees,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.warehouse_location_id' => 'nullable|exists:warehouse_locations,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.remarks' => 'nullable|string|max:255',
        ]);

        $tx = $inventoryService->stockOut($validated, $validated['items']);

        return redirect()->back()->with('success', "Transaksi Stock Out {$tx->document_number} ({$tx->transaction_type}) berhasil disimpan dan stok telah dikurangi.");
    }
}
