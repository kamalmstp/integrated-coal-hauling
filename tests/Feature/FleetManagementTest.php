<?php

namespace Tests\Feature;

use App\Models\DailyDispatch;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\Location;
use App\Models\MaintenanceServiceInterval;
use App\Models\Material;
use App\Models\P2hInspection;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\User;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class FleetManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected Site $site;
    protected Unit $unit;
    protected Driver $driver;
    protected Shift $shift;
    protected Employee $mechanic;

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
            'unit_code' => 'DT-UNIT-TEST',
            'registration_number' => 'KT 7777 TEST',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Hino',
            'model' => 'FM 260 JD',
            'year' => 2024,
            'capacity_ton' => 25.0,
            'capacity_m3' => 18.0,
            'last_hm' => 1000.0,
            'last_km' => 25000.0,
            'status' => 'standby',
            'site_id' => $this->site->id,
            'is_active' => true,
        ]);

        $this->driver = Driver::first() ?? Driver::create([
            'driver_code' => 'DRV-TEST',
            'employee_id' => 1,
            'sim_number' => 'SIM-12345',
            'simper_number' => 'SMP-12345',
            'simper_valid_until' => Carbon::now()->addYear(),
            'mcu_status' => 'fit',
            'is_active' => true,
        ]);

        $this->shift = Shift::first() ?? Shift::create([
            'name' => 'Shift 1 Pagi',
            'code' => 'S1',
            'start_time' => '06:00:00',
            'end_time' => '18:00:00',
            'is_active' => true,
        ]);

        $this->mechanic = Employee::first() ?? Employee::create([
            'employee_code' => 'MECH-01',
            'name' => 'Ahmad Mekanik Senior',
            'nik' => '7371000000000099',
            'phone' => '081234567899',
            'is_active' => true,
        ]);
    }

    /**
     * Test 1: Unit Registry & Auto Generation of PM Service Intervals
     */
    public function test_fleet_registry_page_and_creation_with_pm_intervals()
    {
        $response = $this->actingAs($this->adminUser)->get('/fleet/registry');
        $response->assertStatus(200);

        $unitCode = 'DT-NEW-' . rand(100, 999);
        $createResponse = $this->actingAs($this->adminUser)->post('/fleet/registry', [
            'unit_code' => $unitCode,
            'registration_number' => 'KT ' . rand(1000, 9999) . ' TAP',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Scania',
            'model' => 'P360',
            'year' => 2025,
            'capacity_ton' => 30.0,
            'capacity_m3' => 22.0,
            'last_hm' => 240.0,
            'last_km' => 6000.0,
            'status' => 'standby',
            'site_id' => $this->site->id,
        ]);

        $createResponse->assertRedirect();

        $newUnit = Unit::where('unit_code', $unitCode)->first();
        $this->assertNotNull($newUnit);

        // Verify default PM intervals (PM 250, PM 500, PM 1000, PM 2000) are generated
        $intervals = MaintenanceServiceInterval::where('unit_id', $newUnit->id)->get();
        $this->assertCount(4, $intervals);
        $this->assertTrue($intervals->pluck('service_type')->contains('PM_250'));
        $this->assertTrue($intervals->pluck('service_type')->contains('PM_2000'));
    }

    /**
     * Test 2: Digital P2H submission with all Good items -> Unit is RFU
     */
    public function test_digital_p2h_all_good_results_in_rfu()
    {
        $items = [];
        $standardItems = [
            'Engine', 'Oil', 'Coolant', 'Brake', 'Steering',
            'Tire', 'Wheel Nut', 'Lamp', 'Horn', 'Mirror',
            'Seat Belt', 'Body', 'Hydraulic', 'Battery', 'Safety Equipment'
        ];

        foreach ($standardItems as $name) {
            $items[] = [
                'item_name' => $name,
                'category' => 'Inspection',
                'is_critical' => in_array($name, ['Brake', 'Steering', 'Hydraulic']),
                'status' => 'good',
                'defect_description' => null,
                'photo_path' => null,
            ];
        }

        $response = $this->actingAs($this->adminUser)->post('/fleet/p2h', [
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'shift_id' => $this->shift->id,
            'inspection_date' => Carbon::today()->toDateString(),
            'inspection_time' => '06:15',
            'current_hm' => 1005.0,
            'current_km' => 25100.0,
            'driver_notes' => 'Armada sangat prima, siap hauling.',
            'items' => $items,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $latestP2h = P2hInspection::where('unit_id', $this->unit->id)->latest()->first();
        $this->assertNotNull($latestP2h);
        $this->assertEquals('rfu', $latestP2h->overall_condition);
        $this->assertFalse($latestP2h->has_critical_defect);

        // Unit must be RFU
        $this->unit->refresh();
        $this->assertTrue($this->unit->isRfu());
    }

    /**
     * Test 3: Digital P2H submission with Critical Defect (e.g. Brake failure)
     * Critical Rule: Unit CANNOT be RFU! Must be marked breakdown, and auto Work Order is created!
     */
    public function test_critical_p2h_defect_marks_unit_breakdown_and_creates_work_order()
    {
        $items = [];
        $standardItems = [
            'Engine', 'Oil', 'Coolant', 'Brake', 'Steering',
            'Tire', 'Wheel Nut', 'Lamp', 'Horn', 'Mirror',
            'Seat Belt', 'Body', 'Hydraulic', 'Battery', 'Safety Equipment'
        ];

        foreach ($standardItems as $name) {
            $isBrake = ($name === 'Brake');
            $items[] = [
                'item_name' => $name,
                'category' => 'Brake & Steering',
                'is_critical' => in_array($name, ['Brake', 'Steering']),
                'status' => $isBrake ? 'not_good' : 'good',
                'defect_description' => $isBrake ? 'Tekanan angin rem bocor drastis, pedal amblas' : null,
                'photo_path' => null,
            ];
        }

        $response = $this->actingAs($this->adminUser)->post('/fleet/p2h', [
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'shift_id' => $this->shift->id,
            'inspection_date' => Carbon::today()->toDateString(),
            'inspection_time' => '06:20',
            'current_hm' => 1010.0,
            'current_km' => 25200.0,
            'driver_notes' => 'Bahaya rem tidak berfungsi normal!',
            'items' => $items,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error'); // Must have error flash alerting critical defect

        $latestP2h = P2hInspection::where('unit_id', $this->unit->id)->latest()->first();
        $this->assertNotNull($latestP2h);
        $this->assertEquals('not_rfu', $latestP2h->overall_condition);
        $this->assertTrue((bool) $latestP2h->has_critical_defect);

        // Unit status MUST be changed to breakdown
        $this->unit->refresh();
        $this->assertEquals('breakdown', $this->unit->status);
        $this->assertFalse($this->unit->isRfu());

        // An emergency Work Order must automatically be dispatched!
        $workOrder = WorkOrder::where('p2h_inspection_id', $latestP2h->id)->first();
        $this->assertNotNull($workOrder);
        $this->assertEquals('critical_emergency', $workOrder->priority);
        $this->assertEquals('open', $workOrder->status);
        $this->assertStringContainsString('Brake', $workOrder->defect_summary);
    }

    /**
     * Test 4: HM/KM Shift Logging, Validation, and Anomaly Detection
     */
    public function test_hm_km_validation_and_anomaly_detection()
    {
        // 4.1 Reject when End HM < Start HM
        $invalidResponse = $this->actingAs($this->adminUser)->post('/fleet/hm-km', [
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'shift_id' => $this->shift->id,
            'log_date' => Carbon::today()->toDateString(),
            'start_hm' => 1500.0,
            'end_hm' => 1400.0, // Invalid!
            'start_km' => 30000.0,
            'end_km' => 30100.0,
        ]);

        $invalidResponse->assertSessionHasErrors('end_hm');

        // 4.2 Detect Anomaly when delta HM > 14 hours in 1 shift
        $anomalyResponse = $this->actingAs($this->adminUser)->post('/fleet/hm-km', [
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'shift_id' => $this->shift->id,
            'log_date' => Carbon::today()->toDateString(),
            'start_hm' => 1000.0,
            'end_hm' => 1018.0, // 18 hours in 1 shift!
            'start_km' => 25000.0,
            'end_km' => 25200.0,
            'notes' => 'Test anomaly detection',
        ]);

        $anomalyResponse->assertRedirect();
        $anomalyResponse->assertSessionHas('warning');

        $log = UnitHmKmLog::where('unit_id', $this->unit->id)->latest()->first();
        $this->assertNotNull($log);
        $this->assertTrue((bool) $log->is_anomaly);
        $this->assertStringContainsString('melebihi batas wajar', $log->anomaly_reason);
    }

    /**
     * Test 5: Work Order Workflow & RFU Restoration on Completion
     */
    public function test_work_order_workflow_and_rfu_restoration_on_completion()
    {
        // Set unit to operating
        $this->unit->update(['status' => 'operating']);

        // Create Work Order
        $wo = WorkOrder::create([
            'wo_number' => 'WO-TEST-RESTORE',
            'unit_id' => $this->unit->id,
            'source' => 'road_breakdown',
            'priority' => 'high',
            'breakdown_time' => Carbon::now()->subHours(3),
            'defect_summary' => 'Pipa oli hidrolik pecah saat dumping batubara',
            'assigned_mechanic_id' => $this->mechanic->id,
            'status' => 'open',
            'created_by' => $this->adminUser->id,
        ]);

        $this->unit->update(['status' => 'breakdown']);
        $this->assertFalse($this->unit->isRfu());

        // Update to in_progress
        $this->actingAs($this->adminUser)->put("/fleet/work-orders/{$wo->id}/status", [
            'status' => 'in_progress',
            'assigned_mechanic_id' => $this->mechanic->id,
        ]);

        $this->unit->refresh();
        $this->assertEquals('maintenance', $this->unit->status);

        // Update to completed -> MUST calculate downtime and restore status to 'standby' (RFU)!
        $completeResponse = $this->actingAs($this->adminUser)->put("/fleet/work-orders/{$wo->id}/status", [
            'status' => 'completed',
            'action_taken' => 'Ganti selang hidrolik baru 2 inch, isi oli hidrolik 15L, tes hidrolik normal',
            'assigned_mechanic_id' => $this->mechanic->id,
        ]);

        $completeResponse->assertRedirect();

        $wo->refresh();
        $this->assertEquals('completed', $wo->status);
        $this->assertNotNull($wo->completion_time);
        $this->assertGreaterThan(0, $wo->downtime_minutes);

        // CRITICAL CHECK: Unit status is restored to standby and is RFU!
        $this->unit->refresh();
        $this->assertEquals('standby', $this->unit->status);
        $this->assertTrue($this->unit->isRfu());
    }

    /**
     * Test 6: Dispatch Restriction: Breakdown or Not-RFU Unit CANNOT be Assigned
     */
    public function test_dispatch_assignment_restriction_rejects_breakdown_or_non_rfu_unit()
    {
        $loadingPoint = Location::whereIn('location_type', ['pit', 'front_loading'])->first() ?? Location::create([
            'name' => 'Pit Alpha',
            'code' => 'PIT-A',
            'location_type' => 'pit',
            'is_active' => true,
        ]);

        $dumpingPoint = Location::whereIn('location_type', ['stockpile', 'jetty'])->first() ?? Location::create([
            'name' => 'Stockpile KM 36',
            'code' => 'SP-36',
            'location_type' => 'stockpile',
            'is_active' => true,
        ]);

        $material = Material::first() ?? Material::create([
            'name' => 'Coal High Calorie',
            'code' => 'COAL-HC',
            'unit' => 'ton',
            'is_active' => true,
        ]);

        $dispatch = DailyDispatch::create([
            'dispatch_number' => 'DSP-TEST-RESTRICT',
            'date' => Carbon::today()->toDateString(),
            'site_id' => $this->site->id,
            'shift_id' => $this->shift->id,
            'status' => 'active',
            'created_by' => $this->adminUser->id,
        ]);

        // Put unit into breakdown status
        $this->unit->update(['status' => 'breakdown']);

        // Attempting to assign a breakdown unit MUST throw validation exception
        $response = $this->actingAs($this->adminUser)->post("/production/dispatch/{$dispatch->id}/assignments", [
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $loadingPoint->id,
            'dumping_point_id' => $dumpingPoint->id,
            'material_id' => $material->id,
            'target_ritase' => 5,
        ]);

        $response->assertSessionHasErrors('unit_id');
    }

    /**
     * Test 7: Fleet KPI Formulas & Calculations Check
     */
    public function test_fleet_kpi_formulas_and_availability_calculation()
    {
        $response = $this->actingAs($this->adminUser)->get('/fleet/kpi');
        $response->assertStatus(200);

        // Check Inertia response contains KPI metrics and explicit formula definitions
        $response->assertInertia(fn ($page) => $page
            ->component('Fleet/KPI/Index')
            ->has('metrics')
            ->has('formulas')
            ->where('formulas.calendar_hours', 'TH = 24.0 jam × Jumlah Unit × Jumlah Hari')
            ->where('formulas.physical_availability', 'PA = ((OH + SB) / TH) × 100% = ((TH - DT) / TH) × 100% [Pembagi: Total Calendar Hours]')
            ->where('formulas.mechanical_availability', 'MA = (OH / (OH + DT)) × 100% [Pembagi: Jam Operasi + Jam Downtime]')
            ->where('formulas.utilization_ua', 'UA = (OH / (OH + SB)) × 100% [Pembagi: Jam Siap Operasi / RFU Hours]')
            ->has('dailyTrends')
            ->has('unitBreakdown')
        );
    }
}
