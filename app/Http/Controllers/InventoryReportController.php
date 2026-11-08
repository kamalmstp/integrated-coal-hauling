<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryBalance;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransactionItem;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\StockOpnameItem;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryReportController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $warehouseId = $request->input('warehouse_id');
        $categoryCode = $request->input('category_code');

        // 1. Stock Balance & 4. Stock Valuation Report (Moving Weighted Average)
        $balances = InventoryBalance::with([
            'item.category:id,code,name',
            'warehouse:id,code,name,site_id',
            'site:id,code,name',
            'location:id,location_code,zone_name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->when($categoryCode, fn ($q) => $q->whereHas('item', fn ($iq) => $iq->where('category_code', $categoryCode)))
            ->orderBy('warehouse_id')
            ->get()
            ->map(function (InventoryBalance $b) {
                $b->stock_status = $b->item
                    ? InventoryService::classifyStockStatus($b->item, (float) $b->on_hand_qty)
                    : 'normal';
                $daysSinceMove = $b->last_movement_date ? (int) abs(now()->diffInDays($b->last_movement_date)) : 120;
                $b->days_without_movement = $daysSinceMove;
                $b->movement_classification = $daysSinceMove >= 90
                    ? 'non_moving'
                    : ($daysSinceMove >= 30 ? 'slow_moving' : 'fast_moving');
                return $b;
            });

        // 2 & 3. Stock Card & Stock Movement Report
        $stockMovements = InventoryTransactionItem::with([
            'transaction:id,document_number,transaction_date,transaction_datetime,direction,transaction_type,reference_document,unit_id,work_order_id',
            'transaction.unit:id,unit_code',
            'transaction.workOrder:id,wo_number',
            'item:id,item_code,part_number,item_name,category_code',
            'warehouse:id,code,name',
            'site:id,code,name',
            'creator:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->when($categoryCode, fn ($q) => $q->whereHas('item', fn ($iq) => $iq->where('category_code', $categoryCode)))
            ->orderByDesc('transaction_datetime')
            ->limit(100)
            ->get();

        // 5. Sparepart Usage per Unit
        $usagePerUnit = InventoryTransactionItem::with([
            'transaction.unit:id,unit_code,brand,model',
            'transaction.workOrder:id,wo_number',
            'item:id,item_code,item_name,category_code',
            'site:id,code,name',
        ])
            ->where('direction', 'OUT')
            ->whereHas('transaction', fn ($q) => $q->whereNotNull('unit_id'))
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->get()
            ->groupBy(fn ($ti) => $ti->transaction?->unit?->unit_code ?? 'UNKNOWN')
            ->map(function ($group, $unitCode) {
                $firstUnit = $group->first()?->transaction?->unit;
                return [
                    'unit_code' => $unitCode,
                    'brand_model' => $firstUnit ? "{$firstUnit->brand} {$firstUnit->model}" : '-',
                    'transaction_count' => $group->count(),
                    'total_qty_used' => round((float) $group->sum('qty_out'), 2),
                    'total_cost' => round((float) $group->sum('total_cost'), 2),
                    'items' => $group->map(fn ($g) => [
                        'date' => $g->transaction_datetime?->format('Y-m-d'),
                        'document_number' => $g->transaction?->document_number,
                        'wo_number' => $g->transaction?->workOrder?->wo_number ?? '-',
                        'item_code' => $g->item?->item_code,
                        'item_name' => $g->item?->item_name,
                        'qty' => (float) $g->qty_out,
                        'unit' => $g->unit,
                        'unit_cost' => (float) $g->moving_average_cost,
                        'total_cost' => (float) $g->total_cost,
                    ])->values(),
                ];
            })->values();

        // 6. Sparepart Usage per Work Order
        $usagePerWorkOrder = InventoryTransactionItem::with([
            'transaction.workOrder:id,wo_number,job_type,status,actual_cost',
            'transaction.unit:id,unit_code',
            'item:id,item_code,item_name',
            'warehouse:id,code,name',
        ])
            ->where('direction', 'OUT')
            ->whereHas('transaction', fn ($q) => $q->whereNotNull('work_order_id'))
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->get()
            ->groupBy(fn ($ti) => $ti->transaction?->workOrder?->wo_number ?? 'NO-WO')
            ->map(function ($group, $woNumber) {
                $wo = $group->first()?->transaction?->workOrder;
                $unit = $group->first()?->transaction?->unit;
                return [
                    'wo_number' => $woNumber,
                    'unit_code' => $unit?->unit_code ?? '-',
                    'job_type' => $wo?->job_type ?? '-',
                    'wo_status' => $wo?->status ?? '-',
                    'total_parts_qty' => round((float) $group->sum('qty_out'), 2),
                    'total_parts_cost' => round((float) $group->sum('total_cost'), 2),
                    'items' => $group->map(fn ($g) => [
                        'document_number' => $g->transaction?->document_number,
                        'item_code' => $g->item?->item_code,
                        'item_name' => $g->item?->item_name,
                        'qty_out' => (float) $g->qty_out,
                        'unit' => $g->unit,
                        'mwa_unit_cost' => (float) $g->moving_average_cost,
                        'total_cost' => (float) $g->total_cost,
                    ])->values(),
                ];
            })->values();

        // 7. Slow Moving Items (30 - 89 days without movement)
        $slowMoving = $balances->filter(fn ($b) => $b->movement_classification === 'slow_moving' && (float) $b->on_hand_qty > 0)->values();

        // 8. Non-Moving / Deadstock Items (>= 90 days without movement)
        $nonMoving = $balances->filter(fn ($b) => $b->movement_classification === 'non_moving' && (float) $b->on_hand_qty > 0)->values();

        // 9. Stock Opname Variance Report
        $opnameVariances = StockOpnameItem::with([
            'opname:id,opname_number,scheduled_date,conducted_date,status,site_id,warehouse_id',
            'opname.warehouse:id,code,name',
            'opname.site:id,code,name',
            'item:id,item_code,part_number,item_name,unit_of_measurement',
            'location:id,location_code',
        ])
            ->when($siteId, fn ($q) => $q->whereHas('opname', fn ($oq) => $oq->where('site_id', $siteId)))
            ->when($warehouseId, fn ($q) => $q->whereHas('opname', fn ($oq) => $oq->where('warehouse_id', $warehouseId)))
            ->orderByDesc('id')
            ->get();

        // 10. Procurement Integration: Purchase Request (PR) Proposals
        $purchaseRequests = PurchaseRequest::with([
            'site:id,name,code',
            'warehouse:id,name,code',
            'requester:id,name,employee_code',
            'items.item:id,item_code,part_number,item_name,unit_of_measurement',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Warehouse/Reports/Index', [
            'reports' => [
                'stockBalances' => $balances,
                'stockMovements' => $stockMovements,
                'usagePerUnit' => $usagePerUnit,
                'usagePerWorkOrder' => $usagePerWorkOrder,
                'slowMoving' => $slowMoving,
                'nonMoving' => $nonMoving,
                'opnameVariances' => $opnameVariances,
                'purchaseRequests' => $purchaseRequests,
            ],
            'summary' => [
                'total_balance_rows' => $balances->count(),
                'total_valuation' => round((float) $balances->sum('total_value'), 2),
                'slow_moving_count' => $slowMoving->count(),
                'slow_moving_value' => round((float) $slowMoving->sum('total_value'), 2),
                'non_moving_count' => $nonMoving->count(),
                'non_moving_value' => round((float) $nonMoving->sum('total_value'), 2),
                'variance_items_count' => $opnameVariances->filter(fn ($v) => abs((float) $v->variance_qty) > 0)->count(),
                'pr_proposals_count' => $purchaseRequests->count(),
            ],
            'filters' => [
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'category_code' => $categoryCode,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name')->get(),
                'categories' => InventoryCategory::where('is_active', true)->select('id', 'code', 'name')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get(),
            ],
        ]);
    }

    /**
     * Propose a Purchase Request (PR) from Reorder Point items.
     * Strict Rule: Does NOT create an automatic Purchase Order (PO) without approval.
     */
    public function storePurchaseRequestProposal(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'item_ids' => 'nullable|array',
            'item_ids.*' => 'exists:inventory_items,id',
            'requested_by' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
        ]);

        $pr = $inventoryService->createReorderPurchaseRequest(
            (int) $validated['site_id'],
            (int) $validated['warehouse_id'],
            $validated['item_ids'] ?? [],
            $validated['requested_by'] ?? null,
            $validated['notes'] ?? null
        );

        return redirect()->back()->with('success', "Usulan Purchase Request {$pr->pr_number} berhasil dibuat dengan status Submitted (Tidak membuat Purchase Order otomatis sebelum disetujui Procurement).");
    }
}
