<?php

namespace Database\Seeders;

use App\Models\DailyDispatch;
use App\Models\DispatchAssignment;
use App\Models\DispatchAssignmentLog;
use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Employee;
use App\Models\HaulingActivity;
use App\Models\Location;
use App\Models\Material;
use App\Models\Permission;
use App\Models\ProductionTarget;
use App\Models\ReconciliationItem;
use App\Models\Role;
use App\Models\Shift;
use App\Models\Site;
use App\Models\TicketCorrection;
use App\Models\TicketReconciliation;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TapProductionDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Production Permissions
        $productionPerms = [
            ['name' => 'manage_dispatch', 'label' => 'Kelola Daily Dispatch & Penugasan', 'group' => 'production'],
            ['name' => 'manage_hauling', 'label' => 'Monitoring Loading & Hauling', 'group' => 'production'],
            ['name' => 'manage_tickets', 'label' => 'Input & Kelola Tiket Dumping', 'group' => 'production'],
            ['name' => 'verify_tickets', 'label' => 'Verifikasi & Reject Tiket Dumping', 'group' => 'production'],
            ['name' => 'correct_tickets', 'label' => 'Koreksi Tiket Dumping', 'group' => 'production'],
            ['name' => 'import_tickets', 'label' => 'Bulk Import Tiket Excel/CSV', 'group' => 'production'],
            ['name' => 'view_production_reports', 'label' => 'Lihat Rekap & Laporan Produksi', 'group' => 'production'],
            ['name' => 'manage_production_targets', 'label' => 'Kelola Target Produksi Harian/Bulanan', 'group' => 'production'],
            ['name' => 'manage_reconciliation', 'label' => 'Rekonsiliasi Tiket TAP vs JSI', 'group' => 'production'],
        ];

        $allPermIds = [];
        foreach ($productionPerms as $pData) {
            $p = Permission::firstOrCreate(['name' => $pData['name']], $pData);
            $allPermIds[] = $p->id;
        }

        // Attach to super_admin
        $superAdmin = Role::where('name', 'super_admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching($allPermIds);
        }

        // Attach to project_manager
        $pmRole = Role::where('name', 'project_manager')->first();
        if ($pmRole) {
            $pmRole->permissions()->syncWithoutDetaching($allPermIds);
        }

        // Attach to supervisor_hauling
        $spvRole = Role::where('name', 'supervisor_hauling')->first();
        if ($spvRole) {
            $spvPerms = Permission::whereIn('name', [
                'manage_dispatch', 'manage_hauling', 'manage_tickets', 'verify_tickets', 'correct_tickets', 'view_production_reports'
            ])->pluck('id');
            $spvRole->permissions()->syncWithoutDetaching($spvPerms);
        }

        // Attach to dispatcher
        $dispatchRole = Role::where('name', 'dispatcher')->first();
        if ($dispatchRole) {
            $dispPerms = Permission::whereIn('name', [
                'manage_dispatch', 'manage_hauling', 'manage_tickets', 'import_tickets', 'view_production_reports', 'manage_reconciliation'
            ])->pluck('id');
            $dispatchRole->permissions()->syncWithoutDetaching($dispPerms);
        }

        // 2. Base Master References
        $site = Site::first() ?? Site::create([
            'code' => 'SITE-MTW',
            'name' => 'Site Muara Teweh (Barito Utara)',
            'company_id' => 1,
            'is_active' => true,
        ]);

        $adminUser = User::where('email', 'admin@tap-mining.com')->first() ?? User::first();
        $spvUser = User::where('email', 'spv.hauling@tap-mining.com')->first() ?? $adminUser;
        $dispUser = User::where('email', 'dispatch.teweh@tap-mining.com')->first() ?? $adminUser;

        $shift1 = Shift::where('name', 'like', '%Shift 1%')->first() ?? Shift::first();
        $shift2 = Shift::where('name', 'like', '%Shift 2%')->first() ?? Shift::where('id', '!=', $shift1->id)->first() ?? $shift1;

        $matROM = Material::where('code', 'MAT-ROM')->first() ?? Material::first();
        $matCrushed = Material::where('code', 'MAT-CRUSH')->first() ?? $matROM;

        $locFrontA = Location::where('location_type', 'front_loading')->first() ?? Location::first();
        $locStockpile = Location::where('location_type', 'stockpile')->first() ?? Location::first();
        $locJetty = Location::where('location_type', 'jetty')->first() ?? Location::first();

        $units = Unit::whereIn('unit_type', ['dump_truck_10', 'dump_truck_12'])->get();
        $drivers = Driver::with('employee')->where('is_active', true)->get();
        $supervisorEmp = Employee::where('position_id', function ($q) {
            $q->select('id')->from('positions')->where('code', 'POS-SPV-HAUL')->limit(1);
        })->first();

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // 3. Seed Production Targets
        // Daily target for today
        ProductionTarget::firstOrCreate(
            [
                'site_id' => $site->id,
                'period_type' => 'daily',
                'target_date' => $today->toDateString(),
                'month' => (int) $today->format('m'),
                'year' => (int) $today->format('Y'),
            ],
            [
                'target_tonnage' => 15000.00,
                'target_ritase' => 500,
                'working_days' => 1,
                'remarks' => 'Target harian operasional normal 2 shift hauling Pit North menuju Jetty',
                'created_by' => $adminUser->id,
            ]
        );

        // Monthly target for current month
        ProductionTarget::firstOrCreate(
            [
                'site_id' => $site->id,
                'period_type' => 'monthly',
                'target_date' => null,
                'month' => (int) $today->format('m'),
                'year' => (int) $today->format('Y'),
            ],
            [
                'target_tonnage' => 450000.00,
                'target_ritase' => 15000,
                'working_days' => 30,
                'remarks' => 'Target bulanan RKAB IUP 2026 PT TAP Konsesi Barito',
                'created_by' => $adminUser->id,
            ]
        );

        // 4. Seed Daily Dispatches (Yesterday & Today)
        $dispatchYesterday = DailyDispatch::firstOrCreate(
            ['dispatch_number' => 'DSP-' . $yesterday->format('Ymd') . '-01'],
            [
                'date' => $yesterday->toDateString(),
                'site_id' => $site->id,
                'shift_id' => $shift1->id,
                'supervisor_id' => $supervisorEmp?->id,
                'status' => 'completed',
                'notes' => 'Operasional hauling shift siang kemarin berjalan lancar tanpa kendala cuaca.',
                'created_by' => $dispUser->id,
            ]
        );

        $dispatchTodayShift1 = DailyDispatch::firstOrCreate(
            ['dispatch_number' => 'DSP-' . $today->format('Ymd') . '-01'],
            [
                'date' => $today->toDateString(),
                'site_id' => $site->id,
                'shift_id' => $shift1->id,
                'supervisor_id' => $supervisorEmp?->id,
                'status' => 'active',
                'notes' => 'Alokasi armada dump truck 10 roda dan 12 roda pada loading Front A Pit North.',
                'created_by' => $dispUser->id,
            ]
        );

        $dispatchTodayShift2 = DailyDispatch::firstOrCreate(
            ['dispatch_number' => 'DSP-' . $today->format('Ymd') . '-02'],
            [
                'date' => $today->toDateString(),
                'site_id' => $site->id,
                'shift_id' => $shift2->id,
                'supervisor_id' => $supervisorEmp?->id,
                'status' => 'active',
                'notes' => 'Shift malam: waspada titik KM 25 jalur berdebu dan tikungan jembatan.',
                'created_by' => $dispUser->id,
            ]
        );

        // Seed Assignments for Today Shift 1
        $assignmentMap = [];
        if ($units->count() > 0 && $drivers->count() > 0) {
            foreach ($units->take(5) as $idx => $unit) {
                $driver = $drivers->get($idx % $drivers->count());
                $asg = DispatchAssignment::firstOrCreate(
                    [
                        'daily_dispatch_id' => $dispatchTodayShift1->id,
                        'unit_id' => $unit->id,
                    ],
                    [
                        'driver_id' => $driver->id,
                        'loading_point_id' => $locFrontA->id,
                        'dumping_point_id' => $locStockpile->id,
                        'material_id' => $matROM->id,
                        'target_ritase' => 6,
                        'actual_ritase' => rand(3, 5),
                        'status' => $idx === 4 ? 'breakdown' : 'operating',
                        'start_time' => '06:30:00',
                        'end_time' => '17:45:00',
                        'remarks' => $idx === 4 ? 'Unit mengalami kendala hidrolik dump di KM 12' : 'Operasi normal',
                        'created_by' => $dispUser->id,
                    ]
                );
                $assignmentMap[] = $asg;

                // Seed assignment log
                DispatchAssignmentLog::create([
                    'dispatch_assignment_id' => $asg->id,
                    'changed_by' => $dispUser->id,
                    'change_type' => 'status_change',
                    'old_values' => ['status' => 'assigned'],
                    'new_values' => ['status' => $asg->status],
                    'reason' => 'Unit mulai beroperasi di front loading sesuai instruksi dispatcher.',
                    'created_at' => Carbon::now()->subHours(rand(2, 6)),
                ]);
            }
        }

        // 5. Seed Hauling Activities
        if (!empty($assignmentMap)) {
            foreach ($assignmentMap as $idx => $asg) {
                HaulingActivity::create([
                    'dispatch_assignment_id' => $asg->id,
                    'unit_id' => $asg->unit_id,
                    'driver_id' => $asg->driver_id,
                    'loading_point_id' => $asg->loading_point_id,
                    'dumping_point_id' => $asg->dumping_point_id,
                    'material_id' => $asg->material_id,
                    'shift_id' => $shift1->id,
                    'activity_date' => $today->toDateString(),
                    'loading_start_time' => Carbon::now()->subMinutes(60 + $idx * 15),
                    'loading_end_time' => Carbon::now()->subMinutes(45 + $idx * 15),
                    'hauling_start_time' => Carbon::now()->subMinutes(40 + $idx * 15),
                    'dumping_time' => $idx < 3 ? Carbon::now()->subMinutes(10 + $idx * 5) : null,
                    'journey_status' => $idx < 3 ? 'dumped' : ($idx === 4 ? 'delay_breakdown' : 'hauling'),
                    'delay_type' => $idx === 4 ? 'breakdown' : null,
                    'delay_duration_minutes' => $idx === 4 ? 45 : 0,
                    'delay_notes' => $idx === 4 ? 'Pemeriksaan hose hidrolik oleh tim mobile service ST-01' : null,
                    'created_by' => $dispUser->id,
                ]);
            }
        }

        // 6. Seed Dumping Tickets (Comprehensive statuses: verified, submitted, pending_verification, rejected, corrected)
        $ticketSeedData = [
            // Yesterday - Verified production
            ['num' => 'TKT-20261104-001', 'date' => $yesterday, 'time' => '07:45:00', 'u' => 0, 'd' => 0, 'ton' => 31.50, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-002', 'date' => $yesterday, 'time' => '08:20:00', 'u' => 1, 'd' => 1, 'ton' => 30.80, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-003', 'date' => $yesterday, 'time' => '09:10:00', 'u' => 2, 'd' => 2, 'ton' => 32.40, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Budi Santoso (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-004', 'date' => $yesterday, 'time' => '10:05:00', 'u' => 3, 'd' => 3, 'ton' => 45.20, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Budi Santoso (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-005', 'date' => $yesterday, 'time' => '11:15:00', 'u' => 0, 'd' => 0, 'ton' => 31.80, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-006', 'date' => $yesterday, 'time' => '13:30:00', 'u' => 1, 'd' => 1, 'ton' => 30.20, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-007', 'date' => $yesterday, 'time' => '19:40:00', 'u' => 2, 'd' => 2, 'ton' => 32.10, 'shift' => $shift2, 'status' => 'verified', 'checker' => 'Herman (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261104-008', 'date' => $yesterday, 'time' => '21:15:00', 'u' => 3, 'd' => 3, 'ton' => 44.80, 'shift' => $shift2, 'status' => 'verified', 'checker' => 'Herman (JSI Checker)', 'source' => 'manual'],

            // Today Shift 1 - Verified
            ['num' => 'TKT-20261105-001', 'date' => $today, 'time' => '07:30:00', 'u' => 0, 'd' => 0, 'ton' => 31.25, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-002', 'date' => $today, 'time' => '08:15:00', 'u' => 1, 'd' => 1, 'ton' => 30.90, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-003', 'date' => $today, 'time' => '09:00:00', 'u' => 2, 'd' => 2, 'ton' => 32.60, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Budi Santoso (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-004', 'date' => $today, 'time' => '09:45:00', 'u' => 3, 'd' => 3, 'ton' => 46.10, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Budi Santoso (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-005', 'date' => $today, 'time' => '10:30:00', 'u' => 0, 'd' => 0, 'ton' => 31.40, 'shift' => $shift1, 'status' => 'verified', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],

            // Pending Verification & Submitted
            ['num' => 'TKT-20261105-006', 'date' => $today, 'time' => '11:20:00', 'u' => 1, 'd' => 1, 'ton' => 30.70, 'shift' => $shift1, 'status' => 'pending_verification', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-007', 'date' => $today, 'time' => '12:05:00', 'u' => 2, 'd' => 2, 'ton' => 32.30, 'shift' => $shift1, 'status' => 'pending_verification', 'checker' => 'Budi Santoso (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-008', 'date' => $today, 'time' => '13:00:00', 'u' => 3, 'd' => 3, 'ton' => 45.80, 'shift' => $shift1, 'status' => 'submitted', 'checker' => 'Budi Santoso (JSI Checker)', 'source' => 'manual'],
            ['num' => 'TKT-20261105-009', 'date' => $today, 'time' => '13:45:00', 'u' => 0, 'd' => 0, 'ton' => 31.60, 'shift' => $shift1, 'status' => 'submitted', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],

            // Rejected ticket
            ['num' => 'TKT-20261105-010', 'date' => $today, 'time' => '14:15:00', 'u' => 4, 'd' => 4, 'ton' => 28.50, 'shift' => $shift1, 'status' => 'rejected', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual', 'reject_reason' => 'Unit DT-202 tercatat masih dalam status maintenance pada jam dumping tersebut. Verifikasi fisik di jembatan timbang tidak valid.'],

            // Corrected ticket
            ['num' => 'TKT-20261105-011', 'date' => $today, 'time' => '15:00:00', 'u' => 1, 'd' => 1, 'ton' => 31.00, 'shift' => $shift1, 'status' => 'corrected', 'checker' => 'Suryadi (JSI Checker)', 'source' => 'manual'],
        ];

        foreach ($ticketSeedData as $tData) {
            $unit = $units->get($tData['u'] % $units->count());
            $driver = $drivers->get($tData['d'] % $drivers->count());
            $isVerified = $tData['status'] === 'verified';
            $isRejected = $tData['status'] === 'rejected';

            $ticket = DumpingTicket::firstOrCreate(
                ['ticket_number' => $tData['num']],
                [
                    'ticket_date' => $tData['date']->toDateString(),
                    'dumping_time' => Carbon::parse($tData['date']->format('Y-m-d') . ' ' . $tData['time']),
                    'site_id' => $site->id,
                    'unit_id' => $unit->id,
                    'driver_id' => $driver->id,
                    'loading_point_id' => $locFrontA->id,
                    'dumping_point_id' => $locStockpile->id,
                    'material_id' => $matROM->id,
                    'shift_id' => $tData['shift']->id,
                    'tonnage' => $tData['ton'],
                    'gross_weight' => $tData['ton'] + 14.50,
                    'tare_weight' => 14.50,
                    'checker_name' => $tData['checker'],
                    'source' => $tData['source'],
                    'status' => $tData['status'],
                    'remarks' => 'Muatan batubara ROM seam A1',
                    'is_production' => $isVerified, // Only verified counts in production!
                    'verified_by' => $isVerified ? $spvUser->id : null,
                    'verified_at' => $isVerified ? Carbon::now()->subHours(rand(1, 4)) : null,
                    'rejected_by' => $isRejected ? $spvUser->id : null,
                    'rejected_at' => $isRejected ? Carbon::now()->subHours(1) : null,
                    'rejection_reason' => $tData['reject_reason'] ?? null,
                    'created_by' => $dispUser->id,
                ]
            );

            // If corrected, seed correction history
            if ($tData['status'] === 'corrected') {
                TicketCorrection::firstOrCreate(
                    ['dumping_ticket_id' => $ticket->id],
                    [
                        'requested_by' => $dispUser->id,
                        'approved_by' => $spvUser->id,
                        'old_data' => [
                            'tonnage' => 33.50,
                            'remarks' => 'Salah input tonase awal',
                        ],
                        'new_data' => [
                            'tonnage' => 31.00,
                            'remarks' => 'Disesuaikan dengan printout timbangan JSI',
                        ],
                        'reason' => 'Koreksi penulisan angka tonase bruto - tara berdasarkan tiket fisik timbangan JSI.',
                        'status' => 'approved',
                    ]
                );
            }
        }

        // 7. Seed JSI Reconciliation Batch & Items
        $rec = TicketReconciliation::firstOrCreate(
            ['reconciliation_code' => 'REC-' . $today->format('Ym') . '-001'],
            [
                'site_id' => $site->id,
                'start_date' => $yesterday->toDateString(),
                'end_date' => $today->toDateString(),
                'source_file_name' => 'REKAP_JSI_HAULING_MTW_' . $today->format('Ymd') . '.xlsx',
                'total_tap_tickets' => 15,
                'total_tap_tonnage' => 506.40,
                'total_jsi_tickets' => 16,
                'total_jsi_tonnage' => 538.20,
                'matched_tickets_count' => 13,
                'matched_tonnage' => 443.15,
                'discrepancy_tickets_count' => 1,
                'discrepancy_tonnage' => 0.55,
                'missing_in_tap_count' => 1,
                'missing_in_jsi_count' => 1,
                'status' => 'in_review',
                'settlement_notes' => 'Terdapat 1 selisih tonase pada tiket TKT-20261105-001 (0.55 Ton) dan 1 tiket JSI belum tercatat di TAP.',
                'reconciled_by' => $spvUser->id,
                'reconciled_at' => Carbon::now()->subMinutes(30),
                'created_by' => $spvUser->id,
            ]
        );

        // Seed reconciliation items
        // Item 1: Matched
        ReconciliationItem::firstOrCreate(
            [
                'reconciliation_id' => $rec->id,
                'tap_ticket_number' => 'TKT-20261104-001',
            ],
            [
                'jsi_ticket_number' => 'JSI-MTW-001',
                'ticket_date' => $yesterday->toDateString(),
                'jsi_tonnage' => 31.50,
                'tap_tonnage' => 31.50,
                'tonnage_diff' => 0.00,
                'jsi_unit_code' => 'DT-101',
                'tap_unit_code' => 'DT-101',
                'match_status' => 'match',
                'resolution_status' => 'resolved_accept_tap',
                'resolution_notes' => 'Data sesuai dan klop sempurna.',
            ]
        );

        // Item 2: Discrepancy in tonnage
        ReconciliationItem::firstOrCreate(
            [
                'reconciliation_id' => $rec->id,
                'tap_ticket_number' => 'TKT-20261105-001',
            ],
            [
                'jsi_ticket_number' => 'JSI-MTW-015',
                'ticket_date' => $today->toDateString(),
                'jsi_tonnage' => 31.80,
                'tap_tonnage' => 31.25,
                'tonnage_diff' => 0.55,
                'jsi_unit_code' => 'DT-101',
                'tap_unit_code' => 'DT-101',
                'match_status' => 'tonnage_diff',
                'resolution_status' => 'unresolved',
                'resolution_notes' => 'Perbedaan tonase 0.55 Ton antara pencatatan TAP dan print out JSI. Menunggu bukti foto struk timbangan.',
            ]
        );

        // Item 3: Missing in TAP (found in JSI only)
        ReconciliationItem::firstOrCreate(
            [
                'reconciliation_id' => $rec->id,
                'jsi_ticket_number' => 'JSI-MTW-019',
            ],
            [
                'tap_ticket_number' => null,
                'ticket_date' => $today->toDateString(),
                'jsi_tonnage' => 31.80,
                'tap_tonnage' => 0.00,
                'tonnage_diff' => 31.80,
                'jsi_unit_code' => 'DT-102',
                'tap_unit_code' => null,
                'match_status' => 'missing_in_tap',
                'resolution_status' => 'unresolved',
                'resolution_notes' => 'Tiket terbit di pihak JSI namun belum diinput talyyman TAP.',
            ]
        );

        // Item 4: Missing in JSI (found in TAP only)
        ReconciliationItem::firstOrCreate(
            [
                'reconciliation_id' => $rec->id,
                'tap_ticket_number' => 'TKT-20261105-009',
            ],
            [
                'jsi_ticket_number' => null,
                'ticket_date' => $today->toDateString(),
                'jsi_tonnage' => 0.00,
                'tap_tonnage' => 31.60,
                'tonnage_diff' => -31.60,
                'jsi_unit_code' => null,
                'tap_unit_code' => 'DT-101',
                'match_status' => 'missing_in_jsi',
                'resolution_status' => 'unresolved',
                'resolution_notes' => 'Tiket TAP belum tercantum dalam rekapan JSI pagi ini.',
            ]
        );
    }
}
