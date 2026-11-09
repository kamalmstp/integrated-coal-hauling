<?php

namespace Tests\Feature;

use App\Jobs\GenerateAnalyticsExportJob;
use App\Models\BreakdownReport;
use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\FuelSounding;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\InventoryBalance;
use App\Models\InventoryTransaction;
use App\Models\Location;
use App\Models\MaintenanceCost;
use App\Models\MaintenanceSchedule;
use App\Models\Material;
use App\Models\ProductionTarget;
use App\Models\PurchaseOrder;
use App\Models\ReportExportJob;
use App\Models\Shift;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\User;
use App\Models\WorkOrder;
use App\Services\ManagementAnalyticsService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportingAnalyticsTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected Site $siteA;
    protected Site $siteB;
    protected ManagementAnalyticsService $analyticsService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::where('role', 'admin')->first() ?? User::first();
        $sites = Site::where('is_active', true)->orderBy('id')->get();
        $this->siteA = $sites->first();
        $this->siteB = $sites->skip(1)->first() ?? $this->siteA;
        $this->analyticsService = app(ManagementAnalyticsService::class);
    }

    public function test_executive_dashboard_matches_exact_database_recap_and_period_comparison(): void
    {
        $dateFrom = now()->startOfMonth()->toDateString();
        $dateTo = now()->toDateString();

        // Insert a deterministic verified DumpingTicket and FuelTransaction today on Site A
        $unitA = Unit::where('site_id', $this->siteA->id)->where('is_active', true)->firstOrFail();
        $driverA = Driver::firstOrFail();
        $shiftA = Shift::where('site_id', $this->siteA->id)->first() ?? Shift::firstOrFail();
        $locLoad = Location::where('site_id', $this->siteA->id)->first() ?? Location::firstOrFail();
        $material = Material::firstOrFail();

        DumpingTicket::create([
            'ticket_number' => 'TKT-EXEC-VERIFY-001',
            'ticket_date' => $dateTo,
            'dumping_time' => now(),
            'site_id' => $this->siteA->id,
            'unit_id' => $unitA->id,
            'driver_id' => $driverA->id,
            'loading_point_id' => $locLoad->id,
            'dumping_point_id' => $locLoad->id,
            'material_id' => $material->id,
            'shift_id' => $shiftA->id,
            'tonnage' => 42.50,
            'status' => 'verified',
            'is_production' => true,
        ]);

        $filters = $this->analyticsService->resolveAuthorizedFilters($this->admin, [
            'site_id' => $this->siteA->id,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);

        $dashboard = $this->analyticsService->getExecutiveDashboard($filters);
        $kpis = $dashboard['kpis'];

        // Compare against direct database queries
        $dbTotalUnits = Unit::where('is_active', true)->where('site_id', $this->siteA->id)->count();
        $dbBreakdownUnits = Unit::where('is_active', true)
            ->where('site_id', $this->siteA->id)
            ->whereIn('status', ['breakdown', 'maintenance'])
            ->count();
        $dbAvailableUnits = $dbTotalUnits - $dbBreakdownUnits;

        $dbProdToday = round((float) DumpingTicket::where('site_id', $this->siteA->id)
            ->where('is_production', true)
            ->where('status', 'verified')
            ->whereDate('ticket_date', $dateTo)
            ->sum('tonnage'), 2);

        $dbPeriodTonnage = round((float) DumpingTicket::where('site_id', $this->siteA->id)
            ->where('is_production', true)
            ->where('status', 'verified')
            ->whereBetween('ticket_date', [$dateFrom, $dateTo])
            ->sum('tonnage'), 2);

        $dbPeriodRitase = (int) DumpingTicket::where('site_id', $this->siteA->id)
            ->where('is_production', true)
            ->where('status', 'verified')
            ->whereBetween('ticket_date', [$dateFrom, $dateTo])
            ->count();

        $dbFuelLiters = round((float) FuelTransaction::where('site_id', $this->siteA->id)
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->sum('liters'), 2);

        $this->assertEquals(1, $kpis['total_sites']);
        $this->assertEquals($dbTotalUnits, $kpis['total_units']);
        $this->assertEquals($dbAvailableUnits, $kpis['available_units']);
        $this->assertEquals($dbBreakdownUnits, $kpis['breakdown_units']);
        $this->assertEquals($dbProdToday, $kpis['total_production_today']);
        $this->assertEquals($dbPeriodTonnage, $kpis['period_production_tonnage']);
        $this->assertEquals($dbPeriodRitase, $kpis['total_ritase']);
        $this->assertEquals($dbFuelLiters, $kpis['fuel_consumption_liters']);

        // Verify Period Comparison structure & values
        $this->assertArrayHasKey('period_comparison', $dashboard);
        $this->assertEquals($dbPeriodTonnage, $dashboard['period_comparison']['tonnage_current']);
        $this->assertEquals($dbPeriodRitase, $dashboard['period_comparison']['ritase_current']);

        // Verify Drill-down traceability contains the created ticket
        $ticketNumbers = collect($dashboard['drill_down']['production_tickets'])->pluck('ticket_number');
        $this->assertTrue($ticketNumbers->contains('TKT-EXEC-VERIFY-001'));
    }

    public function test_production_report_matches_source_transactions_and_sub_aggregations(): void
    {
        $dateFrom = now()->subDays(10)->toDateString();
        $dateTo = now()->toDateString();

        $filters = $this->analyticsService->resolveAuthorizedFilters($this->admin, [
            'site_id' => $this->siteA->id,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);

        $report = $this->analyticsService->getProductionReport($filters);

        $dbTonnage = round((float) DumpingTicket::where('site_id', $this->siteA->id)
            ->where('is_production', true)
            ->where('status', 'verified')
            ->whereBetween('ticket_date', [$dateFrom, $dateTo])
            ->sum('tonnage'), 2);

        $dbRitase = (int) DumpingTicket::where('site_id', $this->siteA->id)
            ->where('is_production', true)
            ->where('status', 'verified')
            ->whereBetween('ticket_date', [$dateFrom, $dateTo])
            ->count();

        $this->assertEquals($dbTonnage, $report['summary']['total_tonnage']);
        $this->assertEquals($dbRitase, $report['summary']['total_ritase']);

        // Sum of Daily, Weekly, Monthly, Unit, Driver, Shift, Loading Point & Dumping Point must equal Total Tonnage
        $this->assertEqualsWithDelta($dbTonnage, collect($report['daily_production'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['weekly_production'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['monthly_production'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['unit_productivity'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['driver_productivity'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['shift_productivity'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['loading_point_summary'])->sum('tonnage'), 0.05);
        $this->assertEqualsWithDelta($dbTonnage, collect($report['dumping_point_summary'])->sum('tonnage'), 0.05);
    }

    public function test_fleet_and_maintenance_reports_match_source_work_orders_and_costs(): void
    {
        $dateFrom = now()->subDays(30)->toDateString();
        $dateTo = now()->toDateString();

        $filters = $this->analyticsService->resolveAuthorizedFilters($this->admin, [
            'site_id' => $this->siteA->id,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);

        $fleetReport = $this->analyticsService->getFleetReport($filters);
        $maintReport = $this->analyticsService->getMaintenanceReport($filters);

        $dbUnitsCount = Unit::where('is_active', true)->where('site_id', $this->siteA->id)->count();
        $this->assertEquals($dbUnitsCount, $fleetReport['summary']['total_units']);
        $this->assertCount($dbUnitsCount, $fleetReport['unit_performance']);

        $dbMaintCost = round((float) MaintenanceCost::where('site_id', $this->siteA->id)
            ->whereBetween('cost_date', [$dateFrom, $dateTo])
            ->sum('actual_amount'), 2);

        $dbSparepartCost = round((float) SparepartRequest::where('site_id', $this->siteA->id)
            ->whereBetween('request_date', [$dateFrom, $dateTo])
            ->sum('total_cost'), 2);

        $dbSchedulesCount = MaintenanceSchedule::where('site_id', $this->siteA->id)->count();

        $this->assertEquals($dbMaintCost, $maintReport['summary']['total_maintenance_cost_idr']);
        $this->assertEquals($dbSparepartCost, $maintReport['summary']['total_sparepart_usage_cost_idr']);
        $this->assertEquals($dbSchedulesCount, $maintReport['summary']['total_pm_schedules']);
    }

    public function test_warehouse_procurement_and_fuel_reports_match_source_balances_and_transactions(): void
    {
        $dateFrom = now()->subDays(30)->toDateString();
        $dateTo = now()->toDateString();

        $filters = $this->analyticsService->resolveAuthorizedFilters($this->admin, [
            'site_id' => $this->siteA->id,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);

        // Warehouse & Procurement Report
        $whReport = $this->analyticsService->getWarehouseProcurementReport($filters);
        $dbStockValuation = round((float) InventoryBalance::where('site_id', $this->siteA->id)->sum('total_value'), 2);
        $dbPoValue = round((float) PurchaseOrder::where('site_id', $this->siteA->id)
            ->whereBetween('po_date', [$dateFrom, $dateTo])
            ->sum('grand_total'), 2);

        $this->assertEquals($dbStockValuation, $whReport['summary']['stock_valuation_idr']);
        $this->assertEquals($dbPoValue, $whReport['summary']['total_po_value_idr']);

        // Fuel Report
        $fuelReport = $this->analyticsService->getFuelReport($filters);
        $dbFuelStock = round((float) FuelTank::where('is_active', true)
            ->where('site_id', $this->siteA->id)
            ->sum('current_stock_liters'), 2);
        $dbFuelIssued = round((float) FuelTransaction::where('site_id', $this->siteA->id)
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->sum('liters'), 2);

        $this->assertEquals($dbFuelStock, $fuelReport['summary']['fuel_stock_liters']);
        $this->assertEquals($dbFuelIssued, $fuelReport['summary']['fuel_issued_liters']);
    }

    public function test_site_and_multi_dimension_filters_and_user_site_access_restriction(): void
    {
        // Create a site-restricted supervisor assigned strictly to Site A
        $siteUser = User::create([
            'name' => 'Supervisor Site A Only',
            'username' => 'sup_site_a_analytics',
            'email' => 'sup.sitea@tap-coal.co.id',
            'password' => bcrypt('password'),
            'role' => 'supervisor',
            'site_id' => $this->siteA->id,
            'status' => 'active',
        ]);

        // Even if siteUser passes site_id = Site B in request, resolveAuthorizedFilters must lock them to Site A
        $resolved = $this->analyticsService->resolveAuthorizedFilters($siteUser, [
            'site_id' => $this->siteB->id,
            'date_from' => '2026-11-01',
            'date_to' => '2026-11-08',
        ]);

        $this->assertTrue($resolved['is_site_locked']);
        $this->assertEquals($this->siteA->id, $resolved['site_id']);

        // Test Unit filter isolation on Production Report
        $unit = Unit::where('site_id', $this->siteA->id)->firstOrFail();
        $unitFilters = $this->analyticsService->resolveAuthorizedFilters($this->admin, [
            'site_id' => $this->siteA->id,
            'unit_id' => $unit->id,
            'date_from' => now()->subDays(30)->toDateString(),
            'date_to' => now()->toDateString(),
        ]);

        $prodReport = $this->analyticsService->getProductionReport($unitFilters);
        foreach ($prodReport['source_tickets'] as $tkt) {
            $this->assertEquals($unit->id, $tkt->unit_id);
        }
    }

    public function test_excel_pdf_printable_and_background_job_exports_and_all_pages_render(): void
    {
        Storage::fake('local');

        // 1. Direct Excel Export (.csv)
        $excelResp = $this->actingAs($this->admin)->get('/analytics/export?report_type=production&format=excel');
        $excelResp->assertStatus(200);
        $this->assertStringContainsString('text/csv', $excelResp->headers->get('Content-Type'));

        // 2. Direct PDF / Printable Export Page
        $pdfResp = $this->actingAs($this->admin)->get('/analytics/export?report_type=executive&format=pdf');
        $pdfResp->assertStatus(200);

        $printResp = $this->actingAs($this->admin)->get('/analytics/print?report_type=fleet');
        $printResp->assertStatus(200);

        // 3. Background Job Export Queue (POST /analytics/export with queue_background = true)
        $bgResp = $this->actingAs($this->admin)->post('/analytics/export', [
            'report_type' => 'fuel',
            'format' => 'excel',
            'site_id' => $this->siteA->id,
            'queue_background' => true,
        ]);
        $bgResp->assertRedirect();

        $exportJob = ReportExportJob::where('report_type', 'fuel')
            ->where('is_background_job', true)
            ->latest('id')
            ->firstOrFail();

        // Execute the job handler if not already run synchronously
        if ($exportJob->status !== 'completed') {
            (new GenerateAnalyticsExportJob($exportJob->id))->handle($this->analyticsService);
            $exportJob->refresh();
        }

        $this->assertEquals('completed', $exportJob->status);
        $this->assertNotNull($exportJob->file_path);
        Storage::disk('local')->assertExists($exportJob->file_path);

        // 4. Verify all 6 Phase 11 Analytics pages render with HTTP 200
        $pages = [
            '/analytics/dashboard',
            '/analytics/production',
            '/analytics/fleet',
            '/analytics/maintenance',
            '/analytics/warehouse-procurement',
            '/analytics/fuel',
        ];

        foreach ($pages as $url) {
            $this->actingAs($this->admin)->get($url)->assertStatus(200);
        }
    }
}
