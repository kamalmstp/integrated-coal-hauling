<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\GoodsReceipt;
use App\Models\InventoryBalance;
use App\Models\InventoryItem;
use App\Models\Position;
use App\Models\ProcurementApprovalRule;
use App\Models\PurchaseApproval;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\QuotationComparison;
use App\Models\Rfq;
use App\Models\Site;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorInvoice;
use App\Models\VendorQuotation;
use App\Models\Warehouse;
use App\Services\ProcurementService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ProcurementManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected Site $siteA;
    protected Site $siteB;
    protected Warehouse $whSiteA;
    protected Warehouse $whSiteB;
    protected Department $deptMaint;
    protected InventoryItem $itemFilter;
    protected Vendor $vendorA;
    protected Vendor $vendorB;
    protected ProcurementService $procurementService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::first() ?? User::factory()->create();
        $this->actingAs($this->user);

        $sites = Site::where('is_active', true)->orderBy('id')->get();
        $this->siteA = $sites->first();
        $this->siteB = $sites->skip(1)->first() ?? Site::create([
            'company_id' => $this->siteA->company_id,
            'code' => 'SITE-B-TEST',
            'name' => 'Site B Secondary Coal Project',
            'location' => 'Kalimantan Timur',
            'is_active' => true,
        ]);

        $this->whSiteA = Warehouse::where('site_id', $this->siteA->id)->first();
        $this->whSiteB = Warehouse::where('site_id', $this->siteB->id)->first() ?? Warehouse::create([
            'site_id' => $this->siteB->id,
            'code' => 'WH-SITE-B-01',
            'name' => 'Gudang Utama Site B',
            'location' => 'Area Workshop Site B',
            'is_active' => true,
        ]);

        $this->deptMaint = Department::first();
        $this->itemFilter = InventoryItem::where('is_active', true)->first();

        $vendors = Vendor::where('is_active', true)->orderBy('id')->get();
        $this->vendorA = $vendors->first();
        $this->vendorB = $vendors->skip(1)->first() ?? Vendor::create([
            'vendor_code' => 'VND-TEST-02',
            'name' => 'PT Mitra Suku Cadang Tambang',
            'category' => 'sparepart',
            'is_active' => true,
        ]);

        $this->procurementService = app(ProcurementService::class);
    }

    public function test_purchase_request_creation_and_configurable_approval_workflow(): void
    {
        // Configure dynamic database approval rules (verifying NO hardcoded nominal thresholds)
        ProcurementApprovalRule::query()->delete();
        $posSupervisor = Position::first();
        $posManager = Position::skip(1)->first() ?? $posSupervisor;

        $ruleStep1 = ProcurementApprovalRule::create([
            'rule_code' => 'RULE-TEST-STEP1',
            'rule_name' => 'Verifikasi Supervisor Logistik',
            'document_type' => 'PR',
            'site_id' => $this->siteA->id,
            'department_id' => $this->deptMaint->id,
            'purchase_category' => 'sparepart',
            'min_amount' => 0,
            'max_amount' => null,
            'step_order' => 1,
            'approver_position_id' => $posSupervisor?->id,
            'approver_role_label' => 'Logistics Supervisor',
            'is_active' => true,
        ]);

        $ruleStep2 = ProcurementApprovalRule::create([
            'rule_code' => 'RULE-TEST-STEP2',
            'rule_name' => 'Otorisasi Site Project Manager (> 20 Juta)',
            'document_type' => 'PR',
            'site_id' => $this->siteA->id,
            'department_id' => $this->deptMaint->id,
            'purchase_category' => 'sparepart',
            'min_amount' => 20000000,
            'max_amount' => null,
            'step_order' => 2,
            'approver_position_id' => $posManager?->id,
            'approver_role_label' => 'Site Project Manager',
            'is_active' => true,
        ]);

        // Create PR with value Rp 35,000,000 (triggers both Step 1 and Step 2 dynamically from DB)
        $pr = $this->procurementService->createPurchaseRequest([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'department_id' => $this->deptMaint->id,
            'request_date' => now()->toDateString(),
            'required_date' => now()->addDays(7)->toDateString(),
            'source' => 'maintenance_request',
            'purchase_category' => 'sparepart',
            'priority' => 'urgent',
            'purpose' => 'Overhaul Transmisi DT-015',
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'specification' => 'Genuine OEM Spec',
                'requested_qty' => 10,
                'unit' => 'PCS',
                'estimated_unit_price' => 3500000,
                'purpose' => 'Overhaul DT-015',
            ],
        ]);

        $this->assertEquals('pending_approval', $pr->status);
        $this->assertEquals(35000000, (float) $pr->estimated_total);
        $this->assertCount(2, $pr->approvals);
        $this->assertEquals($ruleStep1->id, $pr->approvals[0]->approval_rule_id);
        $this->assertEquals($ruleStep2->id, $pr->approvals[1]->approval_rule_id);

        // Step 1 approval only -> PR remains pending_approval on step 2
        $prAfterStep1 = $this->procurementService->approvePurchaseRequest($pr, [
            'approve_all' => false,
            'notes' => 'Step 1 OK oleh Supervisor',
        ]);
        $this->assertEquals('pending_approval', $prAfterStep1->status);
        $this->assertEquals(2, $prAfterStep1->current_approval_step);

        // Step 2 approval -> PR becomes approved
        $prAfterStep2 = $this->procurementService->approvePurchaseRequest($prAfterStep1, [
            'approve_all' => false,
            'notes' => 'Step 2 Final OK oleh Site Manager',
        ]);
        $this->assertEquals('approved', $prAfterStep2->status);
        $this->assertEquals(0, PurchaseApproval::where('purchase_request_id', $pr->id)->where('status', 'pending')->count());
    }

    public function test_rfq_vendor_invitation_quotation_recording_and_vendor_comparison(): void
    {
        $pr = $this->procurementService->createPurchaseRequest([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'department_id' => $this->deptMaint->id,
            'source' => 'warehouse_reorder',
            'purchase_category' => 'sparepart',
            'priority' => 'high',
            'purpose' => 'Restock Filter Oli & Solar',
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'requested_qty' => 20,
                'unit' => 'PCS',
                'estimated_unit_price' => 500000,
            ],
        ]);

        $pr = $this->procurementService->approvePurchaseRequest($pr, ['approve_all' => true]);
        $this->assertEquals('approved', $pr->status);

        // Create RFQ and invite 2 vendors
        $rfq = $this->procurementService->createRfq($pr, [
            'title' => 'RFQ Pengadaan Filter Oli Genuine',
            'issue_date' => now()->toDateString(),
            'closing_date' => now()->addDays(5)->toDateString(),
            'vendor_ids' => [$this->vendorA->id, $this->vendorB->id],
        ]);

        $this->assertEquals('open', $rfq->status);
        $this->assertCount(2, $rfq->invitedVendors);
        $this->assertEquals('rfq_process', $pr->fresh()->status);

        $prItem = $pr->items->first();

        // Record Quotation 1 (Vendor A: Lower price Rp 450,000, Delivery 7 days, TOP 30 Days)
        $qVendorA = $this->procurementService->recordVendorQuotation($rfq, [
            'vendor_id' => $this->vendorA->id,
            'delivery_lead_time_days' => 7,
            'payment_terms' => 'TOP 30 Days',
            'attachment_path' => 'procurement/quotations/vendor-a-quote.pdf',
            'remarks' => 'Ready stock Balikpapan',
        ], [
            [
                'purchase_request_item_id' => $prItem->id,
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'quantity' => 20,
                'unit' => 'PCS',
                'unit_price' => 450000,
                'discount_amount' => 0,
                'tax_rate' => 11,
            ],
        ]);

        // Record Quotation 2 (Vendor B: Higher price Rp 490,000, Fastest delivery 3 days, TOP 45 Days)
        $qVendorB = $this->procurementService->recordVendorQuotation($rfq, [
            'vendor_id' => $this->vendorB->id,
            'delivery_lead_time_days' => 3,
            'payment_terms' => 'TOP 45 Days',
            'attachment_path' => 'procurement/quotations/vendor-b-quote.pdf',
            'remarks' => 'Express air freight',
        ], [
            [
                'purchase_request_item_id' => $prItem->id,
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'quantity' => 20,
                'unit' => 'PCS',
                'unit_price' => 490000,
                'discount_amount' => 0,
                'tax_rate' => 11,
            ],
        ]);

        // Run Multi-Criteria Vendor Comparison & Select Vendor A
        $comparison = $this->procurementService->compareAndSelectVendor(
            $rfq,
            $qVendorA->id,
            'Dipilih Vendor A karena harga termurah dengan lead time 7 hari masih sesuai jadwal.'
        );

        $this->assertEquals('completed', $comparison->status);
        $this->assertEquals($this->vendorA->id, $comparison->selected_vendor_id);
        $this->assertEquals($qVendorA->id, $comparison->lowest_price_quotation_id);
        $this->assertEquals($qVendorB->id, $comparison->fastest_delivery_quotation_id);
        $this->assertEquals($qVendorB->id, $comparison->best_payment_terms_quotation_id);
        $this->assertEquals('awarded', $rfq->fresh()->status);
        $this->assertEquals('selected', $qVendorA->fresh()->status);
        $this->assertEquals('rejected', $qVendorB->fresh()->status);
    }

    public function test_purchase_order_creation_approval_and_print_pdf_view(): void
    {
        $po = $this->procurementService->createPurchaseOrder([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'department_id' => $this->deptMaint->id,
            'vendor_id' => $this->vendorA->id,
            'po_date' => now()->toDateString(),
            'expected_delivery_date' => now()->addDays(7)->toDateString(),
            'delivery_location' => 'Gudang Utama Site A',
            'payment_terms' => 'TOP 30 Days',
            'purchase_category' => 'sparepart',
            'tax_percent' => 11,
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'quantity_ordered' => 10,
                'unit' => 'PCS',
                'unit_price' => 1000000,
                'discount_amount' => 0,
            ],
        ]);

        $this->assertEquals('pending_approval', $po->approval_status);
        $this->assertEquals(10000000, (float) $po->subtotal_amount);
        $this->assertEquals(1100000, (float) $po->tax_amount);
        $this->assertEquals(11100000, (float) $po->grand_total);

        // Approve PO
        $poApproved = $this->procurementService->approvePurchaseOrder($po, ['approve_all' => true]);
        $this->assertEquals('approved', $poApproved->approval_status);
        $this->assertEquals('issued', $poApproved->status);

        // Test Print / PDF View endpoint
        $response = $this->get("/procurement/purchase-orders/{$po->id}/print");
        $response->assertStatus(200);
    }

    public function test_partial_and_full_goods_receipt_damaged_rejected_handling_and_warehouse_mwa_integration(): void
    {
        // Check initial stock of itemFilter in whSiteA
        $initialQty = (float) InventoryBalance::where('warehouse_id', $this->whSiteA->id)
            ->where('inventory_item_id', $this->itemFilter->id)
            ->sum('on_hand_qty');

        // Create and approve PO for 10 PCS @ Rp 500,000
        $po = $this->procurementService->createPurchaseOrder([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'vendor_id' => $this->vendorA->id,
            'po_date' => now()->toDateString(),
            'expected_delivery_date' => now()->addDays(5)->toDateString(),
            'payment_terms' => 'TOP 30 Days',
            'tax_percent' => 11,
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'quantity_ordered' => 10,
                'unit' => 'PCS',
                'unit_price' => 500000,
            ],
        ]);
        $po = $this->procurementService->approvePurchaseOrder($po, ['approve_all' => true]);
        $poItem = $po->items->first();

        // 1. PARTIAL RECEIVING with Damaged & Rejected items:
        // Vendor delivers 6 PCS: 4 Good (Accepted), 1 Damaged, 1 Rejected
        // STRICT RULE: Only 4 Accepted PCS must be added to Warehouse Stock!
        $grnPartial = $this->procurementService->recordGoodsReceipt($po, [
            'warehouse_id' => $this->whSiteA->id,
            'receipt_date' => now()->toDateString(),
            'delivery_note_number' => 'SJ-PARTIAL-001',
        ], [
            [
                'purchase_order_item_id' => $poItem->id,
                'qty_delivered' => 6,
                'qty_accepted' => 4,
                'qty_damaged' => 1,
                'qty_rejected' => 1,
                'condition_notes' => '4 Good, 1 Penyok (Damaged), 1 Salah Spec (Rejected)',
            ],
        ]);

        $this->assertEquals('confirmed', $grnPartial->status);
        $this->assertEquals('partial_receiving', $grnPartial->receipt_type);
        $this->assertEquals(2000000, (float) $grnPartial->total_received_value); // 4 * 500,000
        $this->assertNotNull($grnPartial->inventory_transaction_id);

        $stockAfterPartial = (float) InventoryBalance::where('warehouse_id', $this->whSiteA->id)
            ->where('inventory_item_id', $this->itemFilter->id)
            ->sum('on_hand_qty');
        $this->assertEquals($initialQty + 4, $stockAfterPartial);

        $po->refresh();
        $poItem->refresh();
        $this->assertEquals('partial_received', $po->status);
        $this->assertEquals(4, (float) $poItem->quantity_received);
        $this->assertEquals(2, (float) $poItem->quantity_rejected);
        $this->assertEquals(6, (float) $poItem->quantity_outstanding);

        // 2. FULL RECEIVING of remaining 6 PCS (All Good)
        $grnFull = $this->procurementService->recordGoodsReceipt($po, [
            'warehouse_id' => $this->whSiteA->id,
            'receipt_date' => now()->toDateString(),
            'delivery_note_number' => 'SJ-FULL-002',
        ], [
            [
                'purchase_order_item_id' => $poItem->id,
                'qty_delivered' => 6,
                'qty_accepted' => 6,
                'qty_damaged' => 0,
                'qty_rejected' => 0,
            ],
        ]);

        $this->assertEquals('confirmed', $grnFull->status);
        $this->assertEquals('full_receiving', $grnFull->receipt_type);

        $stockAfterFull = (float) InventoryBalance::where('warehouse_id', $this->whSiteA->id)
            ->where('inventory_item_id', $this->itemFilter->id)
            ->sum('on_hand_qty');
        $this->assertEquals($initialQty + 10, $stockAfterFull);

        $po->refresh();
        $this->assertEquals('received', $po->status);
    }

    public function test_over_delivery_review_holds_warehouse_stock_until_confirmed(): void
    {
        $initialQty = (float) InventoryBalance::where('warehouse_id', $this->whSiteA->id)
            ->where('inventory_item_id', $this->itemFilter->id)
            ->sum('on_hand_qty');

        $po = $this->procurementService->createPurchaseOrder([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'vendor_id' => $this->vendorA->id,
            'po_date' => now()->toDateString(),
            'expected_delivery_date' => now()->addDays(5)->toDateString(),
            'payment_terms' => 'TOP 30 Days',
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'quantity_ordered' => 5,
                'unit' => 'PCS',
                'unit_price' => 400000,
            ],
        ]);
        $po = $this->procurementService->approvePurchaseOrder($po, ['approve_all' => true]);
        $poItem = $po->items->first();

        // Deliver 7 PCS against 5 ordered without confirm_over_delivery flag
        $grnOver = $this->procurementService->recordGoodsReceipt($po, [
            'warehouse_id' => $this->whSiteA->id,
            'receipt_date' => now()->toDateString(),
            'confirm_over_delivery' => false,
        ], [
            [
                'purchase_order_item_id' => $poItem->id,
                'qty_delivered' => 7,
                'qty_accepted' => 7,
                'qty_damaged' => 0,
                'qty_rejected' => 0,
            ],
        ]);

        $this->assertEquals('over_delivery_review', $grnOver->receipt_type);
        $this->assertEquals('pending_over_delivery_review', $grnOver->status);
        $this->assertNull($grnOver->inventory_transaction_id);

        // Stock must NOT have increased yet
        $stockWhilePending = (float) InventoryBalance::where('warehouse_id', $this->whSiteA->id)
            ->where('inventory_item_id', $this->itemFilter->id)
            ->sum('on_hand_qty');
        $this->assertEquals($initialQty, $stockWhilePending);

        // Confirm Over-Delivery after review -> now stock increases by 7
        $grnConfirmed = $this->procurementService->confirmOverDeliveryReceipt($grnOver);
        $this->assertEquals('confirmed', $grnConfirmed->status);
        $this->assertNotNull($grnConfirmed->inventory_transaction_id);

        $stockAfterConfirm = (float) InventoryBalance::where('warehouse_id', $this->whSiteA->id)
            ->where('inventory_item_id', $this->itemFilter->id)
            ->sum('on_hand_qty');
        $this->assertEquals($initialQty + 7, $stockAfterConfirm);
    }

    public function test_vendor_invoice_three_way_matching_and_purchase_completion(): void
    {
        $pr = $this->procurementService->createPurchaseRequest([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'department_id' => $this->deptMaint->id,
            'source' => 'operational_requirement',
            'purchase_category' => 'sparepart',
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'requested_qty' => 4,
                'unit' => 'PCS',
                'estimated_unit_price' => 1000000,
            ],
        ]);
        $pr = $this->procurementService->approvePurchaseRequest($pr, ['approve_all' => true]);

        $po = $this->procurementService->createPurchaseOrder([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteA->id,
            'purchase_request_id' => $pr->id,
            'vendor_id' => $this->vendorA->id,
            'tax_percent' => 11,
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'quantity_ordered' => 4,
                'unit' => 'PCS',
                'unit_price' => 1000000,
            ],
        ]);
        $po = $this->procurementService->approvePurchaseOrder($po, ['approve_all' => true]);

        $grn = $this->procurementService->recordGoodsReceipt($po, [
            'warehouse_id' => $this->whSiteA->id,
            'receipt_date' => now()->toDateString(),
        ], [
            [
                'purchase_order_item_id' => $po->items->first()->id,
                'qty_delivered' => 4,
                'qty_accepted' => 4,
                'qty_damaged' => 0,
                'qty_rejected' => 0,
            ],
        ]);

        // Record matching Vendor Invoice (Subtotal 4,000,000 + PPN 440,000 = 4,440,000)
        $invoice = $this->procurementService->recordVendorInvoice([
            'vendor_invoice_number' => 'INV-VND-2026-888',
            'invoice_date' => now()->toDateString(),
            'payment_due_date' => now()->addDays(30)->toDateString(),
            'site_id' => $this->siteA->id,
            'purchase_order_id' => $po->id,
            'goods_receipt_id' => $grn->id,
            'subtotal_amount' => 4000000,
            'tax_amount' => 440000,
            'total_invoice_amount' => 4440000,
        ]);

        $this->assertTrue($invoice->is_three_way_matched);
        $this->assertEquals(0, (float) $invoice->variance_amount);
        $this->assertEquals('verified', $invoice->verification_status);

        // Verify for Finance AP Obligation (Purchase Completion)
        $verifiedInv = $this->procurementService->verifyVendorInvoice($invoice, 'ready_for_finance');
        $this->assertEquals('ready_for_finance', $verifiedInv->verification_status);
        $this->assertEquals('completed', $po->fresh()->status);
        $this->assertEquals('completed', $pr->fresh()->status);
    }

    public function test_site_isolation_enforced_across_procurement_workflow(): void
    {
        // Attempt to create PR on Site A using a Warehouse from Site B -> must fail
        $this->expectException(ValidationException::class);

        $this->procurementService->createPurchaseRequest([
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->whSiteB->id,
            'department_id' => $this->deptMaint->id,
            'source' => 'general_purchase',
        ], [
            [
                'inventory_item_id' => $this->itemFilter->id,
                'item_name' => $this->itemFilter->item_name,
                'requested_qty' => 2,
                'unit' => 'PCS',
                'estimated_unit_price' => 250000,
            ],
        ]);
    }

    public function test_all_procurement_pages_and_dashboard_render_successfully(): void
    {
        $routes = [
            '/procurement/dashboard',
            '/procurement/purchase-requests',
            '/procurement/rfqs',
            '/procurement/purchase-orders',
            '/procurement/goods-receipts',
            '/procurement/invoices',
        ];

        foreach ($routes as $uri) {
            $response = $this->get($uri);
            $response->assertStatus(200);
        }
    }
}
