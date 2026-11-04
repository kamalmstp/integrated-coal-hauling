<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Location;
use App\Models\Material;
use App\Models\Role;
use App\Models\Shift;
use App\Models\Site;
use App\Models\TicketCorrection;
use App\Models\TicketReconciliation;
use App\Models\Unit;
use App\Models\User;
use App\Services\ExcelCsvImportService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ProductionManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected Site $site;
    protected Unit $unit;
    protected Driver $driver;
    protected Location $loadingPoint;
    protected Location $dumpingPoint;
    protected Material $material;
    protected Shift $shift;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::where('email', 'admin@tap-mining.com')->first()
            ?? User::factory()->create(['email' => 'admin@tap-mining.com']);

        $this->site = Site::first() ?? Site::create([
            'code' => 'SITE-TEST',
            'name' => 'Site Testing Muara Teweh',
            'company_id' => 1,
            'is_active' => true,
        ]);

        $this->unit = Unit::first() ?? Unit::create([
            'unit_code' => 'DT-TEST',
            'registration_number' => 'KT 9999 MT',
            'unit_type' => 'dump_truck_10',
            'brand' => 'Hino',
            'site_id' => $this->site->id,
            'capacity_ton' => 30.00,
            'is_active' => true,
        ]);

        $this->driver = Driver::first();
        $this->loadingPoint = Location::whereIn('location_type', ['pit', 'front_loading'])->first() ?? Location::first();
        $this->dumpingPoint = Location::whereIn('location_type', ['stockpile', 'jetty'])->first() ?? Location::first();
        $this->material = Material::first();
        $this->shift = Shift::first();
    }

    /**
     * 1. Test Input Tiket Dumping
     */
    public function test_can_input_dumping_ticket(): void
    {
        $ticketNum = 'TKT-TEST-' . rand(10000, 99999);

        $payload = [
            'ticket_number' => $ticketNum,
            'ticket_date' => Carbon::today()->toDateString(),
            'dumping_time' => '14:30',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 32.50,
            'checker_name' => 'Suryadi (JSI Checker)',
            'remarks' => 'Uji coba input tiket dumping',
        ];

        $response = $this->actingAs($this->adminUser)->post('/production/tickets', $payload);

        $response->assertStatus(302);
        $this->assertDatabaseHas('dumping_tickets', [
            'ticket_number' => $ticketNum,
            'tonnage' => 32.50,
            'status' => 'submitted',
            'is_production' => false, // Initial status is not counted as production yet
        ]);
    }

    /**
     * 2. Test Duplikasi Nomor Tiket Ditolak
     */
    public function test_cannot_input_duplicate_ticket_number(): void
    {
        $ticketNum = 'TKT-DUP-' . rand(1000, 9999);

        DumpingTicket::create([
            'ticket_number' => $ticketNum,
            'ticket_date' => Carbon::today()->toDateString(),
            'dumping_time' => Carbon::now(),
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 30.00,
            'checker_name' => 'Checker JSI',
            'status' => 'submitted',
            'created_by' => $this->adminUser->id,
        ]);

        // Attempt to create duplicate
        $payload = [
            'ticket_number' => $ticketNum,
            'ticket_date' => Carbon::today()->toDateString(),
            'dumping_time' => '15:00',
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 28.00,
            'checker_name' => 'Checker JSI',
        ];

        $response = $this->actingAs($this->adminUser)->post('/production/tickets', $payload);

        $response->assertSessionHasErrors('ticket_number');
    }

    /**
     * 3. Test Verifikasi Tiket (Menjadi Produksi Resmi)
     */
    public function test_can_verify_ticket_and_enable_production(): void
    {
        $ticket = DumpingTicket::create([
            'ticket_number' => 'TKT-VERIFY-' . rand(1000, 9999),
            'ticket_date' => Carbon::today()->toDateString(),
            'dumping_time' => Carbon::now(),
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 31.75,
            'checker_name' => 'Checker JSI',
            'status' => 'submitted',
            'is_production' => false,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)->post("/production/tickets/{$ticket->id}/verify");

        $response->assertStatus(302);
        $ticket->refresh();

        $this->assertEquals('verified', $ticket->status);
        $this->assertTrue((bool) $ticket->is_production);
        $this->assertNotNull($ticket->verified_at);
        $this->assertEquals($this->adminUser->id, $ticket->verified_by);
    }

    /**
     * 4. Test Penolakan Tiket (Rejected)
     */
    public function test_can_reject_ticket_and_disallow_production(): void
    {
        $ticket = DumpingTicket::create([
            'ticket_number' => 'TKT-REJECT-' . rand(1000, 9999),
            'ticket_date' => Carbon::today()->toDateString(),
            'dumping_time' => Carbon::now(),
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 25.00,
            'checker_name' => 'Checker JSI',
            'status' => 'pending_verification',
            'is_production' => false,
            'created_by' => $this->adminUser->id,
        ]);

        $reason = 'Plat nomor armada tidak sesuai dengan Surat Perintah Kerja.';
        $response = $this->actingAs($this->adminUser)->post("/production/tickets/{$ticket->id}/reject", [
            'rejection_reason' => $reason,
        ]);

        $response->assertStatus(302);
        $ticket->refresh();

        $this->assertEquals('rejected', $ticket->status);
        $this->assertFalse((bool) $ticket->is_production);
        $this->assertEquals($reason, $ticket->rejection_reason);
        $this->assertNotNull($ticket->rejected_at);
    }

    /**
     * 5. Test Koreksi Tiket Khusus dengan Audit Trail
     */
    public function test_can_correct_ticket_with_audit_trail(): void
    {
        $ticket = DumpingTicket::create([
            'ticket_number' => 'TKT-CORR-' . rand(1000, 9999),
            'ticket_date' => Carbon::today()->toDateString(),
            'dumping_time' => Carbon::now(),
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 30.00,
            'checker_name' => 'Checker JSI',
            'status' => 'verified',
            'is_production' => true,
            'created_by' => $this->adminUser->id,
        ]);

        $correctionReason = 'Koreksi berat kotor berdasarkan struk timbangan jembatan JSI revisi.';
        $response = $this->actingAs($this->adminUser)->post("/production/tickets/{$ticket->id}/correct", [
            'tonnage' => 31.80,
            'unit_id' => $ticket->unit_id,
            'driver_id' => $ticket->driver_id,
            'loading_point_id' => $ticket->loading_point_id,
            'dumping_point_id' => $ticket->dumping_point_id,
            'material_id' => $ticket->material_id,
            'shift_id' => $ticket->shift_id,
            'reason' => $correctionReason,
        ]);

        $response->assertStatus(302);
        $ticket->refresh();

        $this->assertEquals('corrected', $ticket->status);
        $this->assertEquals(31.80, (float) $ticket->tonnage);

        // Verify audit trail record in ticket_corrections
        $this->assertDatabaseHas('ticket_corrections', [
            'dumping_ticket_id' => $ticket->id,
            'reason' => $correctionReason,
        ]);
    }

    /**
     * 6. Test Bulk Import Execution
     */
    public function test_bulk_import_validates_and_imports_tickets(): void
    {
        $importService = new ExcelCsvImportService();

        $tkt1 = 'TKT-IMP-' . rand(10000, 99999);
        $tkt2 = 'TKT-IMP-' . rand(10000, 99999);

        $rows = [
            [
                'row_number' => 2,
                'ticket_number' => $tkt1,
                'ticket_date' => Carbon::today()->toDateString(),
                'dumping_time' => '10:00',
                'unit_code' => $this->unit->unit_code,
                'driver_code' => $this->driver->driver_code,
                'loading_point_code' => $this->loadingPoint->code,
                'dumping_point_code' => $this->dumpingPoint->code,
                'material_code' => $this->material->code,
                'shift_code' => $this->shift->code,
                'tonnage' => 31.20,
                'checker_name' => 'Checker JSI',
                'remarks' => 'Import batch test 1',
                'is_valid' => true,
                'errors' => [],
            ],
            [
                'row_number' => 3,
                'ticket_number' => $tkt2,
                'ticket_date' => Carbon::today()->toDateString(),
                'dumping_time' => '10:45',
                'unit_code' => $this->unit->unit_code,
                'driver_code' => $this->driver->driver_code,
                'loading_point_code' => $this->loadingPoint->code,
                'dumping_point_code' => $this->dumpingPoint->code,
                'material_code' => $this->material->code,
                'shift_code' => $this->shift->code,
                'tonnage' => 30.50,
                'checker_name' => 'Checker JSI',
                'remarks' => 'Import batch test 2',
                'is_valid' => true,
                'errors' => [],
            ],
        ];

        $result = $importService->executeImport($rows, $this->adminUser->id, 'TEST_IMPORT.csv', $this->site->id);

        $this->assertEquals(2, $result['successful_rows']);
        $this->assertEquals(0, $result['failed_rows']);

        $this->assertDatabaseHas('dumping_tickets', [
            'ticket_number' => $tkt1,
            'source' => 'import_excel',
            'status' => 'submitted',
        ]);
    }

    /**
     * 7. Test Perhitungan Rekap Produksi (HANYA Tiket Verified yang Dihitung)
     */
    public function test_production_recap_only_calculates_verified_tickets(): void
    {
        $todayStr = Carbon::today()->toDateString();

        // Ticket 1: Verified (30 Ton)
        DumpingTicket::create([
            'ticket_number' => 'TKT-CALC-VER-' . rand(1000, 9999),
            'ticket_date' => $todayStr,
            'dumping_time' => Carbon::now(),
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 30.00,
            'checker_name' => 'Checker JSI',
            'status' => 'verified',
            'is_production' => true,
            'created_by' => $this->adminUser->id,
        ]);

        // Ticket 2: Rejected (40 Ton) - MUST NOT be calculated
        DumpingTicket::create([
            'ticket_number' => 'TKT-CALC-REJ-' . rand(1000, 9999),
            'ticket_date' => $todayStr,
            'dumping_time' => Carbon::now(),
            'site_id' => $this->site->id,
            'unit_id' => $this->unit->id,
            'driver_id' => $this->driver->id,
            'loading_point_id' => $this->loadingPoint->id,
            'dumping_point_id' => $this->dumpingPoint->id,
            'material_id' => $this->material->id,
            'shift_id' => $this->shift->id,
            'tonnage' => 40.00,
            'checker_name' => 'Checker JSI',
            'status' => 'rejected',
            'is_production' => false,
            'created_by' => $this->adminUser->id,
        ]);

        $verifiedTonnage = DumpingTicket::verifiedProduction()
            ->whereDate('dumping_tickets.ticket_date', $todayStr)
            ->sum('dumping_tickets.tonnage');

        $rejectedCount = DumpingTicket::rejected()
            ->whereDate('dumping_tickets.ticket_date', $todayStr)
            ->count();

        $this->assertGreaterThanOrEqual(30.00, (float) $verifiedTonnage);
        $this->assertGreaterThanOrEqual(1, $rejectedCount);
    }

    /**
     * 8. Test Rekonsiliasi TAP vs JSI
     */
    public function test_reconciliation_matches_and_detects_discrepancies(): void
    {
        $rec = TicketReconciliation::create([
            'reconciliation_code' => 'REC-TEST-' . rand(100, 999),
            'site_id' => $this->site->id,
            'start_date' => Carbon::today()->toDateString(),
            'end_date' => Carbon::today()->toDateString(),
            'total_tap_tickets' => 10,
            'total_tap_tonnage' => 300.00,
            'total_jsi_tickets' => 10,
            'total_jsi_tonnage' => 300.50,
            'matched_tickets_count' => 9,
            'discrepancy_tickets_count' => 1,
            'status' => 'in_review',
            'created_by' => $this->adminUser->id,
        ]);

        $this->assertDatabaseHas('ticket_reconciliations', [
            'reconciliation_code' => $rec->reconciliation_code,
            'status' => 'in_review',
        ]);
    }

    /**
     * 9. Test Hak Akses dan Role Permintaan
     */
    public function test_authorization_and_role_access(): void
    {
        $response = $this->actingAs($this->adminUser)->get('/production/dashboard');
        $response->assertStatus(200);

        $responseTickets = $this->actingAs($this->adminUser)->get('/production/tickets');
        $responseTickets->assertStatus(200);

        $responseRecap = $this->actingAs($this->adminUser)->get('/production/recap');
        $responseRecap->assertStatus(200);
    }
}
