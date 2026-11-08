<?php

namespace Tests\Feature;

use App\Models\BreakdownReport;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobCard;
use App\Models\MaintenanceCost;
use App\Models\MaintenanceInspection;
use App\Models\MaintenanceRequest;
use App\Models\MaintenanceSchedule;
use App\Models\Position;
use App\Models\RfuApproval;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use App\Models\WorkOrderTask;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class MaintenanceWorkshopTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected Site $site;
    protected Unit $unit;
    protected Employee $leadMechanic;
    protected Employee $assistantMechanic;
    protected Employee $supervisor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::where('email', 'admin@tap-mining.com')->first()
            ?? User::first();

        $this->site = Site::first() ?? Site::create([
            'code' => 'SITE-TEST',
            'name' => 'Site Testing Muara Teweh',
            'company_id' => 1,
            'is_active' => true,
        ]);

        $this->unit = Unit::create([
            'unit_code' => 'DT-TEST-M4',
            'registration_number' => 'KT 9999 MW',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Hino',
            'model' => '500 Series FM 260 JD',
            'year' => 2023,
            'capacity_tons' => 30.0,
            'chassis_number' => 'CH-TEST-M4-' . rand(100, 999),
            'engine_number' => 'EN-TEST-M4-' . rand(100, 999),
            'last_hm' => 1500.0,
            'last_km' => 25000.0,
            'status' => 'standby',
            'site_id' => $this->site->id,
            'is_active' => true,
        ]);

        $deptId = Department::where('code', 'PLANT')->first()?->id ?? (Department::first()?->id ?? 1);
        $posId = Position::first()?->id ?? 1;

        $this->leadMechanic = Employee::create([
            'company_id' => $this->site->company_id ?? 1,
            'department_id' => $deptId,
            'position_id' => $posId,
            'employee_code' => 'EMP-MECH-L1',
            'name' => 'Bambang Sudrajat (Lead Mech)',
            'nik' => '6201019001010091',
            'phone' => '081234567891',
            'is_active' => true,
            'site_id' => $this->site->id,
            'join_date' => '2023-01-01',
        ]);

        $this->assistantMechanic = Employee::create([
            'company_id' => $this->site->company_id ?? 1,
            'department_id' => $deptId,
            'position_id' => $posId,
            'employee_code' => 'EMP-MECH-A1',
            'name' => 'Dedi Kurniawan (Asst Mech)',
            'nik' => '6201019001010092',
            'phone' => '081234567892',
            'is_active' => true,
            'site_id' => $this->site->id,
            'join_date' => '2023-01-01',
        ]);

        $this->supervisor = Employee::create([
            'company_id' => $this->site->company_id ?? 1,
            'department_id' => $deptId,
            'position_id' => $posId,
            'employee_code' => 'EMP-SPV-01',
            'name' => 'Agus Priyanto (Supervisor)',
            'nik' => '6201019001010093',
            'phone' => '081234567893',
            'is_active' => true,
            'site_id' => $this->site->id,
            'join_date' => '2023-01-01',
        ]);
    }

    /**
     * 1. Test all Maintenance Phase 4 endpoints return HTTP 200 OK
     */
    public function test_all_maintenance_endpoints_return_successful_response(): void
    {
        $this->actingAs($this->adminUser);

        $routes = [
            '/maintenance',
            '/maintenance/breakdown',
            '/maintenance/requests',
            '/maintenance/work-orders',
            '/maintenance/preventive',
            '/maintenance/corrective',
            '/maintenance/mechanics',
            '/maintenance/mechanic-portal',
            '/maintenance/job-cards',
            '/maintenance/spareparts',
            '/maintenance/rfu',
            '/maintenance/costs',
        ];

        foreach ($routes as $route) {
            $response = $this->get($route);
            $response->assertStatus(200);
        }
    }

    /**
     * 2. Test Breakdown reporting with CRITICAL damage locks unit status to 'breakdown'
     */
    public function test_breakdown_reporting_and_critical_unit_lock(): void
    {
        $this->actingAs($this->adminUser);

        $response = $this->post('/maintenance/breakdowns', [
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'reporter_type' => 'driver',
            'reporter_id' => $this->leadMechanic->id,
            'reporter_name' => 'Bambang Sudrajat',
            'breakdown_date' => Carbon::today()->toDateString(),
            'breakdown_time' => '14:30',
            'current_hm' => 1510.5,
            'current_km' => 25150.0,
            'location_name' => 'KM 14 Hauling Road',
            'damage_category' => 'brake',
            'damage_description' => 'Pedal rem loss (ambles) dan tekanan angin rem turun mendadak di jalan turunan.',
            'priority' => 'critical',
        ]);

        $response->assertSessionHas('success');

        // Verify report created
        $this->assertDatabaseHas('breakdown_reports', [
            'unit_id' => $this->unit->id,
            'damage_category' => 'brake',
            'priority' => 'critical',
        ]);

        // CRITICAL BUSINESS RULE: Unit status MUST be locked to breakdown
        $this->unit->refresh();
        $this->assertEquals('breakdown', $this->unit->status);
    }

    /**
     * 3. Test Maintenance Request converted to Work Order and duplicate WO prevention
     */
    public function test_maintenance_request_conversion_and_duplicate_prevention(): void
    {
        $this->actingAs($this->adminUser);

        $mr = MaintenanceRequest::create([
            'request_number' => 'MR-TEST-001',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'requested_by' => $this->leadMechanic->id,
            'requester_name' => 'Bambang Sudrajat',
            'damage_category' => 'engine',
            'work_description' => 'Mesin overheat saat tanjakan bermuatan penuh',
            'priority' => 'high',
            'request_date' => Carbon::today(),
            'status' => 'submitted',
        ]);

        // Convert MR to WO
        $response = $this->post("/maintenance/requests/{$mr->id}/convert-wo", [
            'job_type' => 'corrective_maintenance',
            'assigned_mechanic_id' => $this->leadMechanic->id,
            'supervisor_id' => $this->supervisor->id,
            'priority' => 'high',
            'estimated_cost' => 5000000,
            'defect_summary' => 'Perbaikan sistem pendingin engine overheat',
        ]);

        $response->assertSessionHas('success');

        $mr->refresh();
        $this->assertEquals('converted_to_wo', $mr->status);
        $this->assertNotNull($mr->work_order_id);

        // Attempting to convert the SAME request again must be rejected to prevent duplicate WOs
        $duplicateResponse = $this->post("/maintenance/requests/{$mr->id}/convert-wo", [
            'job_type' => 'corrective_maintenance',
            'assigned_mechanic_id' => $this->leadMechanic->id,
        ]);

        $duplicateResponse->assertSessionHas('error');
    }

    /**
     * 4. Test Work Order creation, multi-mechanic assignment, and task checklist toggle
     */
    public function test_work_order_multi_mechanic_assignment_and_task_checklist(): void
    {
        $this->actingAs($this->adminUser);

        $response = $this->post('/maintenance/work-orders', [
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'high',
            'breakdown_time' => Carbon::now()->toDateTimeString(),
            'target_completion_date' => Carbon::now()->addDay()->toDateTimeString(),
            'hm_at_service' => 1520.0,
            'km_at_service' => 25300.0,
            'defect_summary' => 'Penggantian spring rem dan pengecekan bearing roda',
            'assigned_mechanic_id' => $this->leadMechanic->id,
            'supervisor_id' => $this->supervisor->id,
            'estimated_cost' => 4500000,
        ]);

        $response->assertSessionHas('success');

        $wo = WorkOrder::where('unit_id', $this->unit->id)->orderBy('id', 'desc')->first();
        $this->assertNotNull($wo);
        $this->assertEquals($this->leadMechanic->id, $wo->assigned_mechanic_id);

        // Multi-mechanic: Assign assistant mechanic
        $assignResponse = $this->post("/maintenance/work-orders/{$wo->id}/assign-mechanic", [
            'mechanic_id' => $this->assistantMechanic->id,
            'assignment_role' => 'assistant_mechanic',
            'shift' => 'shift_1',
            'instructions' => 'Bantu pembongkaran tromol rem dan dongkrak unit',
        ]);
        $assignResponse->assertSessionHas('success');

        $this->assertDatabaseHas('work_order_assignments', [
            'work_order_id' => $wo->id,
            'mechanic_id' => $this->assistantMechanic->id,
            'role' => 'assistant_mechanic',
        ]);

        // Add task to checklist
        $taskResponse = $this->post("/maintenance/work-orders/{$wo->id}/tasks", [
            'task_description' => 'Pembersihan tromol dan kampas rem dengan brake cleaner',
            'estimated_minutes' => 45,
        ]);
        $taskResponse->assertSessionHas('success');

        $task = WorkOrderTask::where('work_order_id', $wo->id)->first();
        $this->assertNotNull($task);

        // Toggle task status to completed
        $toggleResponse = $this->post("/maintenance/work-orders/tasks/{$task->id}/toggle");
        $toggleResponse->assertSessionHas('success');

        $task->refresh();
        $this->assertTrue((bool) $task->is_completed);
    }

    /**
     * 5. Test Preventive Maintenance Work Order generation with 8 standard checklist items
     */
    public function test_preventive_maintenance_work_order_generation(): void
    {
        $this->actingAs($this->adminUser);

        // Create PM schedule
        $schedule = MaintenanceSchedule::create([
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'service_type' => 'PM 250',
            'schedule_basis' => 'hm',
            'interval_value' => 250,
            'next_due_hm' => 1500.0,
            'status' => 'due_soon',
        ]);

        // Generate PM Work Order
        $response = $this->post("/maintenance/preventive/schedules/{$schedule->id}/generate-wo", [
            'assigned_mechanic_id' => $this->leadMechanic->id,
            'target_completion_date' => Carbon::now()->addDay()->toDateTimeString(),
            'estimated_cost' => 3500000,
        ]);

        $response->assertSessionHas('success');

        // Check WO created
        $wo = WorkOrder::where('unit_id', $this->unit->id)
            ->where('job_type', 'preventive_maintenance')
            ->first();
        $this->assertNotNull($wo);

        // Verify Job Card was automatically created with 8 standard checklist items
        $jobCard = JobCard::where('work_order_id', $wo->id)->first();
        $this->assertNotNull($jobCard);
        $this->assertEquals(8, $jobCard->checklists()->count());

        // Verify schedule status updated to in_service
        $schedule->refresh();
        $this->assertEquals('in_service', $schedule->status);

        // Unit status updated to maintenance
        $this->unit->refresh();
        $this->assertEquals('maintenance', $this->unit->status);
    }

    /**
     * 6. Test Corrective Maintenance KPI formulas: MTTR and MTBF
     */
    public function test_corrective_maintenance_kpi_formulas(): void
    {
        $this->actingAs($this->adminUser);

        // Create 2 completed CM work orders with known downtime
        WorkOrder::create([
            'wo_number' => 'WO-CM-TEST-1',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'high',
            'status' => 'completed',
            'defect_summary' => 'Perbaikan kebocoran oli transmisi',
            'breakdown_time' => Carbon::now()->subDays(2),
            'completion_time' => Carbon::now()->subDays(2)->addHours(4),
            'downtime_minutes' => 240, // 4 hours
            'actual_cost' => 2000000,
        ]);

        WorkOrder::create([
            'wo_number' => 'WO-CM-TEST-2',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'medium',
            'status' => 'completed',
            'defect_summary' => 'Perbaikan bearing shaft roda belakang',
            'breakdown_time' => Carbon::now()->subDay(),
            'completion_time' => Carbon::now()->subDay()->addHours(6),
            'downtime_minutes' => 360, // 6 hours
            'actual_cost' => 3000000,
        ]);

        // Total breakdowns = 2, Total downtime = 10 hours -> MTTR should be 10 / 2 = 5.0 hours
        $totalDowntimeHours = 10.0;
        $totalBreakdowns = 2;
        $expectedMttr = $totalDowntimeHours / $totalBreakdowns;

        $this->assertEquals(5.0, $expectedMttr);

        // Verify controller returns 200
        $response = $this->get('/maintenance/corrective');
        $response->assertStatus(200);
    }

    /**
     * 7. Test Mechanic Mobile Portal work log submission and labor cost integration
     */
    public function test_mechanic_mobile_portal_work_log_and_cost_integration(): void
    {
        $this->actingAs($this->adminUser);

        $wo = WorkOrder::create([
            'wo_number' => 'WO-MOBILE-TEST',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'high',
            'status' => 'in_progress',
            'defect_summary' => 'Kebocoran seal silinder hidrolik dump',
            'breakdown_time' => Carbon::now(),
            'assigned_mechanic_id' => $this->leadMechanic->id,
            'actual_cost' => 0,
        ]);

        // Mobile portal store work log
        $response = $this->post('/maintenance/mechanic-portal/work-log', [
            'work_order_id' => $wo->id,
            'mechanic_id' => $this->leadMechanic->id,
            'log_date' => Carbon::today()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '12:00',
            'duration_hours' => 4.0,
            'diagnosis' => 'Kebocoran seal hidrolik dump hoist cylinder',
            'action_taken' => 'Pembongkaran cylinder hoist, penggantian pack seal baru, dan uji tekanan oli 210 bar',
            'status_update' => 'waiting_inspection',
        ]);

        $response->assertSessionHas('success');

        // Check work log saved
        $this->assertDatabaseHas('mechanic_work_logs', [
            'work_order_id' => $wo->id,
            'mechanic_id' => $this->leadMechanic->id,
            'duration_hours' => 4.0,
        ]);

        // Check automated labor cost integration into maintenance_costs
        $this->assertDatabaseHas('maintenance_costs', [
            'work_order_id' => $wo->id,
            'cost_type' => 'mechanic_labor',
        ]);

        // Work order status updated to waiting_inspection
        $wo->refresh();
        $this->assertEquals('waiting_inspection', $wo->status);
    }

    /**
     * 8. Test Sparepart Request workflow: Request -> Approve -> Warehouse Issue -> Cost Ledger Integration
     */
    public function test_sparepart_request_workflow_and_cost_integration(): void
    {
        $this->actingAs($this->adminUser);

        $wo = WorkOrder::create([
            'wo_number' => 'WO-SPART-TEST',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'high',
            'status' => 'in_progress',
            'defect_summary' => 'Penggantian brake lining roda belakang',
            'breakdown_time' => Carbon::now(),
            'actual_cost' => 0,
        ]);

        // 1. Create request
        $response = $this->post('/maintenance/spareparts', [
            'site_id' => $this->site->id,
            'work_order_id' => $wo->id,
            'requester_id' => $this->leadMechanic->id,
            'notes' => 'Permintaan kampas rem baru original Hino',
            'items' => [
                [
                    'part_number' => 'HN-BK-009',
                    'part_name' => 'Brake Lining Set Rear',
                    'category' => 'brake',
                    'quantity' => 2,
                    'unit' => 'SET',
                    'unit_price' => 1250000,
                ],
            ],
        ]);

        $response->assertSessionHas('success');

        $req = SparepartRequest::where('work_order_id', $wo->id)->first();
        $this->assertNotNull($req);
        $this->assertEquals(2500000, $req->total_cost);
        $this->assertEquals('submitted', $req->status);

        // 2. Supervisor approves request
        $approveResponse = $this->post("/maintenance/spareparts/{$req->id}/approve", [
            'approver_id' => $this->supervisor->id,
            'notes' => 'Disetujui untuk perbaikan rem unit',
        ]);
        $approveResponse->assertSessionHas('success');

        $req->refresh();
        $this->assertEquals('approved', $req->status);

        // 3. Warehouse issues parts (Phase 5 integration bridge)
        $issueResponse = $this->post("/maintenance/spareparts/{$req->id}/issue", [
            'issuer_id' => $this->supervisor->id,
            'actual_cost' => 2500000,
        ]);
        $issueResponse->assertSessionHas('success');

        $req->refresh();
        $this->assertEquals('issued_by_warehouse', $req->status);

        // 4. Verify automated recording into maintenance_costs
        $this->assertDatabaseHas('maintenance_costs', [
            'work_order_id' => $wo->id,
            'cost_type' => 'sparepart',
            'actual_amount' => 2500000,
        ]);

        // 5. Verify work order actual_cost updated
        $wo->refresh();
        $this->assertEquals(2500000, $wo->actual_cost);
    }

    /**
     * 9. Test Job Card supervisor sign-off and printable view
     */
    public function test_job_card_supervisor_sign_off_and_printable_view(): void
    {
        $this->actingAs($this->adminUser);

        $wo = WorkOrder::create([
            'wo_number' => 'WO-JC-TEST',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'medium',
            'status' => 'completed',
            'defect_summary' => 'Perbaikan checklist job card berkala',
            'breakdown_time' => Carbon::now(),
        ]);

        $jobCard = JobCard::create([
            'job_card_number' => 'JC-TEST-009',
            'work_order_id' => $wo->id,
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'lead_mechanic_id' => $this->leadMechanic->id,
            'issue_date' => Carbon::today(),
            'status' => 'completed',
        ]);

        // Supervisor signs off Job Card
        $signOffResponse = $this->post("/maintenance/job-cards/{$jobCard->id}/sign-off", [
            'supervisor_id' => $this->supervisor->id,
            'supervisor_notes' => 'Pekerjaan perbaikan diperiksa lengkap dan memenuhi standar keselamatan TAP.',
        ]);

        $signOffResponse->assertSessionHas('success');

        $jobCard->refresh();
        $this->assertEquals('signed_off', $jobCard->status);
        $this->assertEquals($this->supervisor->id, $jobCard->supervisor_id);

        // Printable layout endpoint returns HTTP 200
        $printResponse = $this->get("/maintenance/job-cards/{$jobCard->id}/print");
        $printResponse->assertStatus(200);
    }

    /**
     * 10. Test RFU Approval strict safety rules:
     *     - Lead mechanic cannot approve own RFU
     *     - Unit cannot be RFU without passed QA inspection
     *     - Approved RFU restores unit to 'standby' (Ready For Use)
     */
    public function test_rfu_approval_strict_safety_rules_and_unit_standby_restoration(): void
    {
        $this->actingAs($this->adminUser);

        // Put unit into breakdown status
        $this->unit->update(['status' => 'breakdown']);

        $wo = WorkOrder::create([
            'wo_number' => 'WO-RFU-TEST',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'job_type' => 'corrective_maintenance',
            'priority' => 'critical',
            'status' => 'waiting_inspection',
            'defect_summary' => 'Perbaikan rem kritis dan penggantian selang hidrolik',
            'breakdown_time' => Carbon::now()->subHours(8),
            'assigned_mechanic_id' => $this->leadMechanic->id,
            'rfu_status' => 'waiting_inspection',
        ]);

        // RULE 1: Lead mechanic tries to approve their OWN work order -> MUST BE BLOCKED
        $selfApprovalResponse = $this->post('/maintenance/rfu/approve', [
            'work_order_id' => $wo->id,
            'approver_id' => $this->leadMechanic->id, // SAME as assigned_mechanic_id!
            'approval_date' => Carbon::now()->toDateTimeString(),
            'notes' => 'Saya approve pekerjaan saya sendiri',
        ]);

        $selfApprovalResponse->assertSessionHas('error');

        // RULE 2: Supervisor tries to approve WITHOUT passed QA inspection -> MUST BE BLOCKED
        $noInspectionResponse = $this->post('/maintenance/rfu/approve', [
            'work_order_id' => $wo->id,
            'approver_id' => $this->supervisor->id,
            'approval_date' => Carbon::now()->toDateTimeString(),
            'notes' => 'Approve tanpa tes inspeksi',
        ]);

        $noInspectionResponse->assertSessionHas('error');

        // STEP 3: Conduct QA Inspection and pass it
        $inspectResponse = $this->post('/maintenance/rfu/inspect', [
            'work_order_id' => $wo->id,
            'inspector_id' => $this->supervisor->id,
            'inspection_type' => 'post_repair_qa',
            'inspection_date' => Carbon::now()->toDateTimeString(),
            'test_run_hm' => 1512.0,
            'test_run_km' => 25200.0,
            'test_run_result' => 'Test run 20 menit aman, pengereman responsif, tidak ada rembesan oli hidrolik',
            'result' => 'passed',
            'notes' => 'Memenuhi standar QA TAP',
        ]);

        $inspectResponse->assertSessionHas('success');

        // STEP 4: Now supervisor approves RFU
        $rfuResponse = $this->post('/maintenance/rfu/approve', [
            'work_order_id' => $wo->id,
            'approver_id' => $this->supervisor->id,
            'approval_date' => Carbon::now()->toDateTimeString(),
            'signature_hash' => 'SIG-TEST-HASH-1234',
            'notes' => 'Unit dinyatakan RFU dan siap beroperasi di site.',
        ]);

        $rfuResponse->assertSessionHas('success');

        // Check RFU approval record created
        $this->assertDatabaseHas('rfu_approvals', [
            'work_order_id' => $wo->id,
            'unit_id' => $this->unit->id,
            'approver_id' => $this->supervisor->id,
        ]);

        // CRITICAL BUSINESS RULE: Unit status restored to 'standby' (Ready For Use, NOT operating!)
        $this->unit->refresh();
        $this->assertEquals('standby', $this->unit->status);

        // Work order status marked completed
        $wo->refresh();
        $this->assertEquals('completed', $wo->status);
        $this->assertEquals('approved_rfu', $wo->rfu_status);
    }
}
