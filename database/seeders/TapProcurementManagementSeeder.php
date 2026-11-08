<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\Position;
use App\Models\ProcurementApprovalRule;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Warehouse;
use App\Services\ProcurementService;
use Illuminate\Database\Seeder;

class TapProcurementManagementSeeder extends Seeder
{
    public function run(): void
    {
        $procurementService = app(ProcurementService::class);

        $sites = Site::orderBy('id')->get();
        if ($sites->isEmpty()) {
            return;
        }

        $site1 = $sites->first();
        $site2 = $sites->skip(1)->first() ?? $site1;

        $departments = Department::orderBy('id')->get();
        $deptMaint = $departments->first();

        $positions = Position::orderBy('id')->get();
        $posSupervisor = $positions->first();
        $posManager = $positions->skip(1)->first() ?? $posSupervisor;
        $posDirector = $positions->skip(2)->first() ?? $posManager;

        $employees = Employee::orderBy('id')->get();
        $requester = $employees->first();
        $adminUser = User::first();

        // 1. Seed Configurable Approval Rules (Database-driven, never hardcoded)
        $rulesData = [
            [
                'rule_code' => 'APR-STEP1-SPV',
                'rule_name' => 'Verifikasi Kepala Gudang / Supervisor Departemen',
                'document_type' => 'ALL',
                'site_id' => null,
                'department_id' => null,
                'purchase_category' => null,
                'min_amount' => 0,
                'max_amount' => null,
                'step_order' => 1,
                'approver_position_id' => $posSupervisor?->id,
                'approver_role_label' => $posSupervisor?->name ?? 'Department Supervisor',
                'is_active' => true,
            ],
            [
                'rule_code' => 'APR-STEP2-SM',
                'rule_name' => 'Otorisasi Site Manager Operasional',
                'document_type' => 'ALL',
                'site_id' => null,
                'department_id' => null,
                'purchase_category' => null,
                'min_amount' => 15000000,
                'max_amount' => null,
                'step_order' => 2,
                'approver_position_id' => $posManager?->id,
                'approver_role_label' => $posManager?->name ?? 'Site Manager',
                'is_active' => true,
            ],
            [
                'rule_code' => 'APR-STEP3-DIR',
                'rule_name' => 'Otorisasi Manajemen Eksekutif / Direktur Procurement',
                'document_type' => 'PO',
                'site_id' => null,
                'department_id' => null,
                'purchase_category' => null,
                'min_amount' => 75000000,
                'max_amount' => null,
                'step_order' => 3,
                'approver_position_id' => $posDirector?->id,
                'approver_role_label' => $posDirector?->name ?? 'Procurement Director',
                'is_active' => true,
            ],
        ];

        foreach ($rulesData as $rule) {
            ProcurementApprovalRule::updateOrCreate(['rule_code' => $rule['rule_code']], $rule);
        }

        // 2. Ensure at least 3 Active Vendors for Multi-Vendor RFQ Comparison
        $vendorsData = [
            [
                'vendor_code' => 'VND-TAP-001',
                'name' => 'PT Mitra Suku Cadang Alat Berat Nusantara',
                'vendor_type' => 'Sparepart & Filter Supplier',
                'address' => 'Jl. Mulawarman No. 88, Balikpapan, Kalimantan Timur',
                'contact_person' => 'Hendra Wijaya',
                'phone' => '0542-7654321',
                'email' => 'sales@mitrasukucadang.co.id',
                'npwp' => '01.234.567.8-721.000',
                'is_active' => true,
            ],
            [
                'vendor_code' => 'VND-TAP-002',
                'name' => 'PT Borneo Ban & Pelumas Perkasa',
                'vendor_type' => 'Tire & Lubricant Distributor',
                'address' => 'Kawasan Industri Kariangau Blok D4, Balikpapan',
                'contact_person' => 'Rina Kusuma',
                'phone' => '0542-8877665',
                'email' => 'quote@borneoban.co.id',
                'npwp' => '02.345.678.9-721.000',
                'is_active' => true,
            ],
            [
                'vendor_code' => 'VND-TAP-003',
                'name' => 'PT Global Diesel & Hydraulic Indotama',
                'vendor_type' => 'OEM Engine & Hydraulic Specialist',
                'address' => 'Jl. Ahmad Yani KM 12, Banjarmasin, Kalimantan Selatan',
                'contact_person' => 'Dedi Kurniawan',
                'phone' => '0511-4455667',
                'email' => 'procurement@globaldiesel.co.id',
                'npwp' => '03.456.789.0-731.000',
                'is_active' => true,
            ],
        ];

        $vendorModels = [];
        foreach ($vendorsData as $vData) {
            $vendorModels[] = Vendor::updateOrCreate(['vendor_code' => $vData['vendor_code']], $vData);
        }

        $v1 = $vendorModels[0];
        $v2 = $vendorModels[1];
        $v3 = $vendorModels[2];

        $whMcmMain = Warehouse::where('code', 'WH-MCM-MAIN')->first() ?? Warehouse::where('site_id', $site1->id)->first();
        $whMcmTire = Warehouse::where('code', 'WH-MCM-TIRE')->first() ?? $whMcmMain;
        $whAgmMain = Warehouse::where('site_id', $site2->id)->first() ?? $whMcmMain;

        $itemFilter = InventoryItem::where('item_code', 'ITM-FLT-001')->first() ?? InventoryItem::first();
        $itemBrake = InventoryItem::where('item_code', 'ITM-SPR-001')->first() ?? $itemFilter;
        $itemTire = InventoryItem::where('item_code', 'ITM-TIR-001')->first() ?? $itemFilter;

        if (!$whMcmMain || !$itemFilter) {
            return;
        }

        if (PurchaseOrder::count() === 0) {
            // WORKFLOW 1: End-to-End Completed Cycle (PR -> Approval -> RFQ -> Quotations -> Comparison -> PO -> GRN -> Invoice -> Completed)
            $pr1 = $procurementService->createPurchaseRequest([
                'pr_number' => 'PR-TAP-20261102-001',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'department_id' => $deptMaint?->id,
                'request_date' => now()->subDays(10)->toDateString(),
                'required_date' => now()->subDays(3)->toDateString(),
                'source' => 'warehouse_reorder',
                'purchase_category' => 'sparepart',
                'priority' => 'high',
                'purpose' => 'Replenishment stok Filter Oli LF9009 dan Kampas Rem DT untuk servis PM 250 HM',
                'requested_by' => $requester?->id,
                'created_by' => $adminUser?->id,
            ], [
                [
                    'inventory_item_id' => $itemFilter->id,
                    'item_name' => $itemFilter->item_name,
                    'specification' => $itemFilter->specification,
                    'requested_qty' => 20,
                    'unit' => $itemFilter->unit_of_measurement,
                    'estimated_unit_price' => 425000,
                ],
                [
                    'inventory_item_id' => $itemBrake->id,
                    'item_name' => $itemBrake->item_name,
                    'specification' => $itemBrake->specification,
                    'requested_qty' => 4,
                    'unit' => $itemBrake->unit_of_measurement,
                    'estimated_unit_price' => 1850000,
                ],
            ]);

            $procurementService->approvePurchaseRequest($pr1, ['approve_all' => true, 'notes' => 'Disetujui penuh untuk tender RFQ']);

            $rfq1 = $procurementService->createRfq($pr1->fresh(), [
                'rfq_number' => 'RFQ-TAP-20261103-001',
                'issue_date' => now()->subDays(9)->toDateString(),
                'closing_date' => now()->subDays(6)->toDateString(),
                'title' => 'Pengadaan Filter Oli Fleetguard & Brake Lining Kit DT Site MCM',
                'vendor_ids' => [$v1->id, $v3->id],
            ]);

            $pr1Items = $pr1->items()->get();

            // Quotation A (Vendor 1 - Best Price & TOP 30 Days)
            $q1 = $procurementService->recordVendorQuotation($rfq1, [
                'quotation_number' => 'QTN-MSC-2026-101',
                'vendor_id' => $v1->id,
                'quotation_date' => now()->subDays(8)->toDateString(),
                'delivery_lead_time_days' => 5,
                'payment_terms' => 'TOP 30 Days',
                'remarks' => 'Harga kontrak korporat termasuk pengiriman ke Gudang MCM',
            ], [
                [
                    'purchase_request_item_id' => $pr1Items[0]->id,
                    'inventory_item_id' => $itemFilter->id,
                    'item_name' => $itemFilter->item_name,
                    'quantity' => 20,
                    'unit' => 'PCS',
                    'unit_price' => 420000,
                    'tax_rate' => 11,
                    'brand_offered' => 'Fleetguard Original',
                ],
                [
                    'purchase_request_item_id' => $pr1Items[1]->id,
                    'inventory_item_id' => $itemBrake->id,
                    'item_name' => $itemBrake->item_name,
                    'quantity' => 4,
                    'unit' => 'SET',
                    'unit_price' => 1800000,
                    'tax_rate' => 11,
                    'brand_offered' => 'Scania OEM',
                ],
            ]);

            // Quotation B (Vendor 3 - Higher Price, TOP 45 Days)
            $procurementService->recordVendorQuotation($rfq1, [
                'quotation_number' => 'QTN-GDH-2026-204',
                'vendor_id' => $v3->id,
                'quotation_date' => now()->subDays(8)->toDateString(),
                'delivery_lead_time_days' => 7,
                'payment_terms' => 'TOP 45 Days',
                'remarks' => 'Ready stock Banjarmasin',
            ], [
                [
                    'purchase_request_item_id' => $pr1Items[0]->id,
                    'inventory_item_id' => $itemFilter->id,
                    'item_name' => $itemFilter->item_name,
                    'quantity' => 20,
                    'unit' => 'PCS',
                    'unit_price' => 445000,
                    'tax_rate' => 11,
                    'brand_offered' => 'Fleetguard Original',
                ],
                [
                    'purchase_request_item_id' => $pr1Items[1]->id,
                    'inventory_item_id' => $itemBrake->id,
                    'item_name' => $itemBrake->item_name,
                    'quantity' => 4,
                    'unit' => 'SET',
                    'unit_price' => 1920000,
                    'tax_rate' => 11,
                    'brand_offered' => 'Scania OEM',
                ],
            ]);

            // Compare & Select Vendor 1
            $cmp1 = $procurementService->compareAndSelectVendor(
                $rfq1->fresh(),
                $q1->id,
                'PT Mitra Suku Cadang dipilih karena menawarkan harga total terendah dengan lead time pengiriman tercepat (5 hari).'
            );

            // Create & Approve PO 1
            $po1 = $procurementService->createPurchaseOrder([
                'po_number' => 'PO-TAP-20261104-001',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'department_id' => $deptMaint?->id,
                'purchase_request_id' => $pr1->id,
                'rfq_id' => $rfq1->id,
                'quotation_comparison_id' => $cmp1->id,
                'vendor_quotation_id' => $q1->id,
                'vendor_id' => $v1->id,
                'po_date' => now()->subDays(7)->toDateString(),
                'expected_delivery_date' => now()->subDays(2)->toDateString(),
                'delivery_location' => 'Gudang Utama Sparepart MCM Blok A1',
                'payment_terms' => 'TOP 30 Days',
                'purchase_category' => 'sparepart',
            ]);

            $procurementService->approvePurchaseOrder($po1, ['approve_all' => true]);
            $po1Items = $po1->items()->get();

            // Full Goods Receipt for PO 1
            $grn1 = $procurementService->recordGoodsReceipt($po1->fresh(), [
                'grn_number' => 'GRN-PO-20261106-001',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'receipt_date' => now()->subDays(2)->toDateString(),
                'delivery_note_number' => 'SJ-MSC-2026-8891',
                'received_by' => $requester?->id,
                'remarks' => 'Seluruh barang diterima lengkap sesuai PO dalam kondisi baik (Full Receiving)',
            ], [
                [
                    'purchase_order_item_id' => $po1Items[0]->id,
                    'qty_delivered' => 20,
                    'qty_accepted' => 20,
                    'qty_damaged' => 0,
                    'qty_rejected' => 0,
                ],
                [
                    'purchase_order_item_id' => $po1Items[1]->id,
                    'qty_delivered' => 4,
                    'qty_accepted' => 4,
                    'qty_damaged' => 0,
                    'qty_rejected' => 0,
                ],
            ]);

            // Record & Verify Vendor Invoice (3-Way Matched)
            $inv1 = $procurementService->recordVendorInvoice([
                'invoice_number' => 'INV-TAP-20261107-001',
                'vendor_invoice_number' => 'FKT-MSC-2026-11092',
                'invoice_date' => now()->subDay()->toDateString(),
                'payment_due_date' => now()->addDays(29)->toDateString(),
                'site_id' => $site1->id,
                'purchase_order_id' => $po1->id,
                'goods_receipt_id' => $grn1->id,
                'subtotal_amount' => 15600000,
                'tax_amount' => 1716000,
                'total_invoice_amount' => 17316000,
                'remarks' => '3-Way Matching PO + GRN + Faktur Pajak sesuai 100%. Siap dijadwalkan pada modul Finance.',
            ]);
            $procurementService->verifyVendorInvoice($inv1, 'ready_for_finance');

            // WORKFLOW 2: Partial Delivery PO with Damaged Item Rejection
            $pr2 = $procurementService->createPurchaseRequest([
                'pr_number' => 'PR-TAP-20261105-002',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmTire->id,
                'department_id' => $deptMaint?->id,
                'request_date' => now()->subDays(6)->toDateString(),
                'required_date' => now()->addDays(3)->toDateString(),
                'source' => 'maintenance_request',
                'purchase_category' => 'tire_tyre',
                'priority' => 'critical',
                'purpose' => 'Pengadaan Ban Bridgestone 11.00 R20 untuk penggantian ban armada hauling',
                'requested_by' => $requester?->id,
                'created_by' => $adminUser?->id,
            ], [
                [
                    'inventory_item_id' => $itemTire->id,
                    'item_name' => $itemTire->item_name,
                    'specification' => $itemTire->specification,
                    'requested_qty' => 10,
                    'unit' => 'PCS',
                    'estimated_unit_price' => 6450000,
                ],
            ]);
            $procurementService->approvePurchaseRequest($pr2, ['approve_all' => true]);

            $po2 = $procurementService->createPurchaseOrder([
                'po_number' => 'PO-TAP-20261105-002',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmTire->id,
                'department_id' => $deptMaint?->id,
                'purchase_request_id' => $pr2->id,
                'vendor_id' => $v2->id,
                'po_date' => now()->subDays(5)->toDateString(),
                'expected_delivery_date' => now()->addDays(2)->toDateString(),
                'delivery_location' => 'Tire & Rim Yard MCM Blok B2',
                'payment_terms' => 'TOP 45 Days',
                'purchase_category' => 'tire_tyre',
            ], [
                [
                    'purchase_request_item_id' => $pr2->items->first()->id,
                    'inventory_item_id' => $itemTire->id,
                    'item_name' => $itemTire->item_name,
                    'quantity_ordered' => 10,
                    'unit' => 'PCS',
                    'unit_price' => 6400000,
                ],
            ]);
            $procurementService->approvePurchaseOrder($po2, ['approve_all' => true]);

            // Partial Goods Receipt: 6 delivered, 1 damaged/rejected, 5 accepted -> 5 remaining outstanding
            $procurementService->recordGoodsReceipt($po2->fresh(), [
                'grn_number' => 'GRN-PO-20261107-002',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmTire->id,
                'receipt_date' => now()->subDay()->toDateString(),
                'delivery_note_number' => 'SJ-BBP-2026-0412',
                'received_by' => $requester?->id,
                'remarks' => 'Pengiriman tahap 1 sebanyak 6 ban (5 diterima baik masuk stok, 1 cacat sidewall ditolak/retur). Sisa 5 ban outstanding.',
            ], [
                [
                    'purchase_order_item_id' => $po2->items->first()->id,
                    'qty_delivered' => 6,
                    'qty_accepted' => 5,
                    'qty_damaged' => 1,
                    'qty_rejected' => 0,
                    'condition_notes' => '1 PCS cacat bead wire dikembalikan ke ekspedisi vendor',
                ],
            ]);

            // WORKFLOW 3: Overdue PO (for Dashboard Overdue Alert) & Pending PR (Site 2 AGM)
            $po3 = $procurementService->createPurchaseOrder([
                'po_number' => 'PO-TAP-20261101-003',
                'site_id' => $site2->id,
                'warehouse_id' => $whAgmMain->id,
                'department_id' => $deptMaint?->id,
                'vendor_id' => $v3->id,
                'po_date' => now()->subDays(12)->toDateString(),
                'expected_delivery_date' => now()->subDays(3)->toDateString(), // Overdue!
                'delivery_location' => 'Gudang Utama Sparepart AGM KM 18',
                'payment_terms' => 'TOP 30 Days',
                'purchase_category' => 'engine_parts',
            ], [
                [
                    'inventory_item_id' => $itemFilter->id,
                    'item_name' => $itemFilter->item_name,
                    'quantity_ordered' => 15,
                    'unit' => 'PCS',
                    'unit_price' => 430000,
                ],
            ]);
            $procurementService->approvePurchaseOrder($po3, ['approve_all' => true]);

            // Pending Approval PR
            $procurementService->createPurchaseRequest([
                'pr_number' => 'PR-TAP-20261108-004',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'department_id' => $deptMaint?->id,
                'request_date' => now()->toDateString(),
                'required_date' => now()->addDays(5)->toDateString(),
                'source' => 'operational_requirement',
                'purchase_category' => 'operational',
                'priority' => 'normal',
                'purpose' => 'Kebutuhan tambahan filter solar operasional hauling shift malam',
                'requested_by' => $requester?->id,
                'created_by' => $adminUser?->id,
            ], [
                [
                    'inventory_item_id' => $itemFilter->id,
                    'item_name' => $itemFilter->item_name,
                    'requested_qty' => 12,
                    'unit' => 'PCS',
                    'estimated_unit_price' => 425000,
                ],
            ]);
        }
    }
}
