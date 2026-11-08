<?php

namespace App\Http\Controllers;

use App\Models\InventoryBalance;
use App\Models\InventoryItem;
use App\Models\InventoryTransactionItem;
use App\Models\Site;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockCardController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $warehouseId = $request->input('warehouse_id');
        $itemId = $request->input('inventory_item_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $items = InventoryItem::where('is_active', true)
            ->orderBy('item_code')
            ->select('id', 'item_code', 'part_number', 'item_name', 'unit_of_measurement', 'category_code', 'minimum_stock', 'reorder_point', 'maximum_stock', 'standard_cost')
            ->get();

        if (!$itemId && $items->isNotEmpty()) {
            $itemId = $items->first()->id;
        }

        $selectedItem = $itemId ? InventoryItem::with('category')->find($itemId) : null;

        $ledgerQuery = InventoryTransactionItem::with([
            'transaction:id,document_number,transaction_date,transaction_datetime,direction,transaction_type,reference_document,unit_id,work_order_id,remarks',
            'transaction.unit:id,unit_code',
            'transaction.workOrder:id,wo_number',
            'warehouse:id,code,name,site_id',
            'site:id,code,name',
            'location:id,location_code',
            'creator:id,name',
            'item:id,item_code,item_name,unit_of_measurement',
        ])
            ->when($itemId, fn ($q) => $q->where('inventory_item_id', $itemId))
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->when($dateFrom, fn ($q) => $q->whereDate('transaction_datetime', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('transaction_datetime', '<=', $dateTo))
            ->orderBy('transaction_datetime')
            ->orderBy('id');

        $ledgerEntries = $ledgerQuery->get();

        $balances = InventoryBalance::with(['warehouse:id,code,name', 'site:id,code,name', 'location:id,location_code'])
            ->when($itemId, fn ($q) => $q->where('inventory_item_id', $itemId))
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->get();

        $summary = [
            'opening_balance' => $ledgerEntries->isNotEmpty() ? (float) $ledgerEntries->first()->opening_balance_qty : 0,
            'total_in' => round((float) $ledgerEntries->sum('qty_in'), 2),
            'total_out' => round((float) $ledgerEntries->sum('qty_out'), 2),
            'closing_balance' => round((float) $balances->sum('on_hand_qty'), 2),
            'reserved_qty' => round((float) $balances->sum('reserved_qty'), 2),
            'available_qty' => round((float) $balances->sum('available_qty'), 2),
            'moving_average_cost' => $balances->isNotEmpty()
                ? round((float) $balances->avg('average_unit_cost'), 2)
                : ($selectedItem ? (float) $selectedItem->standard_cost : 0),
            'total_valuation' => round((float) $balances->sum('total_value'), 2),
        ];

        return Inertia::render('Warehouse/StockCard/Index', [
            'selectedItem' => $selectedItem,
            'balances' => $balances,
            'ledgerEntries' => $ledgerEntries,
            'summary' => $summary,
            'filters' => [
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'inventory_item_id' => $itemId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name')->get(),
                'items' => $items,
            ],
        ]);
    }
}
