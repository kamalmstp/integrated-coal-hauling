<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryBalance;
use App\Models\InventoryItem;
use App\Models\Site;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $warehouseId = $request->input('warehouse_id');
        $status = $request->input('status');

        $opnames = StockOpname::with([
            'site:id,name,code',
            'warehouse:id,name,code',
            'storeman:id,name,employee_code',
            'auditor:id,name,employee_code',
            'approver:id,name',
            'items.item:id,item_code,part_number,item_name,unit_of_measurement',
            'items.location:id,location_code',
            'adjustments',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('id')
            ->get();

        $adjustments = StockAdjustment::with([
            'site:id,name,code',
            'warehouse:id,name,code',
            'opname:id,opname_number',
            'requester:id,name,employee_code',
            'approver:id,name',
            'items.item:id,item_code,item_name,unit_of_measurement',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Warehouse/Opname/Index', [
            'opnames' => $opnames,
            'adjustments' => $adjustments,
            'filters' => [
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'status' => $status,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name', 'storeman_id')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code', 'site_id')->get(),
                'items' => InventoryItem::where('is_active', true)->select('id', 'item_code', 'item_name', 'unit_of_measurement', 'standard_cost')->orderBy('item_code')->get(),
            ],
        ]);
    }

    /**
     * Schedule and initialize a Stock Opname sheet from current system balances.
     * Does NOT alter any inventory balance!
     */
    public function storeOpname(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'scheduled_date' => 'required|date',
            'storeman_id' => 'nullable|exists:employees,id',
            'auditor_id' => 'nullable|exists:employees,id',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $inventoryService) {
            $warehouse = Warehouse::findOrFail($validated['warehouse_id']);

            $opname = StockOpname::create([
                'opname_number' => $inventoryService->generateDocumentNumber('OPN'),
                'site_id' => $warehouse->site_id,
                'warehouse_id' => $warehouse->id,
                'scheduled_date' => $validated['scheduled_date'],
                'status' => 'counting',
                'storeman_id' => $validated['storeman_id'] ?? $warehouse->storeman_id,
                'auditor_id' => $validated['auditor_id'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $balances = InventoryBalance::where('warehouse_id', $warehouse->id)->get();
            foreach ($balances as $bal) {
                $opname->items()->create([
                    'inventory_item_id' => $bal->inventory_item_id,
                    'warehouse_location_id' => $bal->warehouse_location_id,
                    'system_qty' => $bal->on_hand_qty,
                    'physical_qty' => $bal->on_hand_qty,
                    'variance_qty' => 0,
                    'unit_cost' => $bal->average_unit_cost,
                    'variance_value' => 0,
                    'status' => 'pending',
                ]);
            }

            return redirect()->back()->with('success', "Jadwal Stock Opname {$opname->opname_number} berhasil dibuat dengan {$balances->count()} item. Silakan input hasil perhitungan fisik.");
        });
    }

    /**
     * Record physical count & investigation notes on a Stock Opname.
     * Strict Rule: Does NOT change system stock directly when physical count differs!
     */
    public function submitCounts(Request $request, StockOpname $stockOpname)
    {
        $validated = $request->validate([
            'investigation_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:stock_opname_items,id',
            'items.*.physical_qty' => 'required|numeric|min:0',
            'items.*.investigation_reason' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $stockOpname) {
            $hasDiscrepancy = false;

            foreach ($validated['items'] as $line) {
                $opItem = StockOpnameItem::where('stock_opname_id', $stockOpname->id)
                    ->where('id', $line['id'])
                    ->firstOrFail();

                $phys = round((float) $line['physical_qty'], 2);
                $sys = (float) $opItem->system_qty;
                $variance = round($phys - $sys, 2);
                $varValue = round($variance * (float) $opItem->unit_cost, 2);

                if (abs($variance) > 0.001) {
                    $hasDiscrepancy = true;
                }

                $opItem->update([
                    'physical_qty' => $phys,
                    'variance_qty' => $variance,
                    'variance_value' => $varValue,
                    'status' => abs($variance) > 0.001 ? 'discrepancy' : 'matched',
                    'investigation_reason' => $line['investigation_reason'] ?? $opItem->investigation_reason,
                ]);
            }

            $stockOpname->update([
                'conducted_date' => now()->toDateString(),
                'status' => $hasDiscrepancy ? 'under_investigation' : 'completed',
                'investigation_notes' => $validated['investigation_notes'] ?? $stockOpname->investigation_notes,
            ]);

            $msg = $hasDiscrepancy
                ? "Hasil hitung fisik {$stockOpname->opname_number} disimpan. Ditemukan selisih (Variance) — stok sistem TIDAK diubah langsung, silakan ajukan dokumen Stock Adjustment untuk proses investigasi & approval."
                : "Hasil hitung fisik {$stockOpname->opname_number} sesuai 100% dengan stok sistem.";

            return redirect()->back()->with('success', $msg);
        });
    }

    /**
     * Create a formal Stock Adjustment document (either from a Stock Opname with discrepancies or standalone).
     * Still does NOT change system stock until `approveAdjustment` is called.
     */
    public function storeAdjustment(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'stock_opname_id' => 'nullable|exists:stock_opnames,id',
            'warehouse_id' => 'required_without:stock_opname_id|nullable|exists:warehouses,id',
            'reason_category' => 'required|string|max:50',
            'requested_by' => 'nullable|exists:employees,id',
            'remarks' => 'nullable|string',
            'items' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $inventoryService) {
            if (!empty($validated['stock_opname_id'])) {
                $opname = StockOpname::with('items.item')->findOrFail($validated['stock_opname_id']);
                $discrepancyItems = $opname->items->filter(fn ($i) => abs((float) $i->variance_qty) > 0.001);

                $adj = StockAdjustment::create([
                    'adjustment_number' => $inventoryService->generateDocumentNumber('ADJ'),
                    'site_id' => $opname->site_id,
                    'warehouse_id' => $opname->warehouse_id,
                    'stock_opname_id' => $opname->id,
                    'adjustment_date' => now()->toDateString(),
                    'reason_category' => $validated['reason_category'] ?? 'opname_variance',
                    'status' => 'pending_approval',
                    'requested_by' => $validated['requested_by'] ?? $opname->storeman_id,
                    'remarks' => $validated['remarks'] ?? "Penyesuaian dari Stock Opname {$opname->opname_number}",
                    'created_by' => auth()->id(),
                ]);

                foreach ($discrepancyItems as $dItem) {
                    $var = (float) $dItem->variance_qty;
                    $adjQty = abs($var);
                    $adj->items()->create([
                        'inventory_item_id' => $dItem->inventory_item_id,
                        'direction' => $var > 0 ? 'IN' : 'OUT',
                        'system_qty' => $dItem->system_qty,
                        'physical_qty' => $dItem->physical_qty,
                        'adjustment_qty' => $adjQty,
                        'unit_cost' => $dItem->unit_cost,
                        'total_value_impact' => round($adjQty * (float) $dItem->unit_cost, 2),
                        'notes' => $dItem->investigation_reason ?? "Selisih Opname {$opname->opname_number}",
                    ]);
                }

                return redirect()->back()->with('success', "Dokumen Stock Adjustment {$adj->adjustment_number} berhasil diajukan dan menunggu Approval.");
            }

            $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
            $adj = StockAdjustment::create([
                'adjustment_number' => $inventoryService->generateDocumentNumber('ADJ'),
                'site_id' => $warehouse->site_id,
                'warehouse_id' => $warehouse->id,
                'adjustment_date' => now()->toDateString(),
                'reason_category' => $validated['reason_category'],
                'status' => 'pending_approval',
                'requested_by' => $validated['requested_by'] ?? $warehouse->storeman_id,
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] ?? [] as $line) {
                $item = InventoryItem::findOrFail($line['inventory_item_id']);
                $bal = InventoryBalance::where('warehouse_id', $warehouse->id)->where('inventory_item_id', $item->id)->first();
                $sysQty = $bal ? (float) $bal->on_hand_qty : 0.0;
                $unitCost = $bal && (float) $bal->average_unit_cost > 0 ? (float) $bal->average_unit_cost : (float) $item->standard_cost;
                $adjQty = abs((float) $line['adjustment_qty']);
                $dir = strtoupper($line['direction'] ?? 'OUT');

                $adj->items()->create([
                    'inventory_item_id' => $item->id,
                    'direction' => $dir,
                    'system_qty' => $sysQty,
                    'physical_qty' => $dir === 'IN' ? $sysQty + $adjQty : max(0, $sysQty - $adjQty),
                    'adjustment_qty' => $adjQty,
                    'unit_cost' => $unitCost,
                    'total_value_impact' => round($adjQty * $unitCost, 2),
                    'notes' => $line['notes'] ?? null,
                ]);
            }

            return redirect()->back()->with('success', "Dokumen Stock Adjustment {$adj->adjustment_number} berhasil diajukan dan menunggu Approval.");
        });
    }

    public function approveAdjustment(Request $request, StockAdjustment $stockAdjustment, InventoryService $inventoryService)
    {
        $inventoryService->approveAdjustment($stockAdjustment, auth()->id());

        return redirect()->back()->with('success', "Stock Adjustment {$stockAdjustment->adjustment_number} telah DISETUJUI. Saldo stok gudang dan Stock Card berhasil disesuaikan secara resmi.");
    }
}
