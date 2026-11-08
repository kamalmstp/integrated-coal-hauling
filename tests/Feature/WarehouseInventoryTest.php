<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\InventoryBalance;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Position;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockTransfer;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class WarehouseInventoryTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected Site $siteA;
    protected Site $siteB;
    protected Warehouse $warehouseA1;
    protected Warehouse $warehouseA2;
    protected Warehouse $warehouseB1;
    protected Employee $storeman;
    protected Employee $mechanic;
    protected InventoryCategory $category;
    protected InventoryItem $item;
    protected Unit $unit;
    protected WorkOrder $workOrder;
    protected InventoryService $inventoryService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->inventoryService = app(InventoryService::class);

        $company = Company::first() ?? Company::create([
            'code' => 'TAP-TEST',
            'name' => 'PT Teknindo Adhya Pane',
            'is_active' => true,
        ]);

        $this->siteA = Site::first() ?? Site::create([
            'company_id' => $company->id,
            'code' => 'SITE-A',
            'name' => 'Site Operasional A',
            'is_active' => true,
        ]);

        $this->siteB = Site::where('id', '!=', $this->siteA->id)->first() ?? Site::create([
            'company_id' => $company->id,
            'code' => 'SITE-B',
            'name' => 'Site Operasional B',
            'is_active' => true,
        ]);

        $department = Department::first() ?? Department::create([
            'company_id' => $company->id,
            'code' => 'DEPT-LOG',
            'name' => 'Logistics & Warehouse',
            'is_active' => true,
        ]);

        $position = Position::first() ?? Position::create([
            'department_id' => $department->id,
            'code' => 'POS-STR',
            'name' => 'Storeman',
            'level' => 'staff',
            'is_active' => true,
        ]);

        $this->user = User::first() ?? User::factory()->create([
            'site_id' => $this->siteA->id,
        ]);

        $this->storeman = Employee::first() ?? Employee::create([
            'company_id' => $company->id,
            'site_id' => $this->siteA->id,
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employee_code' => 'EMP-WH-001',
            'name' => 'Budi Storeman',
            'nik' => '3201000000000001',
            'employment_status' => 'permanent',
            'is_active' => true,
        ]);

        $this->mechanic = Employee::where('id', '!=', $this->storeman->id)->first() ?? Employee::create([
            'company_id' => $company->id,
            'site_id' => $this->siteA->id,
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employee_code' => 'EMP-MC-002',
            'name' => 'Andi Mechanic',
            'nik' => '3201000000000002',
            'employment_status' => 'permanent',
            'is_active' => true,
        ]);

        $this->warehouseA1 = Warehouse::create([
            'site_id' => $this->siteA->id,
            'code' => 'WH-TEST-A1',
            'name' => 'Gudang Utama Site A',
            'warehouse_type' => 'main_warehouse',
            'storeman_id' => $this->storeman->id,
            'status' => 'active',
            'is_active' => true,
        ]);

        $this->warehouseA2 = Warehouse::create([
            'site_id' => $this->siteA->id,
            'code' => 'WH-TEST-A2',
            'name' => 'Gudang Satelit Site A',
            'warehouse_type' => 'satellite_store',
            'storeman_id' => $this->storeman->id,
            'status' => 'active',
            'is_active' => true,
        ]);

        $this->warehouseB1 = Warehouse::create([
            'site_id' => $this->siteB->id,
            'code' => 'WH-TEST-B1',
            'name' => 'Gudang Utama Site B',
            'warehouse_type' => 'main_warehouse',
            'storeman_id' => $this->storeman->id,
            'status' => 'active',
            'is_active' => true,
        ]);

        $this->category = InventoryCategory::firstOrCreate(
            ['code' => 'sparepart'],
            ['name' => 'Sparepart', 'description' => 'Suku Cadang', 'is_active' => true]
        );

        $this->item = InventoryItem::create([
            'site_id' => $this->siteA->id,
            'item_code' => 'ITM-TEST-999',
            'part_number' => 'PN-TEST-999',
            'barcode' => '899999999999',
            'item_name' => 'Bearing Roda Belakang Heavy Duty DT',
            'category_id' => $this->category->id,
            'category_code' => 'sparepart',
            'brand' => 'SKF / Timken',
            'specification' => 'Heavy Duty Tapered Roller Bearing',
            'unit_of_measurement' => 'PCS',
            'minimum_stock' => 5,
            'reorder_point' => 10,
            'maximum_stock' => 40,
            'default_warehouse_id' => $this->warehouseA1->id,
            'standard_cost' => 400000,
            'is_active' => true,
        ]);

        $this->unit = Unit::first() ?? Unit::create([
            'site_id' => $this->siteA->id,
            'unit_code' => 'DT-TEST-99',
            'registration_number' => 'KT 9999 TAP',
            'unit_type' => 'Dump Truck',
            'brand' => 'Scania',
            'model' => 'P360',
            'status' => 'maintenance',
            'is_active' => true,
        ]);

        $this->workOrder = WorkOrder::create([
            'wo_number' => 'WO-WH-TEST-001',
            'site_id' => $this->siteA->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'high',
            'status' => 'in_progress',
            'defect_summary' => 'Penggantian bearing roda belakang',
            'breakdown_time' => now(),
            'estimated_cost' => 2000000,
            'actual_cost' => 0,
        ]);
    }

    /**
     * 1. Test Stock In & Opening Balance
     */
    public function test_stock_in_and_opening_balance(): void
    {
        $this->actingAs($this->user);

        $response = $this->post('/warehouse/transactions/stock-in', [
            'transaction_date' => now()->toDateString(),
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
            'reference_document' => 'OB-TEST-001',
            'requester_id' => $this->storeman->id,
            'storeman_id' => $this->storeman->id,
            'remarks' => 'Saldo awal bearing roda',
            'items' => [
                [
                    'inventory_item_id' => $this->item->id,
                    'quantity' => 20,
                    'unit_cost' => 400000,
                ],
            ],
        ]);

        $response->assertSessionHas('success');

        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)
            ->where('inventory_item_id', $this->item->id)
            ->first();

        $this->assertNotNull($balance);
        $this->assertEquals(20.0, (float) $balance->on_hand_qty);
        $this->assertEquals(20.0, (float) $balance->available_qty);
        $this->assertEquals(400000.0, (float) $balance->average_unit_cost);
        $this->assertEquals(8000000.0, (float) $balance->total_value);
    }

    /**
     * 2. Test Stock Out deducts balance and writes Stock Card
     */
    public function test_stock_out_deducts_balance_and_records_stock_card(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 15, 'unit_cost' => 400000],
        ]);

        $response = $this->post('/warehouse/transactions/stock-out', [
            'transaction_date' => now()->toDateString(),
            'transaction_type' => 'operational_issue',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
            'unit_id' => $this->unit->id,
            'reference_document' => 'OPS-TEST-001',
            'items' => [
                [
                    'inventory_item_id' => $this->item->id,
                    'quantity' => 5,
                ],
            ],
        ]);

        $response->assertSessionHas('success');

        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)
            ->where('inventory_item_id', $this->item->id)
            ->first();

        $this->assertEquals(10.0, (float) $balance->on_hand_qty);
        $this->assertEquals(4000000.0, (float) $balance->total_value);

        $this->assertDatabaseHas('inventory_transaction_items', [
            'warehouse_id' => $this->warehouseA1->id,
            'inventory_item_id' => $this->item->id,
            'direction' => 'OUT',
            'opening_balance_qty' => 15.0,
            'qty_out' => 5.0,
            'running_balance_qty' => 10.0,
        ]);
    }

    /**
     * 3. Test Moving Weighted Average (MWA) Valuation calculation
     */
    public function test_moving_weighted_average_valuation(): void
    {
        $this->actingAs($this->user);

        // Batch 1: 10 PCS @ 400,000 = 4,000,000
        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 400000],
        ]);

        // Batch 2: 10 PCS @ 500,000 = 5,000,000 -> Total 20 PCS = 9,000,000 -> MWA = 450,000
        $this->inventoryService->stockIn([
            'transaction_type' => 'purchase_receiving',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 500000],
        ]);

        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)
            ->where('inventory_item_id', $this->item->id)
            ->first();

        $this->assertEquals(20.0, (float) $balance->on_hand_qty);
        $this->assertEquals(450000.0, (float) $balance->average_unit_cost);
        $this->assertEquals(9000000.0, (float) $balance->total_value);

        // Issue 4 PCS -> must use MWA 450,000 -> Cost = 1,800,000, Remaining 16 PCS = 7,200,000
        $txOut = $this->inventoryService->stockOut([
            'transaction_type' => 'maintenance_issue',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 4],
        ]);

        $this->assertEquals(1800000.0, (float) $txOut->total_amount);
        $balance->refresh();
        $this->assertEquals(16.0, (float) $balance->on_hand_qty);
        $this->assertEquals(450000.0, (float) $balance->average_unit_cost);
        $this->assertEquals(7200000.0, (float) $balance->total_value);
    }

    /**
     * 4. Test Negative Stock Prevention
     */
    public function test_negative_stock_prevention(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 5, 'unit_cost' => 400000],
        ]);

        $this->expectException(ValidationException::class);

        $this->inventoryService->stockOut([
            'transaction_type' => 'general_issue',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 8],
        ]);
    }

    /**
     * 5. Test Concurrent Transaction & Reservation Locking prevents over-issuing reserved stock
     */
    public function test_concurrent_transaction_locking_and_reservation(): void
    {
        $this->actingAs($this->user);

        // Stock In 10 PCS
        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 400000],
        ]);

        // Create and approve Sparepart Request for 7 PCS
        $spReq = SparepartRequest::create([
            'request_number' => 'SPR-LOCK-001',
            'work_order_id' => $this->workOrder->id,
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
            'requested_by' => $this->mechanic->id,
            'request_date' => now()->toDateString(),
            'status' => 'approved',
            'approved_by' => $this->user->id,
            'approved_at' => now(),
            'total_cost' => 2800000,
        ]);

        $spReq->items()->create([
            'inventory_item_id' => $this->item->id,
            'warehouse_id' => $this->warehouseA1->id,
            'part_number' => $this->item->part_number,
            'part_name' => $this->item->item_name,
            'category' => 'sparepart',
            'quantity_requested' => 7,
            'quantity_approved' => 7,
            'quantity_issued' => 0,
            'unit' => 'PCS',
            'unit_price' => 400000,
            'total_price' => 2800000,
            'status' => 'approved',
        ]);

        // Storeman picks 7 PCS -> reserved_qty = 7, available_qty = 3, on_hand_qty = 10
        $this->inventoryService->pickSparepartRequest($spReq, $this->warehouseA1->id, $this->storeman->id);

        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)
            ->where('inventory_item_id', $this->item->id)
            ->first();

        $this->assertEquals(10.0, (float) $balance->on_hand_qty);
        $this->assertEquals(7.0, (float) $balance->reserved_qty);
        $this->assertEquals(3.0, (float) $balance->available_qty);

        // Another transaction tries to issue 5 PCS unreserved -> must be blocked because available_qty is only 3!
        $this->expectException(ValidationException::class);

        $this->inventoryService->stockOut([
            'transaction_type' => 'general_issue',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 5],
        ]);
    }

    /**
     * 6. Test 8-Step Work Order Sparepart Request Integration:
     * Request & Approve do NOT deduct stock; Issue deducts stock and records cost into Work Order
     */
    public function test_work_order_sparepart_workflow_and_cost_integration(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 450000],
        ]);

        // Step 1: Mechanic creates request
        $this->post('/maintenance/spareparts', [
            'work_order_id' => $this->workOrder->id,
            'warehouse_id' => $this->warehouseA1->id,
            'requested_by' => $this->mechanic->id,
            'items' => [
                [
                    'inventory_item_id' => $this->item->id,
                    'part_number' => $this->item->part_number,
                    'part_name' => $this->item->item_name,
                    'quantity_requested' => 2,
                    'unit' => 'PCS',
                    'unit_price' => 450000,
                ],
            ],
        ])->assertSessionHas('success');

        $spReq = SparepartRequest::where('work_order_id', $this->workOrder->id)->latest('id')->first();
        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)->where('inventory_item_id', $this->item->id)->first();

        // Stock must NOT be deducted on creation
        $this->assertEquals(10.0, (float) $balance->on_hand_qty);

        // Step 2: Supervisor approves
        $this->post("/maintenance/spareparts/{$spReq->id}/approve")->assertSessionHas('success');
        $balance->refresh();
        // Stock must NOT be deducted on approval
        $this->assertEquals(10.0, (float) $balance->on_hand_qty);

        // Step 4: Storeman picks
        $this->post("/warehouse/fulfillment/{$spReq->id}/pick", [
            'warehouse_id' => $this->warehouseA1->id,
            'storeman_id' => $this->storeman->id,
        ])->assertSessionHas('success');
        $balance->refresh();
        // On-hand is still 10, reserved is 2
        $this->assertEquals(10.0, (float) $balance->on_hand_qty);
        $this->assertEquals(2.0, (float) $balance->reserved_qty);

        // Step 5-8: Issue & Confirm Receipt -> Stock deducted & Cost recorded in Work Order
        $this->post("/warehouse/fulfillment/{$spReq->id}/issue", [
            'warehouse_id' => $this->warehouseA1->id,
            'storeman_id' => $this->storeman->id,
            'received_by' => $this->mechanic->id,
        ])->assertSessionHas('success');

        $balance->refresh();
        $this->assertEquals(8.0, (float) $balance->on_hand_qty);
        $this->assertEquals(0.0, (float) $balance->reserved_qty);

        $this->workOrder->refresh();
        $this->assertEquals(900000.0, (float) $this->workOrder->actual_cost);
    }

    /**
     * 7. Test Partial Issue and Backorder tracking
     */
    public function test_partial_issue_and_backorder_tracking(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 400000],
        ]);

        $spReq = SparepartRequest::create([
            'request_number' => 'SPR-PARTIAL-001',
            'work_order_id' => $this->workOrder->id,
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
            'requested_by' => $this->mechanic->id,
            'request_date' => now()->toDateString(),
            'status' => 'approved',
            'approved_by' => $this->user->id,
            'approved_at' => now(),
            'total_cost' => 2400000,
        ]);

        $reqItem = $spReq->items()->create([
            'inventory_item_id' => $this->item->id,
            'warehouse_id' => $this->warehouseA1->id,
            'part_number' => $this->item->part_number,
            'part_name' => $this->item->item_name,
            'category' => 'sparepart',
            'quantity_requested' => 6,
            'quantity_approved' => 6,
            'quantity_issued' => 0,
            'unit' => 'PCS',
            'unit_price' => 400000,
            'total_price' => 2400000,
            'status' => 'approved',
        ]);

        // Partial issue: 4 PCS out of 6 approved
        $this->inventoryService->issueSparepartRequest($spReq, [
            'warehouse_id' => $this->warehouseA1->id,
            'items' => [$reqItem->id => 4],
        ]);

        $spReq->refresh();
        $reqItem->refresh();
        $this->assertEquals('partially_issued', $spReq->status);
        $this->assertEquals(4.0, (float) $reqItem->quantity_issued);
        $this->assertEquals(2.0, (float) $reqItem->quantity_backorder);

        // Fulfill remaining backorder of 2 PCS
        $this->inventoryService->issueSparepartRequest($spReq, [
            'warehouse_id' => $this->warehouseA1->id,
            'items' => [$reqItem->id => 2],
        ]);

        $spReq->refresh();
        $reqItem->refresh();
        $this->assertEquals('issued_by_warehouse', $spReq->status);
        $this->assertEquals(6.0, (float) $reqItem->quantity_issued);
        $this->assertEquals(0.0, (float) $reqItem->quantity_backorder);
    }

    /**
     * 8. Test Return from Maintenance restores stock and credits Work Order cost
     */
    public function test_return_from_maintenance_restores_stock_and_credits_work_order_cost(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 400000],
        ]);

        $spReq = SparepartRequest::create([
            'request_number' => 'SPR-RET-001',
            'work_order_id' => $this->workOrder->id,
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
            'requested_by' => $this->mechanic->id,
            'request_date' => now()->toDateString(),
            'status' => 'approved',
            'approved_by' => $this->user->id,
            'approved_at' => now(),
            'total_cost' => 1600000,
        ]);

        $reqItem = $spReq->items()->create([
            'inventory_item_id' => $this->item->id,
            'warehouse_id' => $this->warehouseA1->id,
            'part_number' => $this->item->part_number,
            'part_name' => $this->item->item_name,
            'category' => 'sparepart',
            'quantity_requested' => 4,
            'quantity_approved' => 4,
            'quantity_issued' => 0,
            'unit' => 'PCS',
            'unit_price' => 400000,
            'total_price' => 1600000,
            'status' => 'approved',
        ]);

        // Issue all 4 PCS -> Stock becomes 6, WO cost becomes 1,600,000
        $this->inventoryService->issueSparepartRequest($spReq, ['warehouse_id' => $this->warehouseA1->id]);

        // Return 1 unused PCS back to warehouse
        $this->post("/warehouse/fulfillment/{$spReq->id}/return", [
            'sparepart_request_item_id' => $reqItem->id,
            'quantity' => 1,
            'remarks' => '1 PCS bearing tidak jadi dipakai',
        ])->assertSessionHas('success');

        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)->where('inventory_item_id', $this->item->id)->first();
        $this->assertEquals(7.0, (float) $balance->on_hand_qty);

        $reqItem->refresh();
        $this->assertEquals(1.0, (float) $reqItem->quantity_returned);

        $this->workOrder->refresh();
        $this->assertEquals(1200000.0, (float) $this->workOrder->actual_cost);
    }

    /**
     * 9. Test Inter-Warehouse Stock Transfer (Dispatch Out & Receive In with MWA preservation)
     */
    public function test_inter_warehouse_stock_transfer(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 12, 'unit_cost' => 420000],
        ]);

        // Create transfer of 5 PCS from Warehouse A1 to Warehouse A2
        $this->post('/warehouse/transfers', [
            'transfer_date' => now()->toDateString(),
            'from_warehouse_id' => $this->warehouseA1->id,
            'to_warehouse_id' => $this->warehouseA2->id,
            'requester_id' => $this->storeman->id,
            'remarks' => 'Transfer ke Gudang Satelit A2',
            'items' => [
                ['inventory_item_id' => $this->item->id, 'qty_requested' => 5],
            ],
        ])->assertSessionHas('success');

        $transfer = StockTransfer::where('from_warehouse_id', $this->warehouseA1->id)->latest('id')->first();
        $this->assertNotNull($transfer);

        // Dispatch Transfer (Stock Out from A1)
        $this->post("/warehouse/transfers/{$transfer->id}/dispatch")->assertSessionHas('success');

        $balA1 = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)->where('inventory_item_id', $this->item->id)->first();
        $this->assertEquals(7.0, (float) $balA1->on_hand_qty);

        // Receive Transfer (Stock In at A2)
        $this->post("/warehouse/transfers/{$transfer->id}/receive")->assertSessionHas('success');

        $balA2 = InventoryBalance::where('warehouse_id', $this->warehouseA2->id)->where('inventory_item_id', $this->item->id)->first();
        $this->assertNotNull($balA2);
        $this->assertEquals(5.0, (float) $balA2->on_hand_qty);
        $this->assertEquals(420000.0, (float) $balA2->average_unit_cost);
    }

    /**
     * 10. Test Stock Opname does NOT alter system stock until Stock Adjustment is approved
     */
    public function test_stock_opname_does_not_alter_stock_until_adjustment_approved(): void
    {
        $this->actingAs($this->user);

        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 20, 'unit_cost' => 400000],
        ]);

        // 1. Schedule Opname
        $this->post('/warehouse/opname', [
            'warehouse_id' => $this->warehouseA1->id,
            'scheduled_date' => now()->toDateString(),
            'storeman_id' => $this->storeman->id,
        ])->assertSessionHas('success');

        $opname = StockOpname::where('warehouse_id', $this->warehouseA1->id)->latest('id')->first();
        $opItem = $opname->items()->where('inventory_item_id', $this->item->id)->first();

        // 2. Submit Physical Count = 17 (Variance = -3)
        $this->post("/warehouse/opname/{$opname->id}/counts", [
            'investigation_notes' => 'Selisih 3 PCS sedang diinvestigasi',
            'items' => [
                [
                    'id' => $opItem->id,
                    'physical_qty' => 17,
                    'investigation_reason' => '3 PCS rusak korosi',
                ],
            ],
        ])->assertSessionHas('success');

        // STRICT RULE: System stock MUST STILL BE 20!
        $balance = InventoryBalance::where('warehouse_id', $this->warehouseA1->id)->where('inventory_item_id', $this->item->id)->first();
        $this->assertEquals(20.0, (float) $balance->on_hand_qty);

        // 3. Create Stock Adjustment document (Pending Approval)
        $this->post('/warehouse/adjustments', [
            'stock_opname_id' => $opname->id,
            'reason_category' => 'opname_variance',
        ])->assertSessionHas('success');

        // System stock MUST STILL BE 20 before approval!
        $balance->refresh();
        $this->assertEquals(20.0, (float) $balance->on_hand_qty);

        // 4. Approve Stock Adjustment -> Now system stock becomes 17!
        $adjustment = StockAdjustment::where('stock_opname_id', $opname->id)->first();
        $this->post("/warehouse/adjustments/{$adjustment->id}/approve")->assertSessionHas('success');

        $balance->refresh();
        $this->assertEquals(17.0, (float) $balance->on_hand_qty);
    }

    /**
     * 11. Test Site Isolation prevents cross-site warehouse transactions
     */
    public function test_site_isolation_prevents_cross_site_warehouse_transaction(): void
    {
        $this->actingAs($this->user);

        $this->expectException(ValidationException::class);

        // Attempt to record transaction for Site A using Warehouse B1 (which belongs to Site B)
        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseB1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 10, 'unit_cost' => 400000],
        ]);
    }

    /**
     * 12. Test Reorder Point Classification & Purchase Request (PR) Proposal without Auto-PO
     */
    public function test_reorder_point_classification_and_pr_proposal_without_auto_po(): void
    {
        $this->actingAs($this->user);

        // Item thresholds: min = 5, reorder = 10, max = 40
        $this->assertEquals('out_of_stock', InventoryService::classifyStockStatus($this->item, 0));
        $this->assertEquals('critical_stock', InventoryService::classifyStockStatus($this->item, 4));
        $this->assertEquals('low_stock', InventoryService::classifyStockStatus($this->item, 8));
        $this->assertEquals('normal', InventoryService::classifyStockStatus($this->item, 25));
        $this->assertEquals('excess_stock', InventoryService::classifyStockStatus($this->item, 50));

        // Put 4 PCS in stock (Critical Stock <= Reorder Point 10) -> Recommended order qty = 40 - 4 = 36 PCS
        $this->inventoryService->stockIn([
            'transaction_type' => 'opening_balance',
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
        ], [
            ['inventory_item_id' => $this->item->id, 'quantity' => 4, 'unit_cost' => 400000],
        ]);

        // Propose Purchase Request
        $this->post('/warehouse/purchase-requests', [
            'site_id' => $this->siteA->id,
            'warehouse_id' => $this->warehouseA1->id,
            'item_ids' => [$this->item->id],
            'requested_by' => $this->storeman->id,
            'notes' => 'PR Reorder Point Bearing',
        ])->assertSessionHas('success');

        $pr = PurchaseRequest::where('warehouse_id', $this->warehouseA1->id)->latest('id')->first();
        $this->assertNotNull($pr);
        // Must be 'submitted' proposal, NOT 'converted_to_po'
        $this->assertEquals('submitted', $pr->status);
        $this->assertEquals(36.0, (float) $pr->items->first()->recommended_qty);

        // Verify all 8 Phase 5 GET pages render with HTTP 200
        $this->get('/warehouse/dashboard')->assertStatus(200);
        $this->get('/warehouse/items')->assertStatus(200);
        $this->get('/warehouse/warehouses')->assertStatus(200);
        $this->get('/warehouse/transactions')->assertStatus(200);
        $this->get('/warehouse/stock-card')->assertStatus(200);
        $this->get('/warehouse/fulfillment')->assertStatus(200);
        $this->get('/warehouse/opname')->assertStatus(200);
        $this->get('/warehouse/reports')->assertStatus(200);
    }
}
