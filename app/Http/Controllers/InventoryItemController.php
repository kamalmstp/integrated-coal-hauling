<?php

namespace App\Http\Controllers;

use App\Models\InventoryBalance;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Site;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryItemController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $categoryCode = $request->input('category_code');
        $warehouseId = $request->input('warehouse_id');
        $stockStatus = $request->input('stock_status');
        $search = $request->input('search');

        $query = InventoryItem::with([
            'category:id,code,name',
            'defaultWarehouse:id,code,name,site_id',
            'defaultLocation:id,location_code,zone_name',
            'balances' => function ($q) use ($siteId, $warehouseId) {
                if ($siteId) {
                    $q->where('site_id', $siteId);
                }
                if ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId);
                }
                $q->with('warehouse:id,code,name');
            },
        ]);

        if ($categoryCode) {
            $query->where('category_code', $categoryCode);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('item_code', 'like', "%{$search}%")
                  ->orWhere('item_name', 'like', "%{$search}%")
                  ->orWhere('part_number', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('item_code')->paginate(15)->withQueryString();

        // Decorate items with live stock status and MWA valuation
        $items->getCollection()->transform(function (InventoryItem $item) {
            $onHand = (float) $item->balances->sum('on_hand_qty');
            $reserved = (float) $item->balances->sum('reserved_qty');
            $available = (float) $item->balances->sum('available_qty');
            $totalVal = (float) $item->balances->sum('total_value');
            $mwaCost = $onHand > 0 ? round($totalVal / $onHand, 2) : (float) $item->standard_cost;

            $item->total_on_hand = $onHand;
            $item->total_reserved = $reserved;
            $item->total_available = $available;
            $item->moving_average_cost = $mwaCost;
            $item->total_valuation = round($totalVal, 2);
            $item->stock_status = InventoryService::classifyStockStatus($item, $onHand);
            $item->recommended_order_qty = InventoryService::calculateRecommendedOrderQty($item, $onHand);

            return $item;
        });

        if ($stockStatus) {
            $filtered = $items->getCollection()->filter(fn ($i) => $i->stock_status === $stockStatus)->values();
            $items->setCollection($filtered);
        }

        $allItemsCount = InventoryItem::count();
        $activeCount = InventoryItem::where('is_active', true)->count();

        return Inertia::render('Warehouse/Items/Index', [
            'items' => $items,
            'metrics' => [
                'total_items' => $allItemsCount,
                'active_items' => $activeCount,
                'inactive_items' => $allItemsCount - $activeCount,
                'total_categories' => InventoryCategory::where('is_active', true)->count(),
            ],
            'filters' => [
                'site_id' => $siteId,
                'category_code' => $categoryCode,
                'warehouse_id' => $warehouseId,
                'stock_status' => $stockStatus,
                'search' => $search,
            ],
            'master' => [
                'categories' => InventoryCategory::where('is_active', true)->orderBy('id')->get(),
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name')->get(),
                'locations' => WarehouseLocation::where('is_active', true)->select('id', 'warehouse_id', 'location_code', 'zone_name')->get(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code',
            'part_number' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'item_name' => 'required|string|max:180',
            'category_id' => 'required|exists:inventory_categories,id',
            'brand' => 'nullable|string|max:100',
            'specification' => 'nullable|string',
            'unit_of_measurement' => 'required|string|max:30',
            'minimum_stock' => 'required|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'reorder_point' => 'required|numeric|min:0',
            'default_warehouse_id' => 'nullable|exists:warehouses,id',
            'default_location_id' => 'nullable|exists:warehouse_locations,id',
            'standard_cost' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $category = InventoryCategory::findOrFail($validated['category_id']);
        $validated['category_code'] = $category->code;
        $validated['item_code'] = strtoupper($validated['item_code']);
        $validated['unit_of_measurement'] = strtoupper($validated['unit_of_measurement']);
        $validated['standard_cost'] = $validated['standard_cost'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $item = InventoryItem::create($validated);

        return redirect()->back()->with('success', "Master Barang {$item->item_code} ({$item->item_name}) berhasil ditambahkan.");
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code,' . $inventoryItem->id,
            'part_number' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'item_name' => 'required|string|max:180',
            'category_id' => 'required|exists:inventory_categories,id',
            'brand' => 'nullable|string|max:100',
            'specification' => 'nullable|string',
            'unit_of_measurement' => 'required|string|max:30',
            'minimum_stock' => 'required|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'reorder_point' => 'required|numeric|min:0',
            'default_warehouse_id' => 'nullable|exists:warehouses,id',
            'default_location_id' => 'nullable|exists:warehouse_locations,id',
            'standard_cost' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $category = InventoryCategory::findOrFail($validated['category_id']);
        $validated['category_code'] = $category->code;
        $validated['item_code'] = strtoupper($validated['item_code']);
        $validated['unit_of_measurement'] = strtoupper($validated['unit_of_measurement']);

        $inventoryItem->update($validated);

        return redirect()->back()->with('success', "Data barang {$inventoryItem->item_code} berhasil diperbarui.");
    }
}
