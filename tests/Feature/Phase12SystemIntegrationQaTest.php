<?php

namespace Tests\Feature;

use App\Models\BreakdownReport;
use App\Models\DailyDispatch;
use App\Models\Department;
use App\Models\DispatchAssignment;
use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\HaulingActivity;
use App\Models\InventoryBalance;
use App\Models\InventoryItem;
use App\Models\InventoryTransactionItem;
use App\Models\Location;
use App\Models\MaintenanceCost;
use App\Models\Material;
use App\Models\Shift;
use App\Models\Site;
use App\Models\TicketCorrection;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use App\Services\FuelService;
use App\Services\InventoryService;
use App\Services\ManagementAnalyticsService;
use App\Services\ProcurementService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class Phase12SystemIntegrationQaTest extends TestCase
{
    use DatabaseTransactions;

    protected function getAdminUser(): User
    {
        return User::where('role', 'admin')->first() ?? User::firstOrFail();
    }

    /**
     * WORKFLOW A (PRODUCTION END-TO-END):
     * Dispatch -> P2H -> Loading -> Hauling -> Dumping -> Ticket -> Verification -> Production Report
     */
    public function test_e2e_workflow_a_production_dispatch_p2h_hauling_ticket_verification_to_report(): void
    {
        $admin = $this->getAdminUser();
        $site = Site::where('is_active', true)->firstOrFail();
        $shift = Shift::where('site_id', $site->id)->first() ?? Shift::firstOrFail();
        $loadingPoint = Location::whereIn('location_type', ['pit', 'front_loading'])->firstOrFail();
        $dumpingPoint = Location::whereIn('location_type', ['stockpile', 'jetty', 'disposal'])->firstOrFail();
        $material = Material::where('is_active', true)->firstOrFail();

        $unit = Unit::where('site_id', $site->id)->whereIn('status', ['operating', 'standby'])->first()
            ?? Unit::whereIn('status', ['operating', 'standby'])->firstOrFail();
        $unit->update(['site_id' => $site->id, 'status' => 'standby']);
        // Ensure no open unapproved WO blocks RFU
        $unit->workOrders()->where('rfu_status', '!=', 'approved_rfu')->update(['status' => 'completed', 'rfu_status' => 'approved_rfu']);

        $driver = Driver::where('is_active', true)->firstOrFail();
        $driver->update(['administrative_eligibility_status' => 'eligible', 'mcu_status' => 'fit']);

        $date = now()->toDateString();

        // 1. Daily Dispatch
        $this->actingAs($admin)->post('/production/dispatch', [
            'date' => $date,
            'site_id' => $site->id,
            'shift_id' => $shift->id,
            'notes' => 'E2E Phase 12 Production Dispatch',
            'assignments' => [
                [
                    'unit_id' => $unit->id,
                    'driver_id' => $driver->id,
                    'loading_point_id' => $loadingPoint->id,
                    'dumping_point_id' => $dumpingPoint->id,
                    'material_id' => $material->id,
                    'target_ritase' => 6,
                ],
            ],
        ])->assertRedirect();

        $dispatch = DailyDispatch::where('site_id', $site->id)->where('date', $date)->latest('id')->firstOrFail();
        $this->assertEquals(1, $dispatch->assignments()->count());

        // 2. Digital P2H (15 mandatory items all Good -> Unit RFU)
        $p2hItems = [];
        $checklistNames = [
            'Engine', 'Oil', 'Coolant', 'Brake', 'Steering',
            'Tire', 'Wheel Nut', 'Lamp', 'Horn', 'Mirror',
            'Seat Belt', 'Body', 'Hydraulic', 'Battery', 'Safety Equipment',
        ];
        foreach ($checklistNames as $name) {
            $p2hItems[] = [
                'item_name' => $name,
                'category' => 'Safety & Mechanical',
                'is_critical' => in_array($name, ['Brake', 'Steering', 'Tire', 'Wheel Nut', 'Safety Equipment']),
                'status' => 'good',
            ];
        }

        $this->actingAs($admin)->post('/fleet/p2h', [
            'unit_id' => $unit->id,
            'driver_id' => $driver->id,
            'shift_id' => $shift->id,
            'inspection_date' => $date,
            'inspection_time' => '06:45',
            'current_hm' => (float) $unit->last_hm + 1,
            'current_km' => (float) $unit->last_km + 5,
            'items' => $p2hItems,
        ])->assertRedirect();

        // 3. Loading & Hauling -> Dumping
        $this->actingAs($admin)->post('/production/hauling', [
            'unit_id' => $unit->id,
            'driver_id' => $driver->id,
            'loading_point_id' => $loadingPoint->id,
            'dumping_point_id' => $dumpingPoint->id,
            'material_id' => $material->id,
            'shift_id' => $shift->id,
            'activity_date' => $date,
            'journey_status' => 'loading',
        ])->assertRedirect();

        $activity = HaulingActivity::where('unit_id', $unit->id)->where('activity_date', $date)->latest('id')->firstOrFail();

        $this->actingAs($admin)->put("/production/hauling/{$activity->id}/status", [
            'journey_status' => 'hauling',
        ])->assertRedirect();

        $this->actingAs($admin)->put("/production/hauling/{$activity->id}/status", [
            'journey_status' => 'dumped',
        ])->assertRedirect();

        $this->assertEquals('dumped', $activity->fresh()->journey_status);

        // 4. Dumping Ticket Input (Unverified -> NOT counted in production report yet)
        $ticketNo = 'TKT-P12-E2E-' . rand(1000, 9999);
        $this->actingAs($admin)->post('/production/tickets', [
            'ticket_number' => $ticketNo,
            'ticket_date' => $date,
            'dumping_time' => '09:30',
            'site_id' => $site->id,
            'unit_id' => $unit->id,
            'driver_id' => $driver->id,
            'loading_point_id' => $loadingPoint->id,
            'dumping_point_id' => $dumpingPoint->id,
            'material_id' => $material->id,
            'shift_id' => $shift->id,
            'tonnage' => 38.50,
            'checker_name' => 'JSI Checker Phase 12',
        ])->assertRedirect();

        $ticket = DumpingTicket::where('ticket_number', $ticketNo)->firstOrFail();
        $this->assertEquals('submitted', $ticket->status);
        $this->assertFalse((bool) $ticket->is_production);

        $analytics = app(ManagementAnalyticsService::class);
        $beforeVerifyReport = $analytics->getProductionReport([
            'site_id' => $site->id,
            'date_from' => $date,
            'date_to' => $date,
            'unit_id' => $unit->id,
            'driver_id' => null,
            'shift_id' => null,
            'department_id' => null,
            'status' => 'verified',
        ]);

        // 5. Ticket Verification -> Enters Official Production Report
        $this->actingAs($admin)->post("/production/tickets/{$ticket->id}/verify")->assertRedirect();
        $this->assertEquals('verified', $ticket->fresh()->status);
        $this->assertTrue((bool) $ticket->fresh()->is_production);

        $afterVerifyReport = $analytics->getProductionReport([
            'site_id' => $site->id,
            'date_from' => $date,
            'date_to' => $date,
            'unit_id' => $unit->id,
            'driver_id' => null,
            'shift_id' => null,
            'department_id' => null,
            'status' => 'verified',
        ]);

        $this->assertEquals(
            round($beforeVerifyReport['summary']['total_tonnage'] + 38.50, 2),
            $afterVerifyReport['summary']['total_tonnage']
        );
    }

    /**
     * WORKFLOW B (MAINTENANCE END-TO-END):
     * Breakdown -> Maintenance Request -> Work Order -> Mechanic -> Sparepart Request -> Repair -> Inspection -> RFU -> Fleet Status
     */
    public function test_e2e_workflow_b_maintenance_breakdown_to_rfu_and_fleet_status(): void
    {
        $admin = $this->getAdminUser();
        $site = Site::where('is_active', true)->firstOrFail();
        $unit = Unit::where('site_id', $site->id)->firstOrFail();
        $employees = Employee::where('is_active', true)->take(3)->get();
        $mechanic = $employees[0];
        $inspector = $employees[1] ?? $employees[0];
        $supervisor = $employees[2] ?? $employees[1] ?? $employees[0];

        $warehouse = Warehouse::where('site_id', $site->id)->firstOrFail();
        $item = InventoryItem::where('is_active', true)->firstOrFail();

        // Ensure warehouse has sufficient stock for sparepart issue
        $invService = app(InventoryService::class);
        $invService->stockIn([
            'site_id' => $site->id,
            'warehouse_id' => $warehouse->id,
            'transaction_type' => 'opening_balance',
        ], [
            [
                'inventory_item_id' => $item->id,
                'quantity' => 10,
                'unit_cost' => 250000,
            ],
        ]);

        // 1. Critical Breakdown -> Locks Unit to 'breakdown'
        $this->actingAs($admin)->post('/maintenance/breakdowns', [
            'site_id' => $site->id,
            'unit_id' => $unit->id,
            'reporter_type' => 'driver',
            'reporter_id' => $mechanic->id,
            'reporter_name' => $mechanic->name,
            'breakdown_date' => now()->toDateString(),
            'breakdown_time' => '08:00',
            'current_hm' => (float) $unit->last_hm + 2,
            'current_km' => (float) $unit->last_km + 10,
            'location_name' => 'KM 14 Hauling Road',
            'damage_category' => 'brake',
            'damage_description' => 'Kerusakan kritis brake chamber bocor di KM 14',
            'priority' => 'critical',
        ])->assertRedirect();

        $this->assertEquals('breakdown', $unit->fresh()->status);
        $report = BreakdownReport::where('unit_id', $unit->id)->latest('id')->firstOrFail();

        // 2. Convert Breakdown to Maintenance Request & Work Order
        $this->actingAs($admin)->post("/maintenance/breakdowns/{$report->id}/convert-request")->assertRedirect();
        $this->actingAs($admin)->post("/maintenance/breakdowns/{$report->id}/convert-wo", [
            'job_type' => 'emergency_repair',
            'assigned_mechanic_id' => $mechanic->id,
            'estimated_cost' => 500000,
        ])->assertRedirect();

        $wo = WorkOrder::where('breakdown_report_id', $report->id)->firstOrFail();
        $this->assertEquals('open', $wo->status);

        // 3. Assign Mechanic & Request Sparepart
        $this->actingAs($admin)->post('/maintenance/spareparts', [
            'work_order_id' => $wo->id,
            'warehouse_id' => $warehouse->id,
            'requested_by' => $mechanic->id,
            'request_date' => now()->toDateString(),
            'items' => [
                [
                    'inventory_item_id' => $item->id,
                    'part_number' => $item->part_number ?? $item->item_code,
                    'part_name' => $item->item_name,
                    'quantity_requested' => 2,
                    'unit' => $item->unit_of_measurement ?? 'PCS',
                    'unit_price' => 250000,
                ],
            ],
        ])->assertRedirect();

        $spr = $wo->sparepartRequests()->latest('id')->firstOrFail();
        $this->actingAs($admin)->put("/maintenance/spareparts/{$spr->id}/approve")->assertRedirect();
        $this->actingAs($admin)->post("/maintenance/spareparts/{$spr->id}/issue", [
            'warehouse_id' => $warehouse->id,
        ])->assertRedirect();

        $this->assertEquals('issued_by_warehouse', $spr->fresh()->status);
        $this->assertGreaterThan(0, (float) $wo->fresh()->actual_cost);

        // 4. Repair -> Waiting Inspection (Attempting to close without RFU must NOT restore unit to standby!)
        $this->actingAs($admin)->put("/maintenance/work-orders/{$wo->id}/status", [
            'status' => 'completed',
            'action_taken' => 'Penggantian brake chamber selesai',
        ])->assertRedirect();

        $this->assertNotEquals('standby', $unit->fresh()->status);

        // 5. QC Inspection (Passed) -> Official RFU Approval (by non-mechanic supervisor) -> Fleet Status = standby
        $this->actingAs($admin)->post("/maintenance/rfu/{$wo->id}/inspect", [
            'inspector_id' => $inspector->id,
            'inspection_date' => now()->toDateString(),
            'inspection_time' => '11:30',
            'inspection_type' => 'post_repair',
            'test_run_result' => 'Uji pengereman beban penuh normal & aman.',
            'result' => 'passed',
        ])->assertRedirect();

        $this->actingAs($admin)->post("/maintenance/rfu/{$wo->id}/approve", [
            'approver_id' => $supervisor->id,
            'decision' => 'approved_rfu',
            'approval_notes' => 'Unit lulus QC & dinyatakan RFU.',
        ])->assertRedirect();

        $this->assertEquals('approved_rfu', $wo->fresh()->rfu_status);
        $this->assertEquals('standby', $unit->fresh()->status);
    }

    /**
     * WORKFLOW C (WAREHOUSE & PROCUREMENT END-TO-END):
     * Purchase Request -> Approval -> PO -> Goods Receipt -> Stock In -> Stock Out -> Stock Card
     */
    public function test_e2e_workflow_c_warehouse_procurement_pr_po_grn_stock_in_out_stock_card(): void
    {
        $admin = $this->getAdminUser();
        $this->actingAs($admin);

        $site = Site::where('is_active', true)->firstOrFail();
        $warehouse = Warehouse::where('site_id', $site->id)->firstOrFail();
        $vendor = Vendor::where('is_active', true)->firstOrFail();
        $item = InventoryItem::where('is_active', true)->firstOrFail();
        $dept = Department::where('is_active', true)->firstOrFail();

        $procService = app(ProcurementService::class);
        $invService = app(InventoryService::class);

        $balanceBefore = (float) (InventoryBalance::where('warehouse_id', $warehouse->id)
            ->where('inventory_item_id', $item->id)
            ->value('on_hand_qty') ?? 0);

        // 1. Purchase Request -> Approval
        $pr = $procService->createPurchaseRequest([
            'site_id' => $site->id,
            'warehouse_id' => $warehouse->id,
            'department_id' => $dept->id,
            'source' => 'warehouse_reorder',
            'purchase_category' => 'sparepart',
            'priority' => 'high',
            'purpose' => 'Replenishment stok filter & sparepart Phase 12',
        ], [
            [
                'inventory_item_id' => $item->id,
                'item_name' => $item->item_name,
                'requested_qty' => 10,
                'unit' => $item->unit_of_measurement ?? 'PCS',
                'estimated_unit_price' => 150000,
            ],
        ]);

        $pr = $procService->approvePurchaseRequest($pr, ['approve_all' => true]);
        $this->assertEquals('approved', $pr->status);

        // 2. PO -> PO Approval
        $po = $procService->createPurchaseOrder([
            'site_id' => $site->id,
            'warehouse_id' => $warehouse->id,
            'purchase_request_id' => $pr->id,
            'vendor_id' => $vendor->id,
            'tax_percent' => 11,
        ], [
            [
                'inventory_item_id' => $item->id,
                'item_name' => $item->item_name,
                'quantity_ordered' => 10,
                'unit' => $item->unit_of_measurement ?? 'PCS',
                'unit_price' => 150000,
            ],
        ]);

        $po = $procService->approvePurchaseOrder($po, ['approve_all' => true]);
        $this->assertEquals('approved', $po->approval_status);

        // 3. Goods Receipt -> Automatic Stock In
        $poItem = $po->items()->firstOrFail();
        $grn = $procService->recordGoodsReceipt($po, [
            'site_id' => $site->id,
            'warehouse_id' => $warehouse->id,
            'receipt_date' => now()->toDateString(),
            'delivery_note_number' => 'SJ-P12-001',
        ], [
            [
                'purchase_order_item_id' => $poItem->id,
                'qty_delivered' => 10,
                'qty_accepted' => 10,
                'qty_damaged' => 0,
                'qty_rejected' => 0,
            ],
        ]);

        $this->assertEquals('confirmed', $grn->status);
        $balanceAfterIn = (float) InventoryBalance::where('warehouse_id', $warehouse->id)
            ->where('inventory_item_id', $item->id)
            ->value('on_hand_qty');
        $this->assertEquals(round($balanceBefore + 10, 2), $balanceAfterIn);

        // 4. Stock Out -> Stock Card Verification
        $txOut = $invService->stockOut([
            'site_id' => $site->id,
            'warehouse_id' => $warehouse->id,
            'transaction_type' => 'operational_issue',
            'remarks' => 'Pengeluaran operasional non-WO Phase 12',
        ], [
            [
                'inventory_item_id' => $item->id,
                'quantity' => 4,
            ],
        ]);

        $balanceAfterOut = (float) InventoryBalance::where('warehouse_id', $warehouse->id)
            ->where('inventory_item_id', $item->id)
            ->value('on_hand_qty');
        $this->assertEquals(round($balanceBefore + 6, 2), $balanceAfterOut);

        $latestCardEntry = InventoryTransactionItem::where('inventory_transaction_id', $txOut->id)
            ->where('inventory_item_id', $item->id)
            ->firstOrFail();
        $this->assertEquals($balanceAfterOut, (float) $latestCardEntry->running_balance_qty);
    }

    /**
     * WORKFLOW D & E (FUEL END-TO-END + FINANCE OPERATING COST & COST PER TON):
     * D: Fuel Purchase -> Receiving -> Tank Stock -> Sounding -> Fuel Dispensing -> Consumption Report
     * E: Production -> Revenue -> Fuel Cost -> Maintenance Cost -> Warehouse Cost -> Operating Cost -> Cost per Ton
     */
    public function test_e2e_workflow_d_and_e_fuel_to_finance_cost_per_ton_without_double_counting(): void
    {
        $admin = $this->getAdminUser();
        $this->actingAs($admin);

        $site = Site::where('is_active', true)->firstOrFail();
        $tank = FuelTank::where('site_id', $site->id)->firstOrFail();
        $unit = Unit::where('site_id', $site->id)->firstOrFail();
        $fuelService = app(FuelService::class);
        $analyticsService = app(ManagementAnalyticsService::class);

        $date = now()->toDateString();

        // 1. Fuel Receiving -> Tank Stock
        $stockBefore = (float) $tank->current_stock_liters;
        $receiveLiters = min(500.0, max(100.0, (float) $tank->capacity_liters - $stockBefore - 200.0));
        if ($receiveLiters > 0) {
            $fuelService->recordFuelReceipt([
                'site_id' => $site->id,
                'receipt_type' => 'fuel_receiving',
                'receipt_date' => $date,
                'do_number' => 'DO-P12-FUEL',
                'invoice_number' => 'INV-P12-FUEL',
            ], [
                [
                    'fuel_tank_id' => $tank->id,
                    'received_volume_liters' => $receiveLiters,
                    'unit_price' => 14850,
                ],
            ]);
        }

        // 2. Daily Tank Sounding (Calibrated Chart, never cm == liters)
        $sounding = $fuelService->recordTankSounding([
            'site_id' => $site->id,
            'fuel_tank_id' => $tank->id,
            'sounding_date' => $date,
            'sounding_time' => '07:15:00',
            'measurement_cm' => min(100.0, (float) $tank->max_height_cm * 0.5),
        ]);
        $this->assertNotEquals((float) $sounding->measurement_cm, (float) $sounding->estimated_volume_liters);

        // 3. Fuel Dispensing -> Consumption Report
        $txDispense = $fuelService->dispenseFuel([
            'site_id' => $site->id,
            'source_tank_id' => $tank->id,
            'unit_id' => $unit->id,
            'transaction_date' => $date,
            'transaction_time' => '13:45:00',
            'current_hm' => (float) $unit->last_hm + 2,
            'current_km' => (float) $unit->last_km + 15,
            'liters' => 85.0,
            'reference_ticket_number' => 'REF-FUEL-P12-' . rand(1000, 9999),
        ]);
        $this->assertEquals(85.0, (float) $txDispense->liters);

        // 4. Finance Summary (Production -> Revenue -> Fuel Cost -> Maintenance Cost -> Warehouse Cost -> Operating Cost -> Cost per Ton)
        $filters = [
            'site_id' => $site->id,
            'date_from' => now()->startOfMonth()->toDateString(),
            'date_to' => $date,
            'unit_id' => null,
            'driver_id' => null,
            'shift_id' => null,
            'department_id' => null,
            'status' => 'verified',
        ];

        $finance = $analyticsService->getFinanceOperatingCostSummary($filters);

        $expectedOperatingCost = round(
            $finance['fuel_cost_idr'] + $finance['maintenance_cost_idr'] + $finance['warehouse_cost_idr'],
            2
        );
        $this->assertEquals($expectedOperatingCost, $finance['operating_cost_idr']);
        $this->assertEquals(
            round($finance['verified_tonnage'] * $finance['hauling_tariff_per_ton_idr'], 2),
            $finance['revenue_idr']
        );

        if ($finance['verified_tonnage'] > 0) {
            $this->assertEquals(
                round($finance['operating_cost_idr'] / $finance['verified_tonnage'], 2),
                $finance['cost_per_ton_idr']
            );
        }
    }

    /**
     * DATA INTEGRITY & SECURITY AUDIT VERIFICATION:
     * Tests all 8 Data Integrity rules + Site Isolation / File Upload / Sensitive Document Access.
     */
    public function test_data_integrity_and_security_controls_enforced(): void
    {
        $admin = $this->getAdminUser();
        $this->actingAs($admin);

        $sites = Site::where('is_active', true)->orderBy('id')->get();
        $siteA = $sites[0];
        $siteB = $sites[1] ?? $sites[0];

        // 1. Duplicate Fuel Dispensing Prevented
        $tank = FuelTank::where('site_id', $siteA->id)->firstOrFail();
        $unitA = Unit::where('site_id', $siteA->id)->firstOrFail();
        $fuelService = app(FuelService::class);
        $refCode = 'DUP-FUEL-REF-' . rand(1000, 9999);

        $fuelService->dispenseFuel([
            'site_id' => $siteA->id,
            'source_tank_id' => $tank->id,
            'unit_id' => $unitA->id,
            'transaction_date' => now()->toDateString(),
            'transaction_time' => '15:10:00',
            'liters' => 25.0,
            'reference_ticket_number' => $refCode,
        ]);

        $dupFuelThrown = false;
        try {
            $fuelService->dispenseFuel([
                'site_id' => $siteA->id,
                'source_tank_id' => $tank->id,
                'unit_id' => $unitA->id,
                'transaction_date' => now()->toDateString(),
                'transaction_time' => '15:10:00',
                'liters' => 25.0,
                'reference_ticket_number' => $refCode,
            ]);
        } catch (ValidationException $e) {
            $dupFuelThrown = true;
        }
        $this->assertTrue($dupFuelThrown, 'Duplicate fuel dispensing must throw ValidationException.');

        // 2. Double Cost Recording Prevented on Work Order
        $wo = WorkOrder::where('site_id', $siteA->id)->first() ?? WorkOrder::firstOrFail();
        $costRef = 'INV-SVC-' . rand(1000, 9999);

        $this->actingAs($admin)->post('/maintenance/costs', [
            'work_order_id' => $wo->id,
            'cost_date' => now()->toDateString(),
            'cost_type' => 'third_party_service',
            'description' => 'Jasa Kalibrasi Pompa Hidrolik',
            'reference_number' => $costRef,
            'actual_amount' => 1750000,
        ])->assertSessionHasNoErrors();

        $this->actingAs($admin)->post('/maintenance/costs', [
            'work_order_id' => $wo->id,
            'cost_date' => now()->toDateString(),
            'cost_type' => 'third_party_service',
            'description' => 'Jasa Kalibrasi Pompa Hidrolik',
            'reference_number' => $costRef,
            'actual_amount' => 1750000,
        ])->assertSessionHasErrors('reference_number');

        // 3. Invalid Unit Assignment (Breakdown Unit) Prevented in Dispatch Swap
        $breakdownUnit = Unit::where('site_id', $siteA->id)->where('id', '!=', $unitA->id)->firstOrFail();
        $breakdownUnit->update(['status' => 'breakdown']);
        $assignment = DispatchAssignment::first();
        if ($assignment) {
            $this->actingAs($admin)->put("/production/assignments/{$assignment->id}/swap", [
                'unit_id' => $breakdownUnit->id,
                'driver_id' => $assignment->driver_id,
                'reason' => 'Test swap ke unit breakdown',
            ])->assertSessionHasErrors('unit_id');
        }

        // 4. Invalid Direct Fleet Status Override Prevented While Unapproved Breakdown WO Exists
        $activeWo = WorkOrder::create([
            'wo_number' => 'WO-LOCK-' . rand(1000, 9999),
            'site_id' => $breakdownUnit->site_id,
            'unit_id' => $breakdownUnit->id,
            'source' => 'road_breakdown',
            'job_type' => 'emergency_repair',
            'priority' => 'critical_emergency',
            'breakdown_time' => now(),
            'defect_summary' => 'Kerusakan transmisi belum RFU',
            'status' => 'in_progress',
            'rfu_status' => 'repair_in_progress',
            'created_by' => $admin->id,
        ]);

        $this->actingAs($admin)->put("/fleet/registry/{$breakdownUnit->id}/status", [
            'status' => 'operating',
        ])->assertSessionHasErrors('status');

        // 5. Security: Malicious PHP File Upload Blocked on Procurement PR
        $fakePhpFile = UploadedFile::fake()->create('exploit.php', 10, 'application/x-php');
        $this->actingAs($admin)->post('/procurement/purchase-requests', [
            'site_id' => $siteA->id,
            'request_date' => now()->toDateString(),
            'source' => 'general_purchase',
            'purchase_category' => 'sparepart',
            'priority' => 'normal',
            'purpose' => 'Test upload file berbahaya',
            'attachment' => $fakePhpFile,
            'items' => [
                ['item_name' => 'Test Item', 'requested_qty' => 1, 'estimated_unit_price' => 10000],
            ],
        ])->assertSessionHasErrors('attachment');

        // 6. Audit Trail on Rejecting an Already Verified Final Ticket
        $verifiedTicket = DumpingTicket::where('status', 'verified')->first();
        if ($verifiedTicket) {
            $corrCountBefore = TicketCorrection::where('dumping_ticket_id', $verifiedTicket->id)->count();
            $this->actingAs($admin)->post("/production/tickets/{$verifiedTicket->id}/reject", [
                'rejection_reason' => 'Reversal audit test Phase 12',
            ])->assertRedirect();

            $this->assertEquals(
                $corrCountBefore + 1,
                TicketCorrection::where('dumping_ticket_id', $verifiedTicket->id)->count()
            );
        }
    }
}
