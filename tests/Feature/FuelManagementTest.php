<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Employee;
use App\Models\FuelCalibration;
use App\Models\FuelParameter;
use App\Models\FuelSupplier;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\Location;
use App\Models\Material;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Models\User;
use App\Services\FuelService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class FuelManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected Site $siteA;
    protected Site $siteB;
    protected FuelTank $tankA1;
    protected FuelTank $tankA2;
    protected FuelTank $tankB1;
    protected Unit $unitA;
    protected Unit $unitB;
    protected Driver $driver;
    protected Employee $fuelman;
    protected Shift $shift;
    protected FuelSupplier $supplier;
    protected FuelService $fuelService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::first() ?? User::factory()->create();
        $this->actingAs($this->user);

        $sites = Site::where('is_active', true)->orderBy('id')->get();
        $this->siteA = $sites->first();
        $this->siteB = $sites->skip(1)->first() ?? Site::create([
            'company_id' => $this->siteA->company_id,
            'code' => 'SITE-FUEL-B',
            'name' => 'Site Operasional B',
            'is_active' => true,
        ]);

        $this->fuelService = app(FuelService::class);
        $this->fuelService->getOrCreateSiteParameter($this->siteA->id);
        $this->fuelService->getOrCreateSiteParameter($this->siteB->id);

        $this->supplier = FuelSupplier::first() ?? FuelSupplier::create([
            'supplier_code' => 'SUP-TEST-01',
            'name' => 'PT Pertamina Patra Niaga Test',
            'contract_price_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        // Create clean test tanks on Site A and Site B with calibrated strapping charts
        $this->tankA1 = FuelTank::create([
            'tank_number' => 'FT-TEST-A1',
            'tank_name' => 'Main Tank A1 Test',
            'site_id' => $this->siteA->id,
            'tank_type' => 'stationary_tank',
            'shape_type' => 'calibrated_chart',
            'capacity_liters' => 20000.00,
            'minimum_alert_liters' => 4000.00,
            'max_height_cm' => 200.00,
            'opening_stock_liters' => 0,
            'current_stock_liters' => 0,
            'average_cost_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        $this->tankA2 = FuelTank::create([
            'tank_number' => 'BOWSER-TEST-A2',
            'tank_name' => 'Mobile Bowser A2 Test',
            'site_id' => $this->siteA->id,
            'tank_type' => 'mobile_bowser',
            'shape_type' => 'calibrated_chart',
            'capacity_liters' => 8000.00,
            'minimum_alert_liters' => 1500.00,
            'max_height_cm' => 160.00,
            'opening_stock_liters' => 0,
            'current_stock_liters' => 0,
            'average_cost_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        $this->tankB1 = FuelTank::create([
            'tank_number' => 'FT-TEST-B1',
            'tank_name' => 'Main Tank Site B1 Test',
            'site_id' => $this->siteB->id,
            'tank_type' => 'stationary_tank',
            'shape_type' => 'calibrated_chart',
            'capacity_liters' => 20000.00,
            'minimum_alert_liters' => 4000.00,
            'max_height_cm' => 200.00,
            'opening_stock_liters' => 0,
            'current_stock_liters' => 0,
            'average_cost_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        // Seed non-linear calibration strapping tables for tankA1 (200 cm -> 20,000 L)
        // 0 cm = 0 L, 50 cm = 3,910 L, 100 cm = 10,000 L, 150 cm = 16,090 L, 200 cm = 20,000 L
        $chartPoints = [
            [0, 0],
            [50, 3910],
            [100, 10000],
            [150, 16090],
            [200, 20000],
        ];
        foreach ([$this->tankA1, $this->tankB1] as $t) {
            foreach ($chartPoints as [$h, $v]) {
                FuelCalibration::create([
                    'fuel_tank_id' => $t->id,
                    'height_cm' => $h,
                    'volume_liters' => $v,
                    'mm_increment_factor' => 10.0,
                    'calibration_certificate_no' => 'CERT-TEST-2026',
                    'calibrated_date' => now()->toDateString(),
                ]);
            }
        }

        $this->unitA = Unit::where('site_id', $this->siteA->id)->first() ?? Unit::create([
            'unit_code' => 'DT-FUEL-A01',
            'registration_number' => 'KT 8001 FA',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Scania',
            'model' => 'P360',
            'last_hm' => 1200.0,
            'last_km' => 30000.0,
            'status' => 'operating',
            'site_id' => $this->siteA->id,
            'is_active' => true,
        ]);

        $this->unitB = Unit::where('site_id', $this->siteB->id)->first() ?? Unit::create([
            'unit_code' => 'DT-FUEL-B01',
            'registration_number' => 'KT 8002 FB',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Volvo',
            'model' => 'FMX 400',
            'last_hm' => 500.0,
            'last_km' => 12000.0,
            'status' => 'operating',
            'site_id' => $this->siteB->id,
            'is_active' => true,
        ]);

        $this->driver = Driver::first();
        $this->fuelman = Employee::where('site_id', $this->siteA->id)->first();
        $this->shift = Shift::first();
    }

    public function test_fuel_receiving_opening_stock_and_fuel_stock_calculation(): void
    {
        // 1. Record Opening Stock of 5,000 L @ Rp 14,000/L
        $openRec = $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => now()->toDateString(),
            'received_by' => $this->fuelman?->id,
        ], [
            [
                'fuel_tank_id' => $this->tankA1->id,
                'received_volume_liters' => 5000,
                'unit_price' => 14000,
            ],
        ]);

        $this->tankA1->refresh();
        $this->assertEquals(5000, (float) $this->tankA1->opening_stock_liters);
        $this->assertEquals(5000, (float) $this->tankA1->current_stock_liters);

        // 2. Record Fuel Purchase Receiving of 5,000 L @ Rp 15,000/L with Supplier Invoice
        $purchaseRec = $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'fuel_receiving',
            'receipt_date' => now()->toDateString(),
            'fuel_supplier_id' => $this->supplier->id,
            'po_number' => 'PO-SOLAR-001',
            'do_number' => 'DO-SOLAR-001',
            'invoice_number' => 'INV-SOLAR-001',
            'invoice_date' => now()->toDateString(),
        ], [
            [
                'fuel_tank_id' => $this->tankA1->id,
                'do_volume_liters' => 5000,
                'received_volume_liters' => 5000,
                'unit_price' => 15000,
            ],
        ]);

        $this->tankA1->refresh();
        $this->assertEquals('invoiced', $purchaseRec->invoice_status);
        $this->assertEquals(10000, (float) $this->tankA1->current_stock_liters);
        // MWA Cost: (5,000*14,000 + 5,000*15,000) / 10,000 = 14,500
        $this->assertEquals(14500, (float) $this->tankA1->average_cost_per_liter);
    }

    public function test_fuel_dispensing_digital_ticket_and_unit_hm_km_integration(): void
    {
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => now()->toDateString(),
        ], [
            [
                'fuel_tank_id' => $this->tankA1->id,
                'received_volume_liters' => 4000,
                'unit_price' => 14850,
            ],
        ]);

        $prevHm = (float) $this->unitA->last_hm;
        $prevKm = (float) $this->unitA->last_km;

        $tx = $this->fuelService->dispenseFuel([
            'site_id' => $this->siteA->id,
            'shift_id' => $this->shift?->id,
            'source_tank_id' => $this->tankA1->id,
            'unit_id' => $this->unitA->id,
            'driver_id' => $this->driver?->id,
            'fuelman_id' => $this->fuelman?->id,
            'transaction_date' => now()->toDateString(),
            'transaction_time' => '09:30:00',
            'current_hm' => $prevHm + 10.0,
            'current_km' => $prevKm + 150.0,
            'liters' => 250.0,
            'remarks' => 'Refuel DT Hauling Shift 1',
        ]);

        $this->assertNotEmpty($tx->digital_ticket_code);
        $this->assertEquals(250.0, (float) $tx->liters);
        $this->assertEquals(10.0, (float) $tx->hm_delta);
        $this->assertEquals(150.0, (float) $tx->km_delta);

        // Tank stock reduced accurately: 4,000 - 250 = 3,750 L
        $this->assertEquals(3750.0, (float) $this->tankA1->fresh()->current_stock_liters);

        // Unit last_hm and last_km updated automatically
        $this->unitA->refresh();
        $this->assertEquals($prevHm + 10.0, (float) $this->unitA->last_hm);
        $this->assertEquals($prevKm + 150.0, (float) $this->unitA->last_km);

        // Digital Fuel Ticket view renders HTTP 200
        $response = $this->get("/fuel/dispensing/{$tx->id}/ticket");
        $response->assertStatus(200);
    }

    public function test_fuel_dispensing_cannot_exceed_available_stock_without_official_adjustment(): void
    {
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => now()->toDateString(),
        ], [
            [
                'fuel_tank_id' => $this->tankA1->id,
                'received_volume_liters' => 200,
                'unit_price' => 14850,
            ],
        ]);

        // Attempt to dispense 300 L when only 200 L is available -> MUST fail
        $failed = false;
        try {
            $this->fuelService->dispenseFuel([
                'site_id' => $this->siteA->id,
                'source_tank_id' => $this->tankA1->id,
                'unit_id' => $this->unitA->id,
                'liters' => 300,
            ]);
        } catch (ValidationException $e) {
            $failed = true;
        }
        $this->assertTrue($failed, 'Dispensing exceeding available tank stock must be rejected.');
        $this->assertEquals(200.0, (float) $this->tankA1->fresh()->current_stock_liters);

        // Perform official Fuel Adjustment (+150 L gain from sounding reconciliation) -> Stock becomes 350 L
        $adj = $this->fuelService->createAndApproveFuelAdjustment([
            'site_id' => $this->siteA->id,
            'fuel_tank_id' => $this->tankA1->id,
            'adjustment_date' => now()->toDateString(),
            'adjustment_type' => 'sounding_correction',
            'adjustment_liters' => 150,
            'reason' => 'Koreksi resmi berdasarkan hasil kalibrasi sounding fisik.',
        ], true);

        $this->assertEquals('approved', $adj->status);
        $this->assertEquals(350.0, (float) $this->tankA1->fresh()->current_stock_liters);

        // Now dispensing 300 L succeeds and leaves 50 L
        $tx = $this->fuelService->dispenseFuel([
            'site_id' => $this->siteA->id,
            'source_tank_id' => $this->tankA1->id,
            'unit_id' => $this->unitA->id,
            'liters' => 300,
        ]);
        $this->assertEquals('completed', $tx->status);
        $this->assertEquals(50.0, (float) $this->tankA1->fresh()->current_stock_liters);
    }

    public function test_daily_tank_sounding_uses_validated_calibration_chart_never_raw_cm(): void
    {
        // Set book stock to 7,000 L
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => now()->toDateString(),
        ], [
            [
                'fuel_tank_id' => $this->tankA1->id,
                'received_volume_liters' => 7000,
                'unit_price' => 14850,
            ],
        ]);

        // Sounding at 75 cm:
        // On strapping table: 50 cm = 3,910 L and 100 cm = 10,000 L
        // Midpoint 75 cm must interpolate to: 3,910 + 0.5 * (10,000 - 3,910) = 6,955.00 L (NEVER 75 L!)
        $sounding = $this->fuelService->recordTankSounding([
            'site_id' => $this->siteA->id,
            'fuel_tank_id' => $this->tankA1->id,
            'sounding_date' => now()->toDateString(),
            'sounding_time' => '17:00:00',
            'measurement_cm' => 75.0,
            'remarks' => 'Sounding sore',
        ]);

        $this->assertNotEquals(75.0, (float) $sounding->estimated_volume_liters);
        $this->assertEquals(6955.00, (float) $sounding->estimated_volume_liters);
        $this->assertEquals(7000.00, (float) $sounding->system_stock_liters);
        $this->assertEquals(-45.00, (float) $sounding->variance_liters);
        $this->assertEquals('calibration_chart', $sounding->calibration_method);
    }

    public function test_fuel_reconciliation_compares_all_movements_against_physical_sounding(): void
    {
        $today = now()->toDateString();

        // 1. Opening Stock = 10,000 L
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => $today,
        ], [
            ['fuel_tank_id' => $this->tankA1->id, 'received_volume_liters' => 10000, 'unit_price' => 14850],
        ]);

        // 2. Fuel Received today = +4,000 L (Total = 14,000 L)
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'fuel_receiving',
            'receipt_date' => $today,
        ], [
            ['fuel_tank_id' => $this->tankA1->id, 'received_volume_liters' => 4000, 'unit_price' => 14850],
        ]);

        // 3. Transfer Out to Bowser A2 = -2,000 L (Total = 12,000 L)
        $this->fuelService->transferFuel([
            'site_id' => $this->siteA->id,
            'source_tank_id' => $this->tankA1->id,
            'destination_tank_id' => $this->tankA2->id,
            'transaction_date' => $today,
            'liters' => 2000,
        ]);

        // 4. Fuel Issued (Dispensing) = -2,000 L (System Closing = 10,000 L)
        $this->fuelService->dispenseFuel([
            'site_id' => $this->siteA->id,
            'source_tank_id' => $this->tankA1->id,
            'unit_id' => $this->unitA->id,
            'transaction_date' => $today,
            'liters' => 2000,
        ]);

        // 5. Physical Sounding at 100 cm -> 10,000 L on calibration chart
        $sounding = $this->fuelService->recordTankSounding([
            'site_id' => $this->siteA->id,
            'fuel_tank_id' => $this->tankA1->id,
            'sounding_date' => $today,
            'sounding_time' => '18:00:00',
            'measurement_cm' => 100.0,
        ]);

        $recon = $this->fuelService->generateTankReconciliation([
            'site_id' => $this->siteA->id,
            'fuel_tank_id' => $this->tankA1->id,
            'reconciliation_date' => $today,
            'opening_stock_liters' => 10000,
            'fuel_sounding_id' => $sounding->id,
        ]);

        $this->assertEquals(10000.0, (float) $recon->opening_stock_liters);
        $this->assertEquals(4000.0, (float) $recon->fuel_received_liters);
        $this->assertEquals(2000.0, (float) $recon->transfer_out_liters);
        $this->assertEquals(2000.0, (float) $recon->fuel_issued_liters);
        $this->assertEquals(10000.0, (float) $recon->system_closing_stock_liters);
        $this->assertEquals(10000.0, (float) $recon->physical_sounding_liters);
        $this->assertEquals(0.0, (float) $recon->variance_liters);
        $this->assertEquals('balanced', $recon->status);
    }

    public function test_fuel_consumption_analysis_fuel_ratio_production_integration_and_configurable_00475_parameter(): void
    {
        $today = now()->toDateString();

        // Create a dedicated Unit on Site A for exact ratio & estimation verification
        $testUnit = Unit::create([
            'unit_code' => 'DT-RATIO-99',
            'registration_number' => 'KT 9999 RT',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Scania',
            'model' => 'P410',
            'last_hm' => 2000.0,
            'last_km' => 50000.0,
            'status' => 'operating',
            'site_id' => $this->siteA->id,
            'is_active' => true,
        ]);

        // Ensure Site A parameter is set to default: estimation_factor = 0.0475, default_haul_distance_km = 30.0
        $this->fuelService->updateSiteParameter($this->siteA->id, [
            'estimation_factor' => 0.047500,
            'default_haul_distance_km' => 30.00,
            'standard_fuel_price_per_liter' => 15000.00,
            'authorization_notes' => 'Set standar pengujian 30 KM x 0.0475',
        ]);

        // Create a Verified Production Ticket of 100 Ton for DT-RATIO-99
        $locLoad = Location::where('site_id', $this->siteA->id)->first();
        $locDump = Location::where('site_id', $this->siteA->id)->skip(1)->first() ?? $locLoad;
        $material = Material::first();

        $ticket = DumpingTicket::create([
            'ticket_number' => 'TCK-FUEL-TEST-99',
            'ticket_date' => $today,
            'dumping_time' => now(),
            'site_id' => $this->siteA->id,
            'unit_id' => $testUnit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $locLoad->id,
            'dumping_point_id' => $locDump->id,
            'material_id' => $material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 100.00,
            'status' => 'verified',
            'is_production' => true,
        ]);

        // Fund tankA1 and Dispense Actual Fuel = 150 Liters (with +10 HM and +60 KM)
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => $today,
        ], [
            ['fuel_tank_id' => $this->tankA1->id, 'received_volume_liters' => 5000, 'unit_price' => 15000],
        ]);

        $this->fuelService->dispenseFuel([
            'site_id' => $this->siteA->id,
            'shift_id' => $this->shift->id,
            'source_tank_id' => $this->tankA1->id,
            'unit_id' => $testUnit->id,
            'driver_id' => $this->driver->id,
            'dumping_ticket_id' => $ticket->id,
            'transaction_date' => $today,
            'current_hm' => 2010.0, // +10 HM
            'current_km' => 50060.0, // +60 KM
            'liters' => 150.0,
        ]);

        // Analyze consumption for DT-RATIO-99
        $analysis = $this->fuelService->analyzeFuelConsumption([
            'site_id' => $this->siteA->id,
            'unit_id' => $testUnit->id,
        ]);

        // Expected Estimated Fuel = Tonnage (100) * Distance (30) * Factor (0.0475) = 142.50 L
        // Actual Fuel = 150.00 L (Strictly separated from Estimated Fuel!)
        // Liter per Ton = 150 / 100 = 1.5000 L/Ton
        // Liter per HM = 150 / 10 = 15.0000 L/HM
        // Liter per KM = 150 / 60 = 2.5000 L/KM
        $this->assertEquals(150.00, $analysis['summary']['actual_fuel_liters']);
        $this->assertEquals(142.50, $analysis['summary']['estimated_fuel_liters']);
        $this->assertEquals(7.50, $analysis['summary']['variance_liters']);
        $this->assertEquals(1.5000, $analysis['summary']['liter_per_ton']);
        $this->assertEquals(15.0000, $analysis['summary']['liter_per_hm']);
        $this->assertEquals(2.5000, $analysis['summary']['liter_per_km']);

        // Now update site estimation factor via authorized controller endpoint to 0.0500
        $res = $this->post('/fuel/parameters', [
            'site_id' => $this->siteA->id,
            'estimation_factor' => 0.0500,
            'default_haul_distance_km' => 30.00,
            'standard_fuel_price_per_liter' => 15000.00,
            'authorization_notes' => 'Penyesuaian faktor estimasi musim hujan',
        ]);
        $res->assertStatus(302);

        $analysisUpdated = $this->fuelService->analyzeFuelConsumption([
            'site_id' => $this->siteA->id,
            'unit_id' => $testUnit->id,
        ]);
        // New Estimated Fuel = 100 * 30 * 0.0500 = 150.00 L, while Actual Fuel remains 150.00 L
        $this->assertEquals(150.00, $analysisUpdated['summary']['estimated_fuel_liters']);
        $this->assertEquals(150.00, $analysisUpdated['summary']['actual_fuel_liters']);
    }

    public function test_concurrent_fuel_transactions_maintain_exact_stock_integrity(): void
    {
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => now()->toDateString(),
        ], [
            ['fuel_tank_id' => $this->tankA1->id, 'received_volume_liters' => 1000, 'unit_price' => 14850],
        ]);

        // Execute 4 sequential/locked dispensing transactions of 250 L each (= 1,000 L total)
        for ($i = 1; $i <= 4; $i++) {
            $this->fuelService->dispenseFuel([
                'site_id' => $this->siteA->id,
                'source_tank_id' => $this->tankA1->id,
                'unit_id' => $this->unitA->id,
                'liters' => 250,
            ]);
        }

        $this->assertEquals(0.0, (float) $this->tankA1->fresh()->current_stock_liters);

        // 5th transaction of even 1 Liter must be blocked
        $this->expectException(ValidationException::class);
        $this->fuelService->dispenseFuel([
            'site_id' => $this->siteA->id,
            'source_tank_id' => $this->tankA1->id,
            'unit_id' => $this->unitA->id,
            'liters' => 1,
        ]);
    }

    public function test_site_isolation_enforced_across_fuel_operations(): void
    {
        $this->fuelService->recordFuelReceipt([
            'site_id' => $this->siteA->id,
            'receipt_type' => 'opening_stock',
            'receipt_date' => now()->toDateString(),
        ], [
            ['fuel_tank_id' => $this->tankA1->id, 'received_volume_liters' => 3000, 'unit_price' => 14850],
        ]);

        // Attempt to dispense from Site A Tank (tankA1) into Site B Unit (unitB) -> must fail
        $this->expectException(ValidationException::class);
        $this->fuelService->dispenseFuel([
            'site_id' => $this->siteA->id,
            'source_tank_id' => $this->tankA1->id,
            'unit_id' => $this->unitB->id,
            'liters' => 100,
        ]);
    }

    public function test_all_fuel_management_pages_render_successfully(): void
    {
        $routes = [
            '/fuel/dashboard',
            '/fuel/inventory',
            '/fuel/soundings',
            '/fuel/dispensing',
            '/fuel/analytics',
        ];

        foreach ($routes as $uri) {
            $response = $this->get($uri);
            $response->assertStatus(200);
        }
    }
}
