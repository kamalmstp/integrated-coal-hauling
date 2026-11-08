<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryBalance;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\StockAdjustment;
use App\Models\StockTransfer;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseDashboardController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $warehouseId = $request->input('warehouse_id');

        $balanceQuery = InventoryBalance::with(['item.category', 'warehouse.site', 'location'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId));

        $balances = $balanceQuery->get();

        // Also include active items that have 0 balance in the selected scope for Out of Stock detection
        $items = InventoryItem::with(['category', 'defaultWarehouse'])
            ->where('is_active', true)
            ->when($siteId, fn ($q) => $q->where(fn ($sq) => $sq->where('site_id', $siteId)->orWhereNull('site_id')))
            ->get();

        $balanceByItem = $balances->groupBy('inventory_item_id');

        $stockAlerts = [];
        $counts = [
            'normal' => 0,
            'low_stock' => 0,
            'critical_stock' => 0,
            'out_of_stock' => 0,
            'excess_stock' => 0,
        ];

        foreach ($items as $item) {
            $itemBalances = $balanceByItem->get($item->id, collect());
            $totalOnHand = (float) $itemBalances->sum('on_hand_qty');
            $totalAvailable = (float) $itemBalances->sum('available_qty');
            $avgCost = $itemBalances->isNotEmpty()
                ? (float) $itemBalances->avg('average_unit_cost')
                : (float) $item->standard_cost;

            $status = InventoryService::classifyStockStatus($item, $totalOnHand);
            $counts[$status] = ($counts[$status] ?? 0) + 1;

            if ($status !== 'normal') {
                $recommendedQty = InventoryService::calculateRecommendedOrderQty($item, $totalOnHand);
                $stockAlerts[] = [
                    'item_id' => $item->id,
                    'item_code' => $item->item_code,
                    'part_number' => $item->part_number,
                    'item_name' => $item->item_name,
                    'category' => $item->category?->name ?? $item->category_code,
                    'unit' => $item->unit_of_measurement,
                    'on_hand_qty' => $totalOnHand,
                    'available_qty' => $totalAvailable,
                    'minimum_stock' => (float) $item->minimum_stock,
                    'reorder_point' => (float) $item->reorder_point,
                    'maximum_stock' => $item->maximum_stock !== null ? (float) $item->maximum_stock : null,
                    'status' => $status,
                    'recommended_order_qty' => $recommendedQty,
                    'estimated_unit_cost' => round($avgCost, 2),
                    'estimated_order_value' => round($recommendedQty * $avgCost, 2),
                    'default_warehouse_id' => $item->default_warehouse_id,
                    'default_warehouse_name' => $item->defaultWarehouse?->name ?? '-',
                ];
            }
        }

        $totalValuation = (float) $balances->sum('total_value');
        $totalOnHandUnits = (float) $balances->sum('on_hand_qty');
        $totalReservedUnits = (float) $balances->sum('reserved_qty');

        // Valuation by Category
        $valuationByCategory = InventoryCategory::where('is_active', true)->get()->map(function ($cat) use ($balances) {
            $catBalances = $balances->filter(fn ($b) => $b->item && (int) $b->item->category_id === (int) $cat->id);
            return [
                'code' => $cat->code,
                'name' => $cat->name,
                'sku_count' => $catBalances->pluck('inventory_item_id')->unique()->count(),
                'total_qty' => round((float) $catBalances->sum('on_hand_qty'), 2),
                'total_value' => round((float) $catBalances->sum('total_value'), 2),
            ];
        })->values();

        // Recent Transactions
        $recentTransactions = InventoryTransaction::with(['warehouse:id,name,code', 'site:id,name,code', 'items.item:id,item_code,item_name', 'creator:id,name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->orderByDesc('transaction_datetime')
            ->limit(10)
            ->get();

        // Pending Work Order Sparepart Requests
        $pendingRequestsCount = SparepartRequest::when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->whereIn('status', ['submitted', 'approved', 'picking', 'partially_issued'])
            ->count();

        $pendingTransfersCount = StockTransfer::whereIn('status', ['draft', 'approved', 'in_transit'])->count();
        $pendingAdjustmentsCount = StockAdjustment::when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->where('status', 'pending_approval')
            ->count();

        $purchaseRequests = PurchaseRequest::with(['warehouse:id,name,code', 'site:id,name,code', 'items.item:id,item_code,item_name'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        return Inertia::render('Warehouse/Dashboard/Index', [
            'metrics' => [
                'total_sku' => $items->count(),
                'active_warehouses' => Warehouse::where('status', 'active')->when($siteId, fn ($q) => $q->where('site_id', $siteId))->count(),
                'total_valuation' => round($totalValuation, 2),
                'total_on_hand_qty' => round($totalOnHandUnits, 2),
                'total_reserved_qty' => round($totalReservedUnits, 2),
                'out_of_stock_count' => $counts['out_of_stock'],
                'critical_stock_count' => $counts['critical_stock'],
                'low_stock_count' => $counts['low_stock'],
                'excess_stock_count' => $counts['excess_stock'],
                'normal_stock_count' => $counts['normal'],
                'pending_wo_requests' => $pendingRequestsCount,
                'pending_transfers' => $pendingTransfersCount,
                'pending_adjustments' => $pendingAdjustmentsCount,
            ],
            'stockAlerts' => $stockAlerts,
            'valuationByCategory' => $valuationByCategory,
            'recentTransactions' => $recentTransactions,
            'purchaseRequests' => $purchaseRequests,
            'filters' => [
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'name', 'code', 'warehouse_type')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get(),
            ],
        ]);
    }
}
