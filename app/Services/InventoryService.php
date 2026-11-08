<?php

namespace App\Services;

use App\Models\InventoryBalance;
use App\Models\InventoryItem;
use App\Models\InventoryReservation;
use App\Models\InventoryTransaction;
use App\Models\InventoryTransactionItem;
use App\Models\MaintenanceCost;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestItem;
use App\Models\SparepartRequest;
use App\Models\SparepartRequestItem;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockTransfer;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public const STOCK_IN_TYPES = [
        'goods_receipt',
        'opening_balance',
        'purchase_receiving',
        'return_from_maintenance',
        'transfer_in',
        'adjustment_in',
    ];

    public const STOCK_OUT_TYPES = [
        'maintenance_issue',
        'operational_issue',
        'general_issue',
        'transfer_out',
        'return_to_vendor',
        'adjustment_out',
    ];

    /**
     * Generate a unique document number with prefix.
     */
    public function generateDocumentNumber(string $prefix): string
    {
        $datePart = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$datePart}-{$random}";
    }

    /**
     * Classify stock status based on item thresholds and current on-hand quantity.
     */
    public static function classifyStockStatus(InventoryItem $item, float $onHandQty): string
    {
        $min = (float) $item->minimum_stock;
        $reorder = (float) $item->reorder_point;
        $max = $item->maximum_stock !== null ? (float) $item->maximum_stock : null;

        if ($onHandQty <= 0) {
            return 'out_of_stock';
        }
        if ($onHandQty <= $min) {
            return 'critical_stock';
        }
        if ($onHandQty <= $reorder) {
            return 'low_stock';
        }
        if ($max !== null && $max > 0 && $onHandQty > $max) {
            return 'excess_stock';
        }

        return 'normal';
    }

    /**
     * Calculate recommended purchase order quantity when stock is at or below reorder point.
     */
    public static function calculateRecommendedOrderQty(InventoryItem $item, float $onHandQty, float $backorderQty = 0): float
    {
        $min = (float) $item->minimum_stock;
        $reorder = (float) $item->reorder_point;
        $max = $item->maximum_stock !== null && (float) $item->maximum_stock > 0
            ? (float) $item->maximum_stock
            : max($reorder * 2, $min * 2, 10);

        $deficitToMax = max(0, $max - $onHandQty);
        $recommended = $deficitToMax + $backorderQty;

        return max(1, round($recommended, 2));
    }

    /**
     * Record a Stock In transaction with Moving Weighted Average (MWA) valuation and row-level locking.
     */
    public function stockIn(array $header, array $lines): InventoryTransaction
    {
        return DB::transaction(function () use ($header, $lines) {
            $warehouse = Warehouse::findOrFail($header['warehouse_id']);
            $siteId = (int) ($header['site_id'] ?? $warehouse->site_id);

            if ((int) $warehouse->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Site isolation violation: Gudang tidak sesuai dengan site transaksi.',
                ]);
            }

            $txType = $header['transaction_type'] ?? 'goods_receipt';
            if (!in_array($txType, self::STOCK_IN_TYPES, true)) {
                throw ValidationException::withMessages([
                    'transaction_type' => "Tipe transaksi Stock In tidak valid: {$txType}",
                ]);
            }

            $txDateTime = isset($header['transaction_datetime'])
                ? Carbon::parse($header['transaction_datetime'])
                : (isset($header['transaction_date']) ? Carbon::parse($header['transaction_date'])->setTimeFrom(now()) : now());

            $docNumber = $header['document_number'] ?? $this->generateDocumentNumber('GRN');

            $transaction = InventoryTransaction::create([
                'document_number' => $docNumber,
                'transaction_date' => $txDateTime->toDateString(),
                'transaction_datetime' => $txDateTime,
                'direction' => 'IN',
                'transaction_type' => $txType,
                'site_id' => $siteId,
                'warehouse_id' => $warehouse->id,
                'reference_type' => $header['reference_type'] ?? 'manual',
                'reference_id' => $header['reference_id'] ?? null,
                'reference_document' => $header['reference_document'] ?? $docNumber,
                'unit_id' => $header['unit_id'] ?? null,
                'work_order_id' => $header['work_order_id'] ?? null,
                'sparepart_request_id' => $header['sparepart_request_id'] ?? null,
                'vendor_id' => $header['vendor_id'] ?? null,
                'requester_id' => $header['requester_id'] ?? null,
                'approver_id' => $header['approver_id'] ?? null,
                'storeman_id' => $header['storeman_id'] ?? $warehouse->storeman_id,
                'status' => 'confirmed',
                'total_amount' => 0,
                'remarks' => $header['remarks'] ?? null,
                'attachment_path' => $header['attachment_path'] ?? null,
                'created_by' => $header['created_by'] ?? auth()->id(),
            ]);

            $grandTotal = 0;

            foreach ($lines as $line) {
                $item = InventoryItem::findOrFail($line['inventory_item_id']);
                $qtyIn = round((float) ($line['quantity'] ?? $line['qty_in'] ?? 0), 2);

                if ($qtyIn <= 0) {
                    throw ValidationException::withMessages([
                        'quantity' => "Kuantitas Stock In harus lebih besar dari 0 untuk item {$item->item_code}.",
                    ]);
                }

                // Lock or create InventoryBalance row
                $balance = InventoryBalance::where('warehouse_id', $warehouse->id)
                    ->where('inventory_item_id', $item->id)
                    ->lockForUpdate()
                    ->first();

                if (!$balance) {
                    $balance = InventoryBalance::create([
                        'site_id' => $siteId,
                        'warehouse_id' => $warehouse->id,
                        'warehouse_location_id' => $line['warehouse_location_id'] ?? $item->default_location_id,
                        'inventory_item_id' => $item->id,
                        'on_hand_qty' => 0,
                        'reserved_qty' => 0,
                        'available_qty' => 0,
                        'average_unit_cost' => (float) $item->standard_cost,
                        'total_value' => 0,
                    ]);
                    $balance = InventoryBalance::where('id', $balance->id)->lockForUpdate()->first();
                }

                $oldQty = (float) $balance->on_hand_qty;
                $oldAvgCost = (float) $balance->average_unit_cost;

                $unitCost = isset($line['unit_cost']) && (float) $line['unit_cost'] > 0
                    ? round((float) $line['unit_cost'], 2)
                    : ($oldAvgCost > 0 ? $oldAvgCost : round((float) $item->standard_cost, 2));

                // Moving Weighted Average (MWA) Calculation
                $newOnHand = round($oldQty + $qtyIn, 2);
                if ($newOnHand > 0) {
                    $newAvgCost = round((($oldQty * $oldAvgCost) + ($qtyIn * $unitCost)) / $newOnHand, 2);
                } else {
                    $newAvgCost = $unitCost;
                }

                $newAvailable = round($newOnHand - (float) $balance->reserved_qty, 2);
                $lineTotalCost = round($qtyIn * $unitCost, 2);
                $newTotalValue = round($newOnHand * $newAvgCost, 2);

                $balance->update([
                    'warehouse_location_id' => $line['warehouse_location_id'] ?? $balance->warehouse_location_id ?? $item->default_location_id,
                    'on_hand_qty' => $newOnHand,
                    'available_qty' => $newAvailable,
                    'average_unit_cost' => $newAvgCost,
                    'total_value' => $newTotalValue,
                    'last_in_date' => $txDateTime,
                    'last_movement_date' => $txDateTime,
                ]);

                // Update item standard_cost if it was 0
                if ((float) $item->standard_cost <= 0 && $newAvgCost > 0) {
                    $item->update(['standard_cost' => $newAvgCost]);
                }

                InventoryTransactionItem::create([
                    'inventory_transaction_id' => $transaction->id,
                    'site_id' => $siteId,
                    'warehouse_id' => $warehouse->id,
                    'warehouse_location_id' => $balance->warehouse_location_id,
                    'inventory_item_id' => $item->id,
                    'direction' => 'IN',
                    'transaction_type' => $txType,
                    'transaction_datetime' => $txDateTime,
                    'opening_balance_qty' => $oldQty,
                    'qty_in' => $qtyIn,
                    'qty_out' => 0,
                    'running_balance_qty' => $newOnHand,
                    'unit' => $line['unit'] ?? $item->unit_of_measurement,
                    'unit_cost' => $unitCost,
                    'moving_average_cost' => $newAvgCost,
                    'total_cost' => $lineTotalCost,
                    'running_valuation' => $newTotalValue,
                    'reference_document' => $transaction->reference_document,
                    'remarks' => $line['remarks'] ?? $header['remarks'] ?? null,
                    'created_by' => $transaction->created_by,
                ]);

                $grandTotal += $lineTotalCost;
            }

            $transaction->update(['total_amount' => round($grandTotal, 2)]);

            return $transaction->load(['items.item', 'warehouse', 'site']);
        });
    }

    /**
     * Record a Stock Out transaction with strict negative stock prevention and row-level locking.
     */
    public function stockOut(array $header, array $lines): InventoryTransaction
    {
        return DB::transaction(function () use ($header, $lines) {
            $warehouse = Warehouse::findOrFail($header['warehouse_id']);
            $siteId = (int) ($header['site_id'] ?? $warehouse->site_id);

            if ((int) $warehouse->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Site isolation violation: Gudang tidak sesuai dengan site transaksi.',
                ]);
            }

            $txType = $header['transaction_type'] ?? 'general_issue';
            if (!in_array($txType, self::STOCK_OUT_TYPES, true)) {
                throw ValidationException::withMessages([
                    'transaction_type' => "Tipe transaksi Stock Out tidak valid: {$txType}",
                ]);
            }

            $txDateTime = isset($header['transaction_datetime'])
                ? Carbon::parse($header['transaction_datetime'])
                : (isset($header['transaction_date']) ? Carbon::parse($header['transaction_date'])->setTimeFrom(now()) : now());

            $docNumber = $header['document_number'] ?? $this->generateDocumentNumber('GIN');

            $transaction = InventoryTransaction::create([
                'document_number' => $docNumber,
                'transaction_date' => $txDateTime->toDateString(),
                'transaction_datetime' => $txDateTime,
                'direction' => 'OUT',
                'transaction_type' => $txType,
                'site_id' => $siteId,
                'warehouse_id' => $warehouse->id,
                'reference_type' => $header['reference_type'] ?? 'manual',
                'reference_id' => $header['reference_id'] ?? null,
                'reference_document' => $header['reference_document'] ?? $docNumber,
                'unit_id' => $header['unit_id'] ?? null,
                'work_order_id' => $header['work_order_id'] ?? null,
                'sparepart_request_id' => $header['sparepart_request_id'] ?? null,
                'vendor_id' => $header['vendor_id'] ?? null,
                'requester_id' => $header['requester_id'] ?? null,
                'approver_id' => $header['approver_id'] ?? null,
                'storeman_id' => $header['storeman_id'] ?? $warehouse->storeman_id,
                'status' => 'confirmed',
                'total_amount' => 0,
                'remarks' => $header['remarks'] ?? null,
                'attachment_path' => $header['attachment_path'] ?? null,
                'created_by' => $header['created_by'] ?? auth()->id(),
            ]);

            $grandTotal = 0;

            foreach ($lines as $line) {
                $item = InventoryItem::findOrFail($line['inventory_item_id']);
                $qtyOut = round((float) ($line['quantity'] ?? $line['qty_out'] ?? 0), 2);
                $consumingReservedQty = round((float) ($line['consume_reserved_qty'] ?? 0), 2);

                if ($qtyOut <= 0) {
                    throw ValidationException::withMessages([
                        'quantity' => "Kuantitas Stock Out harus lebih besar dari 0 untuk item {$item->item_code}.",
                    ]);
                }

                // Lock InventoryBalance row to prevent concurrent race condition / negative stock
                $balance = InventoryBalance::where('warehouse_id', $warehouse->id)
                    ->where('inventory_item_id', $item->id)
                    ->lockForUpdate()
                    ->first();

                $oldQty = $balance ? (float) $balance->on_hand_qty : 0.0;
                $availableQty = $balance ? (float) $balance->available_qty : 0.0;
                $effectiveAvailable = round($availableQty + $consumingReservedQty, 2);

                if (!$balance || $oldQty < $qtyOut || $effectiveAvailable < $qtyOut) {
                    throw ValidationException::withMessages([
                        'quantity' => "Stok tidak mencukupi untuk item {$item->item_code} ({$item->item_name}) di gudang {$warehouse->name}. Stok tersedia: {$effectiveAvailable}, diminta: {$qtyOut}. Stok negatif tidak diizinkan.",
                    ]);
                }

                // Stock Out uses current Moving Weighted Average cost
                $avgCost = (float) $balance->average_unit_cost > 0
                    ? (float) $balance->average_unit_cost
                    : (float) ($line['unit_cost'] ?? $item->standard_cost);

                $newOnHand = round($oldQty - $qtyOut, 2);
                $newReserved = max(0, round((float) $balance->reserved_qty - $consumingReservedQty, 2));
                $newAvailable = round($newOnHand - $newReserved, 2);
                $lineTotalCost = round($qtyOut * $avgCost, 2);
                $newTotalValue = round($newOnHand * $avgCost, 2);

                $balance->update([
                    'on_hand_qty' => $newOnHand,
                    'reserved_qty' => $newReserved,
                    'available_qty' => $newAvailable,
                    'total_value' => $newTotalValue,
                    'last_out_date' => $txDateTime,
                    'last_movement_date' => $txDateTime,
                ]);

                InventoryTransactionItem::create([
                    'inventory_transaction_id' => $transaction->id,
                    'site_id' => $siteId,
                    'warehouse_id' => $warehouse->id,
                    'warehouse_location_id' => $line['warehouse_location_id'] ?? $balance->warehouse_location_id,
                    'inventory_item_id' => $item->id,
                    'direction' => 'OUT',
                    'transaction_type' => $txType,
                    'transaction_datetime' => $txDateTime,
                    'opening_balance_qty' => $oldQty,
                    'qty_in' => 0,
                    'qty_out' => $qtyOut,
                    'running_balance_qty' => $newOnHand,
                    'unit' => $line['unit'] ?? $item->unit_of_measurement,
                    'unit_cost' => $avgCost,
                    'moving_average_cost' => $avgCost,
                    'total_cost' => $lineTotalCost,
                    'running_valuation' => $newTotalValue,
                    'reference_document' => $transaction->reference_document,
                    'remarks' => $line['remarks'] ?? $header['remarks'] ?? null,
                    'created_by' => $transaction->created_by,
                ]);

                $grandTotal += $lineTotalCost;
            }

            $transaction->update(['total_amount' => round($grandTotal, 2)]);

            return $transaction->load(['items.item', 'warehouse', 'site']);
        });
    }

    /**
     * Step 3 & 4 of Sparepart Request Workflow:
     * Warehouse checks stock and Storeman picks/reserves stock (does NOT deduct on_hand_qty).
     */
    public function pickSparepartRequest(SparepartRequest $sparepartRequest, int $warehouseId, ?int $storemanId = null, array $pickedLines = []): SparepartRequest
    {
        return DB::transaction(function () use ($sparepartRequest, $warehouseId, $storemanId, $pickedLines) {
            $warehouse = Warehouse::findOrFail($warehouseId);

            if ((int) $warehouse->site_id !== (int) $sparepartRequest->site_id) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Site isolation violation: Gudang tidak berada pada site Work Order yang sama.',
                ]);
            }

            if (!in_array($sparepartRequest->status, ['approved', 'picking', 'partially_issued'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Hanya permintaan sparepart berstatus Approved / Partially Issued yang dapat dilakukan Picking.',
                ]);
            }

            $sparepartRequest->load('items');

            foreach ($sparepartRequest->items as $reqItem) {
                $invItem = $this->resolveInventoryItemForRequestItem($reqItem);
                if (!$invItem) {
                    continue;
                }

                $remainingApproved = max(0, (float) $reqItem->quantity_approved - (float) $reqItem->quantity_issued);
                $qtyToPick = isset($pickedLines[$reqItem->id])
                    ? round((float) $pickedLines[$reqItem->id], 2)
                    : $remainingApproved;

                if ($qtyToPick <= 0) {
                    continue;
                }

                $balance = InventoryBalance::where('warehouse_id', $warehouse->id)
                    ->where('inventory_item_id', $invItem->id)
                    ->lockForUpdate()
                    ->first();

                $available = $balance ? (float) $balance->available_qty : 0.0;
                $actualPick = min($qtyToPick, $available);

                if ($actualPick > 0 && $balance) {
                    $balance->update([
                        'reserved_qty' => round((float) $balance->reserved_qty + $actualPick, 2),
                        'available_qty' => round((float) $balance->available_qty - $actualPick, 2),
                    ]);

                    InventoryReservation::create([
                        'reservation_number' => $this->generateDocumentNumber('RSV'),
                        'site_id' => $sparepartRequest->site_id,
                        'warehouse_id' => $warehouse->id,
                        'inventory_item_id' => $invItem->id,
                        'sparepart_request_id' => $sparepartRequest->id,
                        'sparepart_request_item_id' => $reqItem->id,
                        'work_order_id' => $sparepartRequest->work_order_id,
                        'reserved_qty' => $actualPick,
                        'fulfilled_qty' => 0,
                        'status' => 'active',
                        'reserved_by' => auth()->id(),
                        'reserved_at' => now(),
                    ]);
                }

                $reqItem->update([
                    'inventory_item_id' => $invItem->id,
                    'warehouse_id' => $warehouse->id,
                    'warehouse_location_id' => $balance?->warehouse_location_id ?? $invItem->default_location_id,
                    'quantity_picked' => round((float) $reqItem->quantity_picked + $actualPick, 2),
                    'quantity_backorder' => max(0, round($remainingApproved - $actualPick, 2)),
                ]);
            }

            $sparepartRequest->update([
                'warehouse_id' => $warehouse->id,
                'storeman_id' => $storemanId ?? $warehouse->storeman_id,
                'picked_at' => now(),
                'status' => 'picking',
            ]);

            return $sparepartRequest->fresh(['items.inventoryItem', 'warehouse', 'reservations']);
        });
    }

    /**
     * Step 5, 6, 7, 8 of Sparepart Request Workflow:
     * Hand over goods, confirm receipt, automatically deduct warehouse stock via Stock Out (maintenance_issue),
     * handle Full Issue / Partial Issue / Backorder, and record cost into Work Order.
     */
    public function issueSparepartRequest(
        SparepartRequest $sparepartRequest,
        array $issueData = []
    ): SparepartRequest {
        return DB::transaction(function () use ($sparepartRequest, $issueData) {
            if (!in_array($sparepartRequest->status, ['approved', 'picking', 'partially_issued'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Permintaan sparepart harus disetujui (Approved/Picking) sebelum barang dikeluarkan.',
                ]);
            }

            $sparepartRequest->load(['items', 'workOrder']);
            $warehouseId = $issueData['warehouse_id'] ?? $sparepartRequest->warehouse_id;

            if (!$warehouseId) {
                $defaultWarehouse = Warehouse::where('site_id', $sparepartRequest->site_id)
                    ->where('status', 'active')
                    ->first();
                $warehouseId = $defaultWarehouse?->id;
            }

            $warehouse = $warehouseId ? Warehouse::find($warehouseId) : null;
            if ($warehouse && (int) $warehouse->site_id !== (int) $sparepartRequest->site_id) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Site isolation violation: Gudang pengeluaran berbeda dengan site Work Order.',
                ]);
            }

            $itemQuantities = $issueData['items'] ?? []; // optional map: [req_item_id => qty_to_issue] or list of ['id' => ..., 'quantity_issued' => ...]
            $normalizedQtyMap = [];
            foreach ($itemQuantities as $key => $val) {
                if (is_array($val) && isset($val['id'])) {
                    $normalizedQtyMap[$val['id']] = (float) ($val['quantity_issued'] ?? $val['qty'] ?? 0);
                } else {
                    $normalizedQtyMap[$key] = (float) $val;
                }
            }

            $stockOutLines = [];
            $reqItemMap = [];
            $totalIssuedCostThisBatch = 0;

            foreach ($sparepartRequest->items as $reqItem) {
                $approvedQty = (float) ($reqItem->quantity_approved > 0 ? $reqItem->quantity_approved : $reqItem->quantity_requested);
                $alreadyIssued = (float) $reqItem->quantity_issued;
                $remainingToIssue = max(0, round($approvedQty - $alreadyIssued, 2));

                if ($remainingToIssue <= 0) {
                    continue;
                }

                $qtyToIssue = array_key_exists($reqItem->id, $normalizedQtyMap)
                    ? round($normalizedQtyMap[$reqItem->id], 2)
                    : $remainingToIssue;

                if ($qtyToIssue <= 0) {
                    // Mark remaining as backorder
                    $reqItem->update([
                        'quantity_backorder' => $remainingToIssue,
                        'status' => $alreadyIssued > 0 ? 'partial' : 'backorder',
                    ]);
                    continue;
                }

                if ($qtyToIssue > $remainingToIssue) {
                    throw ValidationException::withMessages([
                        'quantity_issued' => "Jumlah pengeluaran ({$qtyToIssue}) melebihi sisa yang disetujui ({$remainingToIssue}) untuk {$reqItem->part_name}.",
                    ]);
                }

                $invItem = $this->resolveInventoryItemForRequestItem($reqItem);

                // Check active reservations for this request item
                $activeReservations = InventoryReservation::where('sparepart_request_item_id', $reqItem->id)
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->get();

                $reservedForThisItem = (float) $activeReservations->sum(fn ($r) => (float) $r->reserved_qty - (float) $r->fulfilled_qty);
                $consumeReserved = min($qtyToIssue, $reservedForThisItem);

                if ($invItem && $warehouse) {
                    // Check if warehouse has balance for this item
                    $balance = InventoryBalance::where('warehouse_id', $warehouse->id)
                        ->where('inventory_item_id', $invItem->id)
                        ->lockForUpdate()
                        ->first();

                    // Only enforce warehouse stock deduction if a balance record exists or inventory_item_id was explicitly linked
                    if ($balance || $reqItem->inventory_item_id) {
                        $stockOutLines[] = [
                            'req_item_id' => $reqItem->id,
                            'inventory_item_id' => $invItem->id,
                            'warehouse_location_id' => $reqItem->warehouse_location_id ?? $balance?->warehouse_location_id,
                            'quantity' => $qtyToIssue,
                            'consume_reserved_qty' => $consumeReserved,
                            'unit' => $reqItem->unit,
                            'unit_cost' => (float) $reqItem->unit_price,
                            'remarks' => "Issue untuk WO {$sparepartRequest->workOrder?->wo_number} ({$sparepartRequest->request_number})",
                        ];
                        $reqItemMap[$reqItem->id] = [
                            'model' => $reqItem,
                            'inv_item' => $invItem,
                            'qty_to_issue' => $qtyToIssue,
                            'approved_qty' => $approvedQty,
                            'reservations' => $activeReservations,
                            'consume_reserved' => $consumeReserved,
                        ];
                        continue;
                    }
                }

                // Fallback for legacy Phase 4 test items that do not have a seeded InventoryBalance
                $unitPrice = (float) $reqItem->unit_price;
                $newIssued = round($alreadyIssued + $qtyToIssue, 2);
                $backorder = max(0, round($approvedQty - $newIssued, 2));
                $totalPrice = round($newIssued * $unitPrice, 2);

                $reqItem->update([
                    'quantity_approved' => $approvedQty,
                    'quantity_issued' => $newIssued,
                    'quantity_backorder' => $backorder,
                    'total_price' => $totalPrice,
                    'status' => $backorder > 0 ? 'partial' : 'issued',
                ]);

                $totalIssuedCostThisBatch += round($qtyToIssue * $unitPrice, 2);
            }

            // Execute atomic Stock Out for all warehouse-backed items
            if (!empty($stockOutLines) && $warehouse) {
                $tx = $this->stockOut([
                    'transaction_type' => 'maintenance_issue',
                    'site_id' => $sparepartRequest->site_id,
                    'warehouse_id' => $warehouse->id,
                    'reference_type' => 'sparepart_request',
                    'reference_id' => $sparepartRequest->id,
                    'reference_document' => $sparepartRequest->request_number,
                    'unit_id' => $sparepartRequest->workOrder?->unit_id,
                    'work_order_id' => $sparepartRequest->work_order_id,
                    'sparepart_request_id' => $sparepartRequest->id,
                    'requester_id' => $sparepartRequest->requested_by,
                    'approver_id' => $sparepartRequest->approved_by,
                    'storeman_id' => $issueData['storeman_id'] ?? $sparepartRequest->storeman_id ?? $warehouse->storeman_id,
                    'remarks' => $issueData['notes'] ?? "Pengeluaran sparepart untuk {$sparepartRequest->request_number}",
                    'created_by' => auth()->id(),
                ], $stockOutLines);

                // Sync MWA cost back to SparepartRequestItem & fulfill reservations
                foreach ($tx->items as $idx => $txItem) {
                    $lineMeta = $stockOutLines[$idx];
                    $meta = $reqItemMap[$lineMeta['req_item_id']];
                    /** @var SparepartRequestItem $reqItem */
                    $reqItem = $meta['model'];
                    $qtyIssuedNow = $meta['qty_to_issue'];
                    $mwaCost = (float) $txItem->moving_average_cost;

                    $newTotalIssued = round((float) $reqItem->quantity_issued + $qtyIssuedNow, 2);
                    $backorder = max(0, round($meta['approved_qty'] - $newTotalIssued, 2));

                    $reqItem->update([
                        'inventory_item_id' => $meta['inv_item']->id,
                        'warehouse_id' => $warehouse->id,
                        'quantity_approved' => $meta['approved_qty'],
                        'quantity_issued' => $newTotalIssued,
                        'quantity_backorder' => $backorder,
                        'unit_price' => $mwaCost,
                        'total_price' => round($newTotalIssued * $mwaCost, 2),
                        'status' => $backorder > 0 ? 'partial' : 'issued',
                    ]);

                    // Update active reservations
                    $remainingToConsume = $meta['consume_reserved'];
                    foreach ($meta['reservations'] as $res) {
                        if ($remainingToConsume <= 0) {
                            break;
                        }
                        $unfulfilled = (float) $res->reserved_qty - (float) $res->fulfilled_qty;
                        $take = min($remainingToConsume, $unfulfilled);
                        $newFulfilled = round((float) $res->fulfilled_qty + $take, 2);
                        $res->update([
                            'fulfilled_qty' => $newFulfilled,
                            'status' => $newFulfilled >= (float) $res->reserved_qty ? 'fulfilled' : 'active',
                        ]);
                        $remainingToConsume -= $take;
                    }

                    $totalIssuedCostThisBatch += round($qtyIssuedNow * $mwaCost, 2);
                }
            }

            // Refresh items to determine overall request status and total cost
            $freshItems = $sparepartRequest->items()->get();
            $totalRequestCost = (float) $freshItems->sum('total_price');
            $hasBackorder = $freshItems->contains(fn ($it) => (float) $it->quantity_backorder > 0);
            $anyIssued = $freshItems->contains(fn ($it) => (float) $it->quantity_issued > 0);

            $newStatus = $hasBackorder
                ? ($anyIssued ? 'partially_issued' : 'approved')
                : 'issued_by_warehouse';

            $sparepartRequest->update([
                'warehouse_id' => $warehouse?->id ?? $sparepartRequest->warehouse_id,
                'status' => $newStatus,
                'issued_by' => auth()->id(),
                'storeman_id' => $issueData['storeman_id'] ?? $sparepartRequest->storeman_id ?? $warehouse?->storeman_id,
                'issued_at' => now(),
                'received_by' => $issueData['received_by'] ?? $sparepartRequest->requested_by,
                'received_at' => now(),
                'total_cost' => round($totalRequestCost, 2),
                'updated_by' => auth()->id(),
            ]);

            // Record cost into Work Order
            if ($totalIssuedCostThisBatch > 0 && $sparepartRequest->work_order_id) {
                $wo = WorkOrder::find($sparepartRequest->work_order_id);
                if ($wo) {
                    MaintenanceCost::create([
                        'work_order_id' => $wo->id,
                        'unit_id' => $wo->unit_id,
                        'site_id' => $wo->site_id,
                        'cost_date' => now()->toDateString(),
                        'cost_type' => 'sparepart',
                        'reference_number' => $sparepartRequest->request_number,
                        'description' => "Pengeluaran Sparepart Gudang ({$sparepartRequest->request_number})",
                        'estimated_amount' => round($totalIssuedCostThisBatch, 2),
                        'actual_amount' => round($totalIssuedCostThisBatch, 2),
                        'created_by' => auth()->id(),
                    ]);

                    $wo->update([
                        'actual_cost' => MaintenanceCost::where('work_order_id', $wo->id)->sum('actual_amount'),
                        'status' => in_array($wo->status, ['waiting_sparepart', 'waiting_parts'], true) ? 'in_progress' : $wo->status,
                        'rfu_status' => $wo->status === 'waiting_sparepart' ? 'repair_in_progress' : $wo->rfu_status,
                    ]);
                }
            }

            return $sparepartRequest->fresh(['items.inventoryItem', 'warehouse', 'workOrder']);
        });
    }

    /**
     * Return unused spareparts from Maintenance / Work Order back to Warehouse (`return_from_maintenance`).
     */
    public function returnFromMaintenance(
        SparepartRequest $sparepartRequest,
        int $sparepartRequestItemId,
        float $returnQty,
        ?string $remarks = null
    ): InventoryTransaction {
        return DB::transaction(function () use ($sparepartRequest, $sparepartRequestItemId, $returnQty, $remarks) {
            $reqItem = SparepartRequestItem::where('sparepart_request_id', $sparepartRequest->id)
                ->where('id', $sparepartRequestItemId)
                ->lockForUpdate()
                ->firstOrFail();

            $returnQty = round($returnQty, 2);
            $maxReturnable = round((float) $reqItem->quantity_issued - (float) $reqItem->quantity_returned, 2);

            if ($returnQty <= 0 || $returnQty > $maxReturnable) {
                throw ValidationException::withMessages([
                    'quantity' => "Kuantitas retur ({$returnQty}) tidak valid. Maksimal yang dapat diretur: {$maxReturnable}.",
                ]);
            }

            $invItem = $this->resolveInventoryItemForRequestItem($reqItem);
            if (!$invItem) {
                throw ValidationException::withMessages([
                    'inventory_item_id' => 'Item master tidak ditemukan untuk item sparepart ini.',
                ]);
            }

            $warehouseId = $reqItem->warehouse_id ?? $sparepartRequest->warehouse_id ?? $invItem->default_warehouse_id;
            if (!$warehouseId) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Gudang tujuan retur tidak ditemukan.',
                ]);
            }

            $unitCost = (float) $reqItem->unit_price > 0 ? (float) $reqItem->unit_price : (float) $invItem->standard_cost;

            $tx = $this->stockIn([
                'transaction_type' => 'return_from_maintenance',
                'site_id' => $sparepartRequest->site_id,
                'warehouse_id' => $warehouseId,
                'reference_type' => 'sparepart_request',
                'reference_id' => $sparepartRequest->id,
                'reference_document' => $sparepartRequest->request_number,
                'unit_id' => $sparepartRequest->workOrder?->unit_id,
                'work_order_id' => $sparepartRequest->work_order_id,
                'sparepart_request_id' => $sparepartRequest->id,
                'requester_id' => $sparepartRequest->requested_by,
                'remarks' => $remarks ?? "Retur sparepart dari WO {$sparepartRequest->workOrder?->wo_number}",
                'created_by' => auth()->id(),
            ], [
                [
                    'inventory_item_id' => $invItem->id,
                    'warehouse_location_id' => $reqItem->warehouse_location_id,
                    'quantity' => $returnQty,
                    'unit' => $reqItem->unit,
                    'unit_cost' => $unitCost,
                    'remarks' => $remarks ?? "Retur {$returnQty} {$reqItem->unit} dari {$sparepartRequest->request_number}",
                ],
            ]);

            $newReturned = round((float) $reqItem->quantity_returned + $returnQty, 2);
            $netIssued = max(0, round((float) $reqItem->quantity_issued - $newReturned, 2));
            $reqItem->update([
                'quantity_returned' => $newReturned,
                'total_price' => round($netIssued * $unitCost, 2),
            ]);

            $sparepartRequest->update([
                'total_cost' => $sparepartRequest->items()->sum('total_price'),
            ]);

            // Credit back MaintenanceCost on Work Order
            if ($sparepartRequest->work_order_id) {
                $wo = WorkOrder::find($sparepartRequest->work_order_id);
                if ($wo) {
                    $creditAmount = -1 * round($returnQty * $unitCost, 2);
                    MaintenanceCost::create([
                        'work_order_id' => $wo->id,
                        'unit_id' => $wo->unit_id,
                        'site_id' => $wo->site_id,
                        'cost_date' => now()->toDateString(),
                        'cost_type' => 'sparepart',
                        'reference_number' => $tx->document_number,
                        'description' => "Retur Sparepart ke Gudang ({$sparepartRequest->request_number} - {$invItem->item_name})",
                        'estimated_amount' => $creditAmount,
                        'actual_amount' => $creditAmount,
                        'created_by' => auth()->id(),
                    ]);

                    $wo->update([
                        'actual_cost' => max(0, MaintenanceCost::where('work_order_id', $wo->id)->sum('actual_amount')),
                    ]);
                }
            }

            return $tx;
        });
    }

    /**
     * Dispatch an approved Inter-Warehouse Stock Transfer (`transfer_out`).
     */
    public function dispatchTransfer(StockTransfer $transfer, ?int $dispatchedByEmployeeId = null): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $dispatchedByEmployeeId) {
            if (!in_array($transfer->status, ['draft', 'approved'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Hanya dokumen transfer berstatus Draft/Approved yang dapat dikirim (Dispatch).',
                ]);
            }

            $transfer->load('items.item');

            $lines = [];
            foreach ($transfer->items as $tItem) {
                $qty = (float) ($tItem->qty_dispatched > 0 ? $tItem->qty_dispatched : $tItem->qty_requested);
                $lines[] = [
                    'inventory_item_id' => $tItem->inventory_item_id,
                    'quantity' => $qty,
                    'unit' => $tItem->unit,
                    'remarks' => "Transfer Out {$transfer->transfer_number} ke gudang tujuan",
                ];
            }

            $txOut = $this->stockOut([
                'document_number' => $this->generateDocumentNumber('TRF-OUT'),
                'transaction_type' => 'transfer_out',
                'site_id' => $transfer->from_site_id,
                'warehouse_id' => $transfer->from_warehouse_id,
                'reference_type' => 'stock_transfer',
                'reference_id' => $transfer->id,
                'reference_document' => $transfer->transfer_number,
                'requester_id' => $transfer->requester_id,
                'approver_id' => $transfer->approved_by ?? auth()->id(),
                'storeman_id' => $dispatchedByEmployeeId,
                'remarks' => "Pengiriman Transfer Antar Gudang {$transfer->transfer_number}",
                'created_by' => auth()->id(),
            ], $lines);

            $totalValue = 0;
            foreach ($txOut->items as $idx => $txItem) {
                $tItem = $transfer->items[$idx];
                $tItem->update([
                    'qty_dispatched' => $txItem->qty_out,
                    'unit_cost' => $txItem->moving_average_cost,
                    'total_cost' => $txItem->total_cost,
                ]);
                $totalValue += (float) $txItem->total_cost;
            }

            $transfer->update([
                'approved_by' => $transfer->approved_by ?? auth()->id(),
                'approved_at' => $transfer->approved_at ?? now(),
                'dispatched_by' => $dispatchedByEmployeeId,
                'dispatched_at' => now(),
                'status' => 'in_transit',
                'total_transfer_value' => round($totalValue, 2),
            ]);

            return $transfer->fresh(['items.item', 'fromWarehouse', 'toWarehouse']);
        });
    }

    /**
     * Receive an In-Transit Inter-Warehouse Stock Transfer (`transfer_in`).
     */
    public function receiveTransfer(StockTransfer $transfer, ?int $receivedByEmployeeId = null): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $receivedByEmployeeId) {
            if ($transfer->status !== 'in_transit') {
                throw ValidationException::withMessages([
                    'status' => 'Hanya dokumen transfer berstatus In Transit yang dapat diterima (Receive).',
                ]);
            }

            $transfer->load('items.item');

            $lines = [];
            foreach ($transfer->items as $tItem) {
                $qty = (float) ($tItem->qty_dispatched > 0 ? $tItem->qty_dispatched : $tItem->qty_requested);
                $lines[] = [
                    'inventory_item_id' => $tItem->inventory_item_id,
                    'quantity' => $qty,
                    'unit' => $tItem->unit,
                    'unit_cost' => (float) $tItem->unit_cost,
                    'remarks' => "Transfer In {$transfer->transfer_number} dari gudang asal",
                ];
            }

            $this->stockIn([
                'document_number' => $this->generateDocumentNumber('TRF-IN'),
                'transaction_type' => 'transfer_in',
                'site_id' => $transfer->to_site_id,
                'warehouse_id' => $transfer->to_warehouse_id,
                'reference_type' => 'stock_transfer',
                'reference_id' => $transfer->id,
                'reference_document' => $transfer->transfer_number,
                'requester_id' => $transfer->requester_id,
                'approver_id' => $transfer->approved_by,
                'storeman_id' => $receivedByEmployeeId,
                'remarks' => "Penerimaan Transfer Antar Gudang {$transfer->transfer_number}",
                'created_by' => auth()->id(),
            ], $lines);

            foreach ($transfer->items as $tItem) {
                $tItem->update([
                    'qty_received' => $tItem->qty_dispatched > 0 ? $tItem->qty_dispatched : $tItem->qty_requested,
                ]);
            }

            $transfer->update([
                'received_by' => $receivedByEmployeeId,
                'received_at' => now(),
                'status' => 'completed',
            ]);

            return $transfer->fresh(['items.item', 'fromWarehouse', 'toWarehouse']);
        });
    }

    /**
     * Approve a Stock Adjustment and execute the corresponding Stock In (`adjustment_in`) and/or Stock Out (`adjustment_out`).
     * Stock Opname physical counts NEVER alter system stock until this Stock Adjustment is approved!
     */
    public function approveAdjustment(StockAdjustment $adjustment, ?int $approverUserId = null): StockAdjustment
    {
        return DB::transaction(function () use ($adjustment, $approverUserId) {
            if ($adjustment->status === 'approved') {
                throw ValidationException::withMessages([
                    'status' => 'Dokumen Stock Adjustment ini sudah disetujui sebelumnya.',
                ]);
            }

            $adjustment->load('items.item');

            $inLines = [];
            $outLines = [];

            foreach ($adjustment->items as $adjItem) {
                $qty = round((float) $adjItem->adjustment_qty, 2);
                if ($qty <= 0) {
                    continue;
                }

                if ($adjItem->direction === 'IN') {
                    $inLines[] = [
                        'inventory_item_id' => $adjItem->inventory_item_id,
                        'quantity' => $qty,
                        'unit' => $adjItem->item->unit_of_measurement,
                        'unit_cost' => (float) $adjItem->unit_cost > 0 ? (float) $adjItem->unit_cost : (float) $adjItem->item->standard_cost,
                        'remarks' => $adjItem->notes ?? "Adjustment IN ({$adjustment->adjustment_number})",
                    ];
                } else {
                    $outLines[] = [
                        'inventory_item_id' => $adjItem->inventory_item_id,
                        'quantity' => $qty,
                        'unit' => $adjItem->item->unit_of_measurement,
                        'unit_cost' => (float) $adjItem->unit_cost,
                        'remarks' => $adjItem->notes ?? "Adjustment OUT ({$adjustment->adjustment_number})",
                    ];
                }
            }

            if (!empty($inLines)) {
                $this->stockIn([
                    'document_number' => $this->generateDocumentNumber('ADJ-IN'),
                    'transaction_type' => 'adjustment_in',
                    'site_id' => $adjustment->site_id,
                    'warehouse_id' => $adjustment->warehouse_id,
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $adjustment->id,
                    'reference_document' => $adjustment->adjustment_number,
                    'requester_id' => $adjustment->requested_by,
                    'approver_id' => $approverUserId ?? auth()->id(),
                    'remarks' => $adjustment->remarks ?? "Penyesuaian Stok Masuk {$adjustment->adjustment_number}",
                    'created_by' => $approverUserId ?? auth()->id(),
                ], $inLines);
            }

            if (!empty($outLines)) {
                $this->stockOut([
                    'document_number' => $this->generateDocumentNumber('ADJ-OUT'),
                    'transaction_type' => 'adjustment_out',
                    'site_id' => $adjustment->site_id,
                    'warehouse_id' => $adjustment->warehouse_id,
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $adjustment->id,
                    'reference_document' => $adjustment->adjustment_number,
                    'requester_id' => $adjustment->requested_by,
                    'approver_id' => $approverUserId ?? auth()->id(),
                    'remarks' => $adjustment->remarks ?? "Penyesuaian Stok Keluar {$adjustment->adjustment_number}",
                    'created_by' => $approverUserId ?? auth()->id(),
                ], $outLines);
            }

            $adjustment->update([
                'status' => 'approved',
                'approved_by' => $approverUserId ?? auth()->id(),
                'approved_at' => now(),
            ]);

            if ($adjustment->stock_opname_id) {
                $opname = StockOpname::find($adjustment->stock_opname_id);
                if ($opname) {
                    $opname->update([
                        'status' => 'completed',
                        'approved_by' => $approverUserId ?? auth()->id(),
                        'approved_at' => now(),
                    ]);
                    $opname->items()->where('variance_qty', '!=', 0)->update(['status' => 'adjusted']);
                }
            }

            return $adjustment->fresh(['items.item', 'warehouse', 'opname']);
        });
    }

    /**
     * Generate a Purchase Request (PR) proposal from items at or below Reorder Point.
     * Strict Rule: Never automatically create a Purchase Order (PO) without approval.
     */
    public function createReorderPurchaseRequest(int $siteId, int $warehouseId, array $itemIds = [], ?int $requestedBy = null, ?string $notes = null): PurchaseRequest
    {
        return DB::transaction(function () use ($siteId, $warehouseId, $itemIds, $requestedBy, $notes) {
            $warehouse = Warehouse::findOrFail($warehouseId);
            if ((int) $warehouse->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Site isolation violation: Gudang tidak sesuai dengan site Purchase Request.',
                ]);
            }

            $query = InventoryItem::where('is_active', true);
            if (!empty($itemIds)) {
                $query->whereIn('id', $itemIds);
            }

            $items = $query->get();
            $prLines = [];
            $estimatedTotal = 0;

            foreach ($items as $item) {
                $balance = InventoryBalance::where('warehouse_id', $warehouse->id)
                    ->where('inventory_item_id', $item->id)
                    ->first();

                $onHand = $balance ? (float) $balance->on_hand_qty : 0.0;

                // Include if explicitly selected or if onHand <= reorder_point
                if (empty($itemIds) && $onHand > (float) $item->reorder_point) {
                    continue;
                }

                $recommendedQty = self::calculateRecommendedOrderQty($item, $onHand);
                $unitPrice = $balance && (float) $balance->average_unit_cost > 0
                    ? (float) $balance->average_unit_cost
                    : (float) $item->standard_cost;
                $subtotal = round($recommendedQty * $unitPrice, 2);

                $prLines[] = [
                    'inventory_item_id' => $item->id,
                    'current_stock' => $onHand,
                    'minimum_stock' => (float) $item->minimum_stock,
                    'reorder_point' => (float) $item->reorder_point,
                    'maximum_stock' => $item->maximum_stock !== null ? (float) $item->maximum_stock : null,
                    'recommended_qty' => $recommendedQty,
                    'requested_qty' => $recommendedQty,
                    'unit' => $item->unit_of_measurement,
                    'estimated_unit_price' => $unitPrice,
                    'estimated_subtotal' => $subtotal,
                    'notes' => "Reorder Alert: Stok saat ini ({$onHand}) <= Reorder Point ({$item->reorder_point})",
                ];

                $estimatedTotal += $subtotal;
            }

            if (empty($prLines)) {
                throw ValidationException::withMessages([
                    'items' => 'Tidak ada item yang berada di bawah Reorder Point untuk diajukan menjadi Purchase Request.',
                ]);
            }

            $pr = PurchaseRequest::create([
                'pr_number' => $this->generateDocumentNumber('PR-TAP'),
                'site_id' => $siteId,
                'warehouse_id' => $warehouse->id,
                'request_date' => now()->toDateString(),
                'source' => 'reorder_point',
                'priority' => 'high',
                'status' => 'submitted', // Proposal only — NEVER creates an automatic PO without approval
                'estimated_total' => round($estimatedTotal, 2),
                'requested_by' => $requestedBy,
                'notes' => $notes ?? 'Usulan Purchase Request otomatis dari Reorder Point Alert (Menunggu Approval Procurement Phase 6).',
                'created_by' => auth()->id(),
            ]);

            foreach ($prLines as $line) {
                $pr->items()->create($line);
            }

            return $pr->load(['items.item', 'warehouse', 'site']);
        });
    }

    /**
     * Resolve an InventoryItem from a SparepartRequestItem (by inventory_item_id, item_code, or part_number).
     */
    protected function resolveInventoryItemForRequestItem(SparepartRequestItem $reqItem): ?InventoryItem
    {
        if ($reqItem->inventory_item_id) {
            return InventoryItem::find($reqItem->inventory_item_id);
        }

        if ($reqItem->part_number) {
            $found = InventoryItem::where('item_code', $reqItem->part_number)
                ->orWhere('part_number', $reqItem->part_number)
                ->first();
            if ($found) {
                return $found;
            }
        }

        return null;
    }
}
