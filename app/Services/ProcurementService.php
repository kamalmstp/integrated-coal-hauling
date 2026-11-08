<?php

namespace App\Services;

use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\InventoryItem;
use App\Models\Position;
use App\Models\ProcurementApprovalRule;
use App\Models\PurchaseApproval;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequest;
use App\Models\QuotationComparison;
use App\Models\Rfq;
use App\Models\RfqVendor;
use App\Models\VendorInvoice;
use App\Models\VendorQuotation;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProcurementService
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    public function generateNumber(string $prefix): string
    {
        return "{$prefix}-" . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
    }

    /**
     * Evaluate configurable approval rules from database (NEVER hardcoded nominal thresholds)
     * based on Position (Jabatan), Site, Department, Transaction Value, and Purchase Category.
     */
    public function generateApprovalsForDocument(
        string $docType,
        int $docId,
        int $siteId,
        ?int $departmentId,
        string $category,
        float $amount
    ): array {
        $rules = ProcurementApprovalRule::where('is_active', true)
            ->whereIn('document_type', ['ALL', strtoupper($docType)])
            ->where(function ($q) use ($siteId) {
                $q->whereNull('site_id')->orWhere('site_id', $siteId);
            })
            ->where(function ($q) use ($departmentId) {
                $q->whereNull('department_id');
                if ($departmentId) {
                    $q->orWhere('department_id', $departmentId);
                }
            })
            ->where(function ($q) use ($category) {
                $q->whereNull('purchase_category')->orWhere('purchase_category', $category);
            })
            ->where('min_amount', '<=', $amount)
            ->where(function ($q) use ($amount) {
                $q->whereNull('max_amount')->orWhere('max_amount', '>=', $amount);
            })
            ->orderBy('step_order')
            ->orderBy('min_amount')
            ->get();

        $created = [];

        if ($rules->isEmpty()) {
            $defaultPosition = Position::first();
            $created[] = PurchaseApproval::create([
                'approvable_type' => $docType === 'PR' ? 'purchase_request' : 'purchase_order',
                'approvable_id' => $docId,
                'purchase_request_id' => $docType === 'PR' ? $docId : null,
                'purchase_order_id' => $docType === 'PO' ? $docId : null,
                'approval_rule_id' => null,
                'site_id' => $siteId,
                'department_id' => $departmentId,
                'approver_position_id' => $defaultPosition?->id,
                'step_order' => 1,
                'step_name' => $defaultPosition ? "Otorisasi {$defaultPosition->name}" : 'Otorisasi Manajemen Site',
                'transaction_amount' => $amount,
                'purchase_category' => $category,
                'status' => 'pending',
            ]);
            return $created;
        }

        $stepCounter = 1;
        foreach ($rules as $rule) {
            $created[] = PurchaseApproval::create([
                'approvable_type' => $docType === 'PR' ? 'purchase_request' : 'purchase_order',
                'approvable_id' => $docId,
                'purchase_request_id' => $docType === 'PR' ? $docId : null,
                'purchase_order_id' => $docType === 'PO' ? $docId : null,
                'approval_rule_id' => $rule->id,
                'site_id' => $siteId,
                'department_id' => $departmentId,
                'approver_position_id' => $rule->approver_position_id,
                'step_order' => $stepCounter++,
                'step_name' => $rule->rule_name . ' (' . $rule->approver_role_label . ')',
                'transaction_amount' => $amount,
                'purchase_category' => $category,
                'status' => 'pending',
            ]);
        }

        return $created;
    }

    /**
     * 1. Create Purchase Request (PR) with automatic PR Number & configurable approval steps.
     */
    public function createPurchaseRequest(array $data, array $items): PurchaseRequest
    {
        return DB::transaction(function () use ($data, $items) {
            $siteId = (int) $data['site_id'];
            $warehouseId = $data['warehouse_id'] ?? null;

            if ($warehouseId) {
                $warehouse = Warehouse::findOrFail($warehouseId);
                if ((int) $warehouse->site_id !== $siteId) {
                    throw ValidationException::withMessages([
                        'warehouse_id' => 'Site isolation violation: Gudang tidak berada pada site Purchase Request.',
                    ]);
                }
            } else {
                $defaultWh = Warehouse::where('site_id', $siteId)->first();
                $warehouseId = $defaultWh?->id;
            }

            $prNumber = $data['pr_number'] ?? $this->generateNumber('PR-TAP');
            $category = $data['purchase_category'] ?? 'sparepart';

            $pr = PurchaseRequest::create([
                'pr_number' => $prNumber,
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'department_id' => $data['department_id'] ?? null,
                'work_order_id' => $data['work_order_id'] ?? null,
                'request_date' => $data['request_date'] ?? now()->toDateString(),
                'required_date' => $data['required_date'] ?? now()->addDays(7)->toDateString(),
                'source' => $data['source'] ?? 'operational_requirement',
                'purchase_category' => $category,
                'priority' => $data['priority'] ?? 'normal',
                'status' => 'pending_approval',
                'current_approval_step' => 1,
                'estimated_total' => 0,
                'purpose' => $data['purpose'] ?? null,
                'requested_by' => $data['requested_by'] ?? null,
                'notes' => $data['notes'] ?? null,
                'attachment_path' => $data['attachment_path'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            $estimatedTotal = 0;
            foreach ($items as $line) {
                $invItem = !empty($line['inventory_item_id']) ? InventoryItem::find($line['inventory_item_id']) : null;
                $qty = round((float) ($line['requested_qty'] ?? $line['quantity'] ?? 1), 2);
                $unitPrice = round((float) ($line['estimated_unit_price'] ?? $line['unit_price'] ?? $invItem?->standard_cost ?? 0), 2);
                $subtotal = round($qty * $unitPrice, 2);

                $pr->items()->create([
                    'inventory_item_id' => $invItem?->id,
                    'item_name' => $line['item_name'] ?? $invItem?->item_name ?? 'General Item',
                    'specification' => $line['specification'] ?? $invItem?->specification ?? null,
                    'current_stock' => $line['current_stock'] ?? 0,
                    'minimum_stock' => $line['minimum_stock'] ?? ($invItem?->minimum_stock ?? 0),
                    'reorder_point' => $line['reorder_point'] ?? ($invItem?->reorder_point ?? 0),
                    'maximum_stock' => $line['maximum_stock'] ?? $invItem?->maximum_stock,
                    'recommended_qty' => $line['recommended_qty'] ?? $qty,
                    'requested_qty' => $qty,
                    'unit' => strtoupper($line['unit'] ?? $invItem?->unit_of_measurement ?? 'PCS'),
                    'estimated_unit_price' => $unitPrice,
                    'estimated_subtotal' => $subtotal,
                    'purpose' => $line['purpose'] ?? $data['purpose'] ?? null,
                    'notes' => $line['notes'] ?? null,
                ]);

                $estimatedTotal += $subtotal;
            }

            $pr->update(['estimated_total' => round($estimatedTotal, 2)]);

            $this->generateApprovalsForDocument(
                'PR',
                $pr->id,
                $siteId,
                $pr->department_id,
                $category,
                round($estimatedTotal, 2)
            );

            return $pr->load(['items.item', 'approvals.approverPosition', 'site', 'department', 'warehouse']);
        });
    }

    /**
     * 2. Approve Purchase Request (PR) step-by-step or final approval.
     */
    public function approvePurchaseRequest(PurchaseRequest $pr, array $payload = []): PurchaseRequest
    {
        return DB::transaction(function () use ($pr, $payload) {
            if ($pr->status === 'rejected') {
                throw ValidationException::withMessages([
                    'status' => 'Purchase Request yang sudah ditolak tidak dapat disetujui.',
                ]);
            }

            // Ensure approval records exist (e.g. for PRs created by Phase 5 reorder generator)
            if ($pr->approvals()->count() === 0) {
                $this->generateApprovalsForDocument(
                    'PR',
                    $pr->id,
                    (int) $pr->site_id,
                    $pr->department_id,
                    $pr->purchase_category ?? 'sparepart',
                    (float) $pr->estimated_total
                );
            }

            $pendingSteps = $pr->approvals()->where('status', 'pending')->orderBy('step_order')->get();
            $approveAll = (bool) ($payload['approve_all'] ?? false);

            if ($pendingSteps->isNotEmpty()) {
                $stepsToApprove = $approveAll ? $pendingSteps : collect([$pendingSteps->first()]);

                foreach ($stepsToApprove as $step) {
                    $step->update([
                        'status' => 'approved',
                        'acted_by' => $payload['acted_by'] ?? auth()->id(),
                        'acted_by_employee_id' => $payload['acted_by_employee_id'] ?? null,
                        'acted_at' => now(),
                        'notes' => $payload['notes'] ?? 'Disetujui sesuai matriks otorisasi.',
                    ]);
                }
            }

            $remainingPending = $pr->approvals()->where('status', 'pending')->orderBy('step_order')->first();

            if ($remainingPending) {
                $pr->update([
                    'status' => 'pending_approval',
                    'current_approval_step' => $remainingPending->step_order,
                ]);
            } else {
                $pr->update([
                    'status' => 'approved',
                    'approved_by' => $payload['acted_by'] ?? auth()->id(),
                    'approved_at' => now(),
                ]);
            }

            return $pr->fresh(['items.item', 'approvals.approverPosition']);
        });
    }

    public function rejectPurchaseRequest(PurchaseRequest $pr, string $reason): PurchaseRequest
    {
        return DB::transaction(function () use ($pr, $reason) {
            $pr->approvals()->where('status', 'pending')->update([
                'status' => 'rejected',
                'acted_by' => auth()->id(),
                'acted_at' => now(),
                'notes' => $reason,
            ]);

            $pr->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
            ]);

            return $pr->fresh(['approvals']);
        });
    }

    /**
     * 3. Create Request for Quotation (RFQ) & Invite Vendors from an Approved PR.
     */
    public function createRfq(PurchaseRequest $pr, array $data): Rfq
    {
        return DB::transaction(function () use ($pr, $data) {
            if (!in_array($pr->status, ['approved', 'approved_for_po', 'rfq_process'], true)) {
                throw ValidationException::withMessages([
                    'purchase_request_id' => 'Hanya Purchase Request yang sudah Approved yang dapat dibuatkan RFQ.',
                ]);
            }

            if (isset($data['site_id']) && (int) $data['site_id'] !== (int) $pr->site_id) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Site RFQ harus sama dengan Site Purchase Request.',
                ]);
            }

            $rfq = Rfq::create([
                'rfq_number' => $data['rfq_number'] ?? $this->generateNumber('RFQ-TAP'),
                'purchase_request_id' => $pr->id,
                'site_id' => $pr->site_id,
                'issue_date' => $data['issue_date'] ?? now()->toDateString(),
                'closing_date' => $data['closing_date'] ?? now()->addDays(5)->toDateString(),
                'title' => $data['title'] ?? "RFQ untuk {$pr->pr_number} ({$pr->purchase_category})",
                'status' => 'open',
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($data['vendor_ids'] ?? [] as $vendorId) {
                RfqVendor::updateOrCreate(
                    ['rfq_id' => $rfq->id, 'vendor_id' => $vendorId],
                    [
                        'invited_at' => now(),
                        'invitation_status' => 'invited',
                    ]
                );
            }

            $pr->update(['status' => 'rfq_process']);

            return $rfq->load(['invitedVendors.vendor', 'purchaseRequest.items']);
        });
    }

    /**
     * 4. Record Vendor Quotation (with item prices, delivery time, payment terms, and optional file upload).
     */
    public function recordVendorQuotation(Rfq $rfq, array $data, array $items): VendorQuotation
    {
        return DB::transaction(function () use ($rfq, $data, $items) {
            $vendorId = (int) $data['vendor_id'];

            RfqVendor::updateOrCreate(
                ['rfq_id' => $rfq->id, 'vendor_id' => $vendorId],
                [
                    'invited_at' => now(),
                    'invitation_status' => 'responded',
                ]
            );

            $quotation = VendorQuotation::create([
                'quotation_number' => $data['quotation_number'] ?? $this->generateNumber('QTN-VND'),
                'rfq_id' => $rfq->id,
                'vendor_id' => $vendorId,
                'site_id' => $rfq->site_id,
                'quotation_date' => $data['quotation_date'] ?? now()->toDateString(),
                'valid_until' => $data['valid_until'] ?? now()->addDays(30)->toDateString(),
                'delivery_lead_time_days' => (int) ($data['delivery_lead_time_days'] ?? 7),
                'payment_terms' => $data['payment_terms'] ?? 'TOP 30 Days',
                'currency' => 'IDR',
                'subtotal_amount' => 0,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => 0,
                'attachment_path' => $data['attachment_path'] ?? null,
                'status' => 'submitted',
                'remarks' => $data['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $subtotal = 0;
            $totalDiscount = 0;
            $totalTax = 0;

            foreach ($items as $line) {
                $qty = round((float) ($line['quantity'] ?? 1), 2);
                $price = round((float) ($line['unit_price'] ?? 0), 2);
                $disc = round((float) ($line['discount_amount'] ?? 0), 2);
                $taxRate = isset($line['tax_rate']) ? (float) $line['tax_rate'] : 11.0;

                $lineNet = max(0, ($qty * $price) - $disc);
                $lineTax = round($lineNet * ($taxRate / 100), 2);
                $lineTotal = round($lineNet + $lineTax, 2);

                $quotation->items()->create([
                    'purchase_request_item_id' => $line['purchase_request_item_id'] ?? null,
                    'inventory_item_id' => $line['inventory_item_id'] ?? null,
                    'item_name' => $line['item_name'] ?? 'Sparepart Item',
                    'specification' => $line['specification'] ?? null,
                    'quantity' => $qty,
                    'unit' => $line['unit'] ?? 'PCS',
                    'unit_price' => $price,
                    'discount_amount' => $disc,
                    'tax_rate' => $taxRate,
                    'total_price' => $lineTotal,
                    'delivery_days' => (int) ($line['delivery_days'] ?? $quotation->delivery_lead_time_days),
                    'brand_offered' => $line['brand_offered'] ?? null,
                    'notes' => $line['notes'] ?? null,
                ]);

                $subtotal += ($qty * $price);
                $totalDiscount += $disc;
                $totalTax += $lineTax;
            }

            $grandTotal = round(($subtotal - $totalDiscount) + $totalTax, 2);

            $quotation->update([
                'subtotal_amount' => round($subtotal, 2),
                'discount_amount' => round($totalDiscount, 2),
                'tax_amount' => round($totalTax, 2),
                'total_amount' => $grandTotal,
            ]);

            $rfq->update(['status' => 'quoted']);

            return $quotation->load(['items', 'vendor']);
        });
    }

    /**
     * 5. Compare Vendor Quotations (Price, Delivery Time, Payment Terms) & Select Winning Vendor.
     */
    public function compareAndSelectVendor(Rfq $rfq, int $selectedQuotationId, string $selectionRemarks): QuotationComparison
    {
        return DB::transaction(function () use ($rfq, $selectedQuotationId, $selectionRemarks) {
            $quotations = $rfq->quotations()->with(['vendor', 'items'])->get();

            if ($quotations->isEmpty()) {
                throw ValidationException::withMessages([
                    'rfq_id' => 'Belum ada penawaran (Quotation) vendor untuk dievaluasi pada RFQ ini.',
                ]);
            }

            $selectedQ = $quotations->firstWhere('id', $selectedQuotationId);
            if (!$selectedQ) {
                throw ValidationException::withMessages([
                    'selected_quotation_id' => 'Quotation pemenang tidak valid untuk RFQ ini.',
                ]);
            }

            $lowestPriceQ = $quotations->sortBy('total_amount')->first();
            $fastestDeliveryQ = $quotations->sortBy('delivery_lead_time_days')->first();

            // Score payment terms: longer credit term = higher score
            $termScore = function (string $term): int {
                $t = strtoupper($term);
                if (str_contains($t, '60')) return 60;
                if (str_contains($t, '45')) return 45;
                if (str_contains($t, '30')) return 30;
                if (str_contains($t, '14')) return 14;
                if (str_contains($t, 'COD')) return 1;
                return 0; // CBD
            };

            $bestTermsQ = $quotations->sortByDesc(fn ($q) => $termScore($q->payment_terms))->first();

            $matrix = $quotations->map(fn ($q) => [
                'quotation_id' => $q->id,
                'quotation_number' => $q->quotation_number,
                'vendor_id' => $q->vendor_id,
                'vendor_name' => $q->vendor?->name,
                'total_amount' => (float) $q->total_amount,
                'delivery_lead_time_days' => (int) $q->delivery_lead_time_days,
                'payment_terms' => $q->payment_terms,
                'is_lowest_price' => $q->id === $lowestPriceQ?->id,
                'is_fastest_delivery' => $q->id === $fastestDeliveryQ?->id,
                'is_best_payment_terms' => $q->id === $bestTermsQ?->id,
                'is_selected' => $q->id === $selectedQ->id,
            ])->values()->all();

            foreach ($quotations as $q) {
                $q->update([
                    'status' => $q->id === $selectedQ->id ? 'selected' : 'rejected',
                ]);
            }

            $comparison = QuotationComparison::create([
                'comparison_number' => $this->generateNumber('CMP-TAP'),
                'rfq_id' => $rfq->id,
                'purchase_request_id' => $rfq->purchase_request_id,
                'site_id' => $rfq->site_id,
                'comparison_date' => now()->toDateString(),
                'selected_quotation_id' => $selectedQ->id,
                'selected_vendor_id' => $selectedQ->vendor_id,
                'lowest_price_quotation_id' => $lowestPriceQ?->id,
                'fastest_delivery_quotation_id' => $fastestDeliveryQ?->id,
                'best_payment_terms_quotation_id' => $bestTermsQ?->id,
                'comparison_matrix' => $matrix,
                'selection_remarks' => $selectionRemarks,
                'evaluated_by' => auth()->id(),
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'status' => 'completed',
            ]);

            $rfq->update(['status' => 'awarded']);

            return $comparison->load(['selectedQuotation.vendor', 'selectedVendor', 'rfq']);
        });
    }

    /**
     * 6. Create Purchase Order (PO) from Comparison/Quotation or Approved PR, with configurable PO Approval.
     */
    public function createPurchaseOrder(array $data, array $items = []): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $items) {
            $siteId = (int) $data['site_id'];
            $pr = !empty($data['purchase_request_id']) ? PurchaseRequest::findOrFail($data['purchase_request_id']) : null;
            $quotation = !empty($data['vendor_quotation_id']) ? VendorQuotation::with('items')->findOrFail($data['vendor_quotation_id']) : null;
            $comparison = !empty($data['quotation_comparison_id']) ? QuotationComparison::find($data['quotation_comparison_id']) : null;

            if ($pr && (int) $pr->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Site PO harus sesuai dengan Site Purchase Request.',
                ]);
            }

            if ($quotation && empty($items)) {
                foreach ($quotation->items as $qItem) {
                    $items[] = [
                        'purchase_request_item_id' => $qItem->purchase_request_item_id,
                        'inventory_item_id' => $qItem->inventory_item_id,
                        'item_name' => $qItem->item_name,
                        'specification' => $qItem->specification,
                        'quantity_ordered' => $qItem->quantity,
                        'unit' => $qItem->unit,
                        'unit_price' => $qItem->unit_price,
                        'discount_amount' => $qItem->discount_amount,
                    ];
                }
            }

            $warehouseId = $data['warehouse_id'] ?? $pr?->warehouse_id ?? Warehouse::where('site_id', $siteId)->first()?->id;
            $taxPercent = isset($data['tax_percent']) ? (float) $data['tax_percent'] : 11.0;

            $po = PurchaseOrder::create([
                'po_number' => $data['po_number'] ?? $this->generateNumber('PO-TAP'),
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'department_id' => $data['department_id'] ?? $pr?->department_id,
                'purchase_request_id' => $pr?->id,
                'rfq_id' => $data['rfq_id'] ?? $quotation?->rfq_id ?? $comparison?->rfq_id,
                'quotation_comparison_id' => $comparison?->id,
                'vendor_quotation_id' => $quotation?->id,
                'vendor_id' => $data['vendor_id'] ?? $quotation?->vendor_id ?? $comparison?->selected_vendor_id,
                'po_date' => $data['po_date'] ?? now()->toDateString(),
                'expected_delivery_date' => $data['expected_delivery_date'] ?? now()->addDays($quotation?->delivery_lead_time_days ?? 7)->toDateString(),
                'delivery_location' => $data['delivery_location'] ?? 'Gudang Utama Site Operasional TAP',
                'payment_terms' => $data['payment_terms'] ?? $quotation?->payment_terms ?? 'TOP 30 Days',
                'purchase_category' => $data['purchase_category'] ?? $pr?->purchase_category ?? 'sparepart',
                'subtotal_amount' => 0,
                'discount_amount' => 0,
                'tax_percent' => $taxPercent,
                'tax_amount' => 0,
                'grand_total' => 0,
                'terms_and_conditions' => $data['terms_and_conditions'] ?? '1. Barang wajib sesuai spesifikasi OEM/Part Number. 2. Pengiriman disertai Surat Jalan & Faktur Pajak. 3. Barang rusak/cacat akan diretur.',
                'approval_status' => 'pending_approval',
                'status' => 'pending_approval',
                'current_approval_step' => 1,
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $subtotal = 0;
            $totalDiscount = 0;
            $totalTax = 0;

            foreach ($items as $line) {
                $invItem = !empty($line['inventory_item_id']) ? InventoryItem::find($line['inventory_item_id']) : null;
                $qty = round((float) ($line['quantity_ordered'] ?? $line['quantity'] ?? 1), 2);
                $price = round((float) ($line['unit_price'] ?? $invItem?->standard_cost ?? 0), 2);
                $disc = round((float) ($line['discount_amount'] ?? 0), 2);

                $lineNet = max(0, ($qty * $price) - $disc);
                $lineTax = round($lineNet * ($taxPercent / 100), 2);
                $lineTotal = round($lineNet + $lineTax, 2);

                $po->items()->create([
                    'purchase_request_item_id' => $line['purchase_request_item_id'] ?? null,
                    'inventory_item_id' => $invItem?->id,
                    'item_name' => $line['item_name'] ?? $invItem?->item_name ?? 'Sparepart Item',
                    'specification' => $line['specification'] ?? $invItem?->specification,
                    'quantity_ordered' => $qty,
                    'quantity_received' => 0,
                    'quantity_rejected' => 0,
                    'quantity_outstanding' => $qty,
                    'unit' => strtoupper($line['unit'] ?? $invItem?->unit_of_measurement ?? 'PCS'),
                    'unit_price' => $price,
                    'discount_amount' => $disc,
                    'tax_amount' => $lineTax,
                    'total_price' => $lineTotal,
                    'status' => 'open',
                ]);

                $subtotal += ($qty * $price);
                $totalDiscount += $disc;
                $totalTax += $lineTax;
            }

            $headerDiscount = isset($data['discount_amount']) && $totalDiscount == 0
                ? round((float) $data['discount_amount'], 2)
                : round($totalDiscount, 2);

            $netAfterDisc = max(0, $subtotal - $headerDiscount);
            $finalTax = round($netAfterDisc * ($taxPercent / 100), 2);
            $grandTotal = round($netAfterDisc + $finalTax, 2);

            $po->update([
                'subtotal_amount' => round($subtotal, 2),
                'discount_amount' => $headerDiscount,
                'tax_amount' => $finalTax,
                'grand_total' => $grandTotal,
            ]);

            if ($pr) {
                $pr->update(['status' => 'converted_to_po']);
            }
            if ($comparison) {
                $comparison->update(['status' => 'converted_to_po']);
            }

            $this->generateApprovalsForDocument(
                'PO',
                $po->id,
                $siteId,
                $po->department_id,
                $po->purchase_category,
                $grandTotal
            );

            return $po->load(['items.inventoryItem', 'vendor', 'approvals.approverPosition', 'site', 'warehouse']);
        });
    }

    /**
     * 7. Approve Purchase Order (PO).
     */
    public function approvePurchaseOrder(PurchaseOrder $po, array $payload = []): PurchaseOrder
    {
        return DB::transaction(function () use ($po, $payload) {
            if ($po->approval_status === 'rejected') {
                throw ValidationException::withMessages([
                    'approval_status' => 'Purchase Order yang telah ditolak tidak dapat disetujui.',
                ]);
            }

            if ($po->approvals()->count() === 0) {
                $this->generateApprovalsForDocument(
                    'PO',
                    $po->id,
                    (int) $po->site_id,
                    $po->department_id,
                    $po->purchase_category ?? 'sparepart',
                    (float) $po->grand_total
                );
            }

            $pendingSteps = $po->approvals()->where('status', 'pending')->orderBy('step_order')->get();
            $approveAll = (bool) ($payload['approve_all'] ?? true);

            if ($pendingSteps->isNotEmpty()) {
                $stepsToApprove = $approveAll ? $pendingSteps : collect([$pendingSteps->first()]);

                foreach ($stepsToApprove as $step) {
                    $step->update([
                        'status' => 'approved',
                        'acted_by' => $payload['acted_by'] ?? auth()->id(),
                        'acted_by_employee_id' => $payload['acted_by_employee_id'] ?? null,
                        'acted_at' => now(),
                        'notes' => $payload['notes'] ?? 'Purchase Order disetujui untuk dikirim ke Vendor.',
                    ]);
                }
            }

            $remaining = $po->approvals()->where('status', 'pending')->orderBy('step_order')->first();

            if ($remaining) {
                $po->update([
                    'approval_status' => 'pending_approval',
                    'current_approval_step' => $remaining->step_order,
                ]);
            } else {
                $po->update([
                    'approval_status' => 'approved',
                    'status' => 'issued',
                    'approved_by' => $payload['acted_by'] ?? auth()->id(),
                    'approved_at' => now(),
                ]);
            }

            return $po->fresh(['items', 'approvals', 'vendor']);
        });
    }

    /**
     * 8. Record Goods Receipt (GRN) against an Approved PO & Integrate with Warehouse Stock.
     * Supports: Full Receiving, Partial Receiving, Over Delivery Review, Under Delivery, Damaged Goods, Rejected Goods.
     * Strict Rule: Only accepted goods on a CONFIRMED receipt increase Warehouse Stock!
     */
    public function recordGoodsReceipt(PurchaseOrder $po, array $data, array $lines): GoodsReceipt
    {
        return DB::transaction(function () use ($po, $data, $lines) {
            if ($po->approval_status !== 'approved') {
                throw ValidationException::withMessages([
                    'purchase_order_id' => 'Barang tidak dapat diterima (Goods Receipt) untuk Purchase Order yang belum Approved.',
                ]);
            }

            $siteId = (int) ($data['site_id'] ?? $po->site_id);
            if ($siteId !== (int) $po->site_id) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Site Goods Receipt harus sama dengan Site Purchase Order.',
                ]);
            }

            $warehouseId = (int) ($data['warehouse_id'] ?? $po->warehouse_id);
            $warehouse = Warehouse::findOrFail($warehouseId);
            if ((int) $warehouse->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Site isolation violation: Gudang penerimaan tidak berada pada Site Purchase Order.',
                ]);
            }

            $grnNumber = $data['grn_number'] ?? $this->generateNumber('GRN-PO');
            $hasOverDelivery = false;
            $hasUnderDelivery = false;

            $preparedLines = [];
            $totalAcceptedValue = 0;

            foreach ($lines as $line) {
                $poItem = PurchaseOrderItem::where('purchase_order_id', $po->id)
                    ->where('id', $line['purchase_order_item_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $qtyOrdered = (float) $poItem->quantity_ordered;
                $qtyPrevReceived = (float) $poItem->quantity_received;
                $remainingPo = max(0, round($qtyOrdered - $qtyPrevReceived, 2));

                $qtyDelivered = round((float) ($line['qty_delivered'] ?? 0), 2);
                $qtyDamaged = round((float) ($line['qty_damaged'] ?? 0), 2);
                $qtyRejected = round((float) ($line['qty_rejected'] ?? 0), 2);

                $qtyAccepted = isset($line['qty_accepted'])
                    ? round((float) $line['qty_accepted'], 2)
                    : max(0, round($qtyDelivered - $qtyDamaged - $qtyRejected, 2));

                $overDelivery = max(0, round($qtyAccepted - $remainingPo, 2));
                $underDelivery = max(0, round($remainingPo - $qtyAccepted, 2));

                if ($overDelivery > 0) {
                    $hasOverDelivery = true;
                }
                if ($underDelivery > 0) {
                    $hasUnderDelivery = true;
                }

                $deliveryStatus = 'full';
                if ($qtyAccepted <= 0 && ($qtyDamaged + $qtyRejected) > 0) {
                    $deliveryStatus = 'rejected';
                } elseif ($overDelivery > 0) {
                    $deliveryStatus = 'over_delivery';
                } elseif ($underDelivery > 0) {
                    $deliveryStatus = 'partial';
                }

                $unitPrice = (float) $poItem->unit_price;
                $acceptedValue = round($qtyAccepted * $unitPrice, 2);
                $totalAcceptedValue += $acceptedValue;

                $preparedLines[] = [
                    'po_item' => $poItem,
                    'purchase_order_item_id' => $poItem->id,
                    'inventory_item_id' => $poItem->inventory_item_id,
                    'warehouse_location_id' => $line['warehouse_location_id'] ?? null,
                    'qty_ordered' => $qtyOrdered,
                    'qty_previously_received' => $qtyPrevReceived,
                    'qty_delivered' => $qtyDelivered,
                    'qty_accepted' => $qtyAccepted,
                    'qty_damaged' => $qtyDamaged,
                    'qty_rejected' => $qtyRejected,
                    'qty_over_delivery' => $overDelivery,
                    'qty_under_delivery' => $underDelivery,
                    'unit' => $poItem->unit,
                    'unit_price' => $unitPrice,
                    'total_accepted_value' => $acceptedValue,
                    'delivery_status' => $deliveryStatus,
                    'condition_notes' => $line['condition_notes'] ?? null,
                ];
            }

            $receiptType = $hasOverDelivery
                ? 'over_delivery_review'
                : ($hasUnderDelivery ? 'partial_receiving' : 'full_receiving');

            $confirmOverDelivery = (bool) ($data['confirm_over_delivery'] ?? false);
            $status = ($hasOverDelivery && !$confirmOverDelivery)
                ? 'pending_over_delivery_review'
                : 'confirmed';

            $grn = GoodsReceipt::create([
                'grn_number' => $grnNumber,
                'purchase_order_id' => $po->id,
                'vendor_id' => $po->vendor_id,
                'site_id' => $siteId,
                'warehouse_id' => $warehouse->id,
                'receipt_date' => $data['receipt_date'] ?? now()->toDateString(),
                'delivery_note_number' => $data['delivery_note_number'] ?? null,
                'received_by' => $data['received_by'] ?? $warehouse->storeman_id,
                'inspected_by' => $data['inspected_by'] ?? null,
                'receipt_type' => $receiptType,
                'status' => $status,
                'total_received_value' => round($totalAcceptedValue, 2),
                'remarks' => $data['remarks'] ?? null,
                'attachment_path' => $data['attachment_path'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($preparedLines as $pLine) {
                $dataLine = $pLine;
                unset($dataLine['po_item']);
                $grn->items()->create($dataLine);
            }

            if ($status === 'confirmed') {
                $this->applyConfirmedGoodsReceiptToWarehouseAndPo($grn);
            }

            return $grn->fresh(['items.poItem', 'items.inventoryItem', 'purchaseOrder', 'warehouse', 'vendor']);
        });
    }

    /**
     * Confirm an Over-Delivery Goods Receipt after review so accepted goods are added to Warehouse stock.
     */
    public function confirmOverDeliveryReceipt(GoodsReceipt $grn): GoodsReceipt
    {
        return DB::transaction(function () use ($grn) {
            if ($grn->status === 'confirmed') {
                return $grn;
            }

            $grn->update(['status' => 'confirmed']);
            $this->applyConfirmedGoodsReceiptToWarehouseAndPo($grn);

            return $grn->fresh(['items', 'purchaseOrder', 'inventoryTransaction']);
        });
    }

    protected function applyConfirmedGoodsReceiptToWarehouseAndPo(GoodsReceipt $grn): void
    {
        $grn->load(['items.poItem', 'purchaseOrder']);
        $po = $grn->purchaseOrder;

        $stockInLines = [];

        foreach ($grn->items as $grnItem) {
            $poItem = $grnItem->poItem;
            $accepted = (float) $grnItem->qty_accepted;
            $rejectedTotal = (float) $grnItem->qty_damaged + (float) $grnItem->qty_rejected;

            $newReceived = round((float) $poItem->quantity_received + $accepted, 2);
            $newRejected = round((float) $poItem->quantity_rejected + $rejectedTotal, 2);
            $newOutstanding = max(0, round((float) $poItem->quantity_ordered - $newReceived, 2));

            $itemStatus = $newReceived > (float) $poItem->quantity_ordered
                ? 'over_delivered'
                : ($newOutstanding <= 0 ? 'received' : ($newReceived > 0 ? 'partial' : 'open'));

            $poItem->update([
                'quantity_received' => $newReceived,
                'quantity_rejected' => $newRejected,
                'quantity_outstanding' => $newOutstanding,
                'status' => $itemStatus,
            ]);

            // STRICT RULE: Only accepted goods (qty_accepted > 0) increase Warehouse Stock!
            if ($accepted > 0 && $grnItem->inventory_item_id) {
                $stockInLines[] = [
                    'inventory_item_id' => $grnItem->inventory_item_id,
                    'warehouse_location_id' => $grnItem->warehouse_location_id,
                    'quantity' => $accepted,
                    'unit' => $grnItem->unit,
                    'unit_cost' => (float) $grnItem->unit_price,
                    'remarks' => "Goods Receipt {$grn->grn_number} dari PO {$po->po_number}",
                ];
            }
        }

        if (!empty($stockInLines)) {
            $invTx = $this->inventoryService->stockIn([
                'document_number' => $this->inventoryService->generateDocumentNumber('INV-GRN'),
                'transaction_date' => $grn->receipt_date->toDateString(),
                'transaction_type' => 'purchase_receiving',
                'site_id' => $grn->site_id,
                'warehouse_id' => $grn->warehouse_id,
                'reference_type' => 'purchase_order',
                'reference_id' => $po->id,
                'reference_document' => "{$po->po_number} / {$grn->grn_number}",
                'vendor_id' => $grn->vendor_id,
                'requester_id' => $grn->received_by,
                'approver_id' => auth()->id(),
                'storeman_id' => $grn->received_by,
                'remarks' => "Penerimaan PO {$po->po_number} via GRN {$grn->grn_number}",
                'created_by' => auth()->id(),
            ], $stockInLines);

            $grn->update(['inventory_transaction_id' => $invTx->id]);
        }

        // Refresh PO items to update PO overall status
        $freshPoItems = $po->items()->get();
        $allReceived = $freshPoItems->every(fn ($i) => (float) $i->quantity_outstanding <= 0);
        $anyReceived = $freshPoItems->contains(fn ($i) => (float) $i->quantity_received > 0);

        $po->update([
            'status' => $allReceived ? 'received' : ($anyReceived ? 'partial_received' : $po->status),
        ]);
    }

    /**
     * 9. Record Vendor Invoice & Perform 3-Way Matching (PO + GRN + Invoice) for Finance Obligation Prep.
     * Strict Rule: Does NOT perform automatic bank payment!
     */
    public function recordVendorInvoice(array $data): VendorInvoice
    {
        return DB::transaction(function () use ($data) {
            $po = PurchaseOrder::findOrFail($data['purchase_order_id']);
            $siteId = (int) ($data['site_id'] ?? $po->site_id);

            if ($siteId !== (int) $po->site_id) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Site Invoice harus sama dengan Site Purchase Order.',
                ]);
            }

            $grn = !empty($data['goods_receipt_id'])
                ? GoodsReceipt::findOrFail($data['goods_receipt_id'])
                : GoodsReceipt::where('purchase_order_id', $po->id)->where('status', 'confirmed')->latest('id')->first();

            $matchedPoAmount = (float) $po->grand_total;
            $confirmedGrnsSum = (float) GoodsReceipt::where('purchase_order_id', $po->id)
                ->where('status', 'confirmed')
                ->sum('total_received_value');

            // Include PO tax ratio on GRN accepted subtotal for fair comparison against total invoice
            $taxMultiplier = 1 + ((float) $po->tax_percent / 100);
            $matchedGrnAmountWithTax = round($confirmedGrnsSum * $taxMultiplier, 2);

            $subtotal = round((float) ($data['subtotal_amount'] ?? $confirmedGrnsSum), 2);
            $taxAmount = isset($data['tax_amount'])
                ? round((float) $data['tax_amount'], 2)
                : round($subtotal * ((float) $po->tax_percent / 100), 2);
            $totalInvoice = isset($data['total_invoice_amount'])
                ? round((float) $data['total_invoice_amount'], 2)
                : round($subtotal + $taxAmount, 2);

            $referenceAmount = $matchedGrnAmountWithTax > 0 ? $matchedGrnAmountWithTax : $matchedPoAmount;
            $variance = round($totalInvoice - $referenceAmount, 2);
            $isMatched = abs($variance) <= 100.0 && $confirmedGrnsSum > 0;

            $invoice = VendorInvoice::create([
                'invoice_number' => $data['invoice_number'] ?? $this->generateNumber('INV-VND'),
                'vendor_invoice_number' => $data['vendor_invoice_number'],
                'invoice_date' => $data['invoice_date'] ?? now()->toDateString(),
                'payment_due_date' => $data['payment_due_date'] ?? now()->addDays(30)->toDateString(),
                'site_id' => $siteId,
                'vendor_id' => $po->vendor_id,
                'purchase_order_id' => $po->id,
                'goods_receipt_id' => $grn?->id,
                'po_reference' => $po->po_number,
                'grn_reference' => $grn?->grn_number,
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_invoice_amount' => $totalInvoice,
                'matched_po_amount' => $matchedPoAmount,
                'matched_grn_amount' => $matchedGrnAmountWithTax,
                'variance_amount' => $variance,
                'is_three_way_matched' => $isMatched,
                'verification_status' => $isMatched ? 'verified' : 'discrepancy',
                'attachment_path' => $data['attachment_path'] ?? null,
                'verified_by' => $isMatched ? auth()->id() : null,
                'verified_at' => $isMatched ? now() : null,
                'remarks' => $data['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // If 3-way matched and PO was fully received, mark PO & PR as completed (Purchase Completion)
            if ($isMatched) {
                $allItemsReceived = $po->items()->where('quantity_outstanding', '>', 0)->count() === 0;
                $po->update([
                    'status' => $allItemsReceived ? 'completed' : 'invoiced',
                ]);
                if ($allItemsReceived && $po->purchase_request_id) {
                    PurchaseRequest::where('id', $po->purchase_request_id)->update(['status' => 'completed']);
                }
            }

            return $invoice->load(['vendor', 'purchaseOrder', 'goodsReceipt', 'site']);
        });
    }

    public function verifyVendorInvoice(VendorInvoice $invoice, string $status = 'ready_for_finance', ?string $remarks = null): VendorInvoice
    {
        return DB::transaction(function () use ($invoice, $status, $remarks) {
            $invoice->update([
                'verification_status' => $status,
                'verified_by' => auth()->id(),
                'verified_at' => now(),
                'remarks' => $remarks ?? $invoice->remarks,
            ]);

            if (in_array($status, ['verified', 'ready_for_finance'], true)) {
                $po = $invoice->purchaseOrder;
                if ($po) {
                    $allItemsReceived = $po->items()->where('quantity_outstanding', '>', 0)->count() === 0;
                    $po->update([
                        'status' => $allItemsReceived ? 'completed' : 'invoiced',
                    ]);
                    if ($allItemsReceived && $po->purchase_request_id) {
                        PurchaseRequest::where('id', $po->purchase_request_id)->update(['status' => 'completed']);
                    }
                }
            }

            return $invoice->fresh(['vendor', 'purchaseOrder', 'goodsReceipt']);
        });
    }
}
