<?php

namespace Database\Seeders;

use App\Models\BreakdownReport;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobCard;
use App\Models\JobCardChecklist;
use App\Models\Location;
use App\Models\MaintenanceCost;
use App\Models\MaintenanceInspection;
use App\Models\MaintenanceRequest;
use App\Models\MaintenanceSchedule;
use App\Models\MechanicWorkLog;
use App\Models\Permission;
use App\Models\Position;
use App\Models\RfuApproval;
use App\Models\Role;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\SparepartRequestItem;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use App\Models\WorkOrderTask;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TapMaintenanceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Maintenance Permissions
        $maintPerms = [
            ['name' => 'view_maintenance_dashboard', 'label' => 'Lihat Dashboard Workshop & Maintenance', 'group' => 'maintenance'],
            ['name' => 'manage_breakdowns', 'label' => 'Kelola Laporan Kerusakan Unit (Breakdown)', 'group' => 'maintenance'],
            ['name' => 'manage_maintenance_requests', 'label' => 'Kelola Maintenance Request (SPK Permohonan)', 'group' => 'maintenance'],
            ['name' => 'approve_maintenance_requests', 'label' => 'Approval Maintenance Request', 'group' => 'maintenance'],
            ['name' => 'manage_work_orders', 'label' => 'Kelola Workshop Work Order', 'group' => 'maintenance'],
            ['name' => 'manage_preventive_maintenance', 'label' => 'Kelola Program Servis Berkala (PM)', 'group' => 'maintenance'],
            ['name' => 'manage_mechanics', 'label' => 'Kelola Penugasan & Jam Kerja Mekanik', 'group' => 'maintenance'],
            ['name' => 'manage_job_cards', 'label' => 'Kelola Kartu Kerja (Job Card) & Cetak', 'group' => 'maintenance'],
            ['name' => 'manage_sparepart_requests', 'label' => 'Kelola Permintaan Suku Cadang (Sparepart)', 'group' => 'maintenance'],
            ['name' => 'approve_spareparts', 'label' => 'Otorisasi Pengeluaran Suku Cadang', 'group' => 'maintenance'],
            ['name' => 'manage_rfu', 'label' => 'Inspeksi & Otorisasi Ready For Use (RFU)', 'group' => 'maintenance'],
            ['name' => 'approve_rfu', 'label' => 'Otorisasi Akhir Unit RFU Siap Operasi', 'group' => 'maintenance'],
            ['name' => 'view_maintenance_costs', 'label' => 'Lihat Analisis Biaya Maintenance (Cost Tracking)', 'group' => 'maintenance'],
        ];

        $allPermIds = [];
        foreach ($maintPerms as $pData) {
            $p = Permission::firstOrCreate(['name' => $pData['name']], $pData);
            $allPermIds[] = $p->id;
        }

        Role::whereIn('name', ['super_admin', 'project_manager'])->each(function ($role) use ($allPermIds) {
            $role->permissions()->syncWithoutDetaching($allPermIds);
        });

        $spvRole = Role::where('name', 'supervisor_hauling')->first();
        if ($spvRole) {
            $spvPerms = Permission::whereIn('name', [
                'view_maintenance_dashboard', 'manage_breakdowns', 'manage_maintenance_requests',
                'manage_work_orders', 'manage_rfu', 'view_maintenance_costs'
            ])->pluck('id');
            $spvRole->permissions()->syncWithoutDetaching($spvPerms);
        }

        $mechRole = Role::where('name', 'mechanic')->first();
        if ($mechRole) {
            $mPerms = Permission::whereIn('name', [
                'view_maintenance_dashboard', 'manage_breakdowns', 'manage_work_orders',
                'manage_mechanics', 'manage_job_cards', 'manage_sparepart_requests'
            ])->pluck('id');
            $mechRole->permissions()->syncWithoutDetaching($mPerms);
        }

        // 2. Mechanics Setup (Ensure Department & Positions)
        $site = Site::first();
        $adminUser = User::first();
        $plantDept = Department::firstOrCreate(
            ['code' => 'PLANT'],
            ['name' => 'Plant & Maintenance', 'company_id' => 1, 'is_active' => true]
        );

        $posLeadMech = Position::firstOrCreate(
            ['code' => 'LEAD-MECH'],
            ['title' => 'Lead Mechanic', 'department_id' => $plantDept->id, 'level' => 3, 'is_active' => true]
        );
        $posHydMech = Position::firstOrCreate(
            ['code' => 'HYD-MECH'],
            ['title' => 'Hydraulic Specialist Mechanic', 'department_id' => $plantDept->id, 'level' => 2, 'is_active' => true]
        );
        $posAutoElec = Position::firstOrCreate(
            ['code' => 'AUTO-ELEC'],
            ['title' => 'Auto Electrician', 'department_id' => $plantDept->id, 'level' => 2, 'is_active' => true]
        );
        $posTyreman = Position::firstOrCreate(
            ['code' => 'TYREMAN'],
            ['title' => 'Tyre Specialist', 'department_id' => $plantDept->id, 'level' => 2, 'is_active' => true]
        );
        $posMaintPlanner = Position::firstOrCreate(
            ['code' => 'MAINT-PLANNER'],
            ['title' => 'Maintenance Planner & QC Inspector', 'department_id' => $plantDept->id, 'level' => 4, 'is_active' => true]
        );

        // Ensure distinct employees for mechanics
        $mech1 = Employee::firstOrCreate(
            ['employee_code' => 'MECH-001'],
            [
                'nik' => '7371000000000101',
                'name' => 'Bambang Setyo (Lead Mechanic)',
                'company_id' => 1,
                'site_id' => $site->id,
                'department_id' => $plantDept->id,
                'position_id' => $posLeadMech->id,
                'join_date' => '2023-01-15',
                'employment_status' => 'permanent',
                'phone' => '081234567101',
                'is_active' => true,
            ]
        );

        $mech2 = Employee::firstOrCreate(
            ['employee_code' => 'MECH-002'],
            [
                'nik' => '7371000000000102',
                'name' => 'Dedi Suryanto (Hydraulic Mechanic)',
                'company_id' => 1,
                'site_id' => $site->id,
                'department_id' => $plantDept->id,
                'position_id' => $posHydMech->id,
                'join_date' => '2023-03-10',
                'employment_status' => 'permanent',
                'phone' => '081234567102',
                'is_active' => true,
            ]
        );

        $mech3 = Employee::firstOrCreate(
            ['employee_code' => 'MECH-003'],
            [
                'nik' => '7371000000000103',
                'name' => 'Fajar Santoso (Auto Electrician)',
                'company_id' => 1,
                'site_id' => $site->id,
                'department_id' => $plantDept->id,
                'position_id' => $posAutoElec->id,
                'join_date' => '2023-06-01',
                'employment_status' => 'permanent',
                'phone' => '081234567103',
                'is_active' => true,
            ]
        );

        $mech4 = Employee::firstOrCreate(
            ['employee_code' => 'MECH-004'],
            [
                'nik' => '7371000000000104',
                'name' => 'Hendra Tyreman (Tyre Specialist)',
                'company_id' => 1,
                'site_id' => $site->id,
                'department_id' => $plantDept->id,
                'position_id' => $posTyreman->id,
                'join_date' => '2023-08-20',
                'employment_status' => 'contract',
                'phone' => '081234567104',
                'is_active' => true,
            ]
        );

        $inspector = Employee::firstOrCreate(
            ['employee_code' => 'QC-001'],
            [
                'nik' => '7371000000000105',
                'name' => 'Ir. Gunawan (Maintenance Planner & Inspector)',
                'company_id' => 1,
                'site_id' => $site->id,
                'department_id' => $plantDept->id,
                'position_id' => $posMaintPlanner->id,
                'join_date' => '2022-05-10',
                'employment_status' => 'permanent',
                'phone' => '081234567105',
                'is_active' => true,
            ]
        );

        // 3. Seed Realistic Maintenance Scenarios
        $units = Unit::all();
        if ($units->count() < 3) return;

        $unitBreakdown = $units->first();
        $unitPM = $units->skip(1)->first();
        $unitRFU = $units->skip(2)->first();

        // 3.1 Breakdown Report (Critical Brake System Incident from Driver)
        $bdr1 = BreakdownReport::create([
            'report_number' => 'BDR-202611-001',
            'site_id' => $site->id,
            'unit_id' => $unitBreakdown->id,
            'reporter_type' => 'driver',
            'reporter_id' => $mech1->id,
            'reporter_name' => 'Agus Driver DT',
            'breakdown_date' => Carbon::today()->subDays(1),
            'breakdown_time' => '14:25:00',
            'current_hm' => $unitBreakdown->last_hm ?: 1450.0,
            'current_km' => $unitBreakdown->last_km ?: 34200.0,
            'location_name' => 'Hauling Road KM 18 Tikungan B',
            'damage_category' => 'brake',
            'damage_description' => 'Pedal rem amblas dan tekanan angin rem angin bocor cepat saat muatan penuh batubara.',
            'priority' => 'critical',
            'status' => 'converted_to_wo',
            'is_critical' => true,
            'review_notes' => 'Kerusakan rem kritis, unit diinstruksikan segera ditarik ke workshop pusat.',
            'reviewed_by' => $adminUser->id,
            'reviewed_at' => Carbon::today()->subDays(1)->setTime(14, 45),
            'created_by' => $adminUser->id,
        ]);

        // Put unit to breakdown
        $unitBreakdown->update(['status' => 'breakdown']);

        // 3.2 Maintenance Request (Converted from BDR)
        $mr1 = MaintenanceRequest::create([
            'request_number' => 'MR-202611-001',
            'site_id' => $site->id,
            'unit_id' => $unitBreakdown->id,
            'breakdown_report_id' => $bdr1->id,
            'requested_by' => $mech1->id,
            'requester_name' => 'Agus Driver DT / Bambang Setyo',
            'damage_category' => 'brake',
            'work_description' => 'Overhaul brake booster, penggantian brake chamber, dan pemeriksaan kompresor angin.',
            'priority' => 'critical',
            'request_date' => Carbon::today()->subDays(1),
            'status' => 'converted_to_wo',
            'approval_status' => 'approved',
            'approver_id' => $adminUser->id,
            'approval_notes' => 'Disetujui untuk emergency overhaul sistem rem.',
            'approved_at' => Carbon::today()->subDays(1)->setTime(15, 00),
            'created_by' => $adminUser->id,
        ]);

        // 3.3 Work Order (In Progress / Waiting Sparepart)
        $wo1 = WorkOrder::create([
            'wo_number' => 'WO-202611-101',
            'site_id' => $site->id,
            'unit_id' => $unitBreakdown->id,
            'maintenance_request_id' => $mr1->id,
            'breakdown_report_id' => $bdr1->id,
            'source' => 'road_breakdown',
            'job_type' => 'emergency_repair',
            'priority' => 'critical_emergency',
            'breakdown_time' => Carbon::today()->subDays(1)->setTime(14, 25),
            'start_repair_time' => Carbon::today()->subDays(1)->setTime(15, 30),
            'target_completion_date' => Carbon::today()->setTime(18, 00),
            'hm_at_service' => $unitBreakdown->last_hm ?: 1450.0,
            'km_at_service' => $unitBreakdown->last_km ?: 34200.0,
            'initial_complaint' => 'Tekanan angin rem hilang dan rem tidak pakem.',
            'defect_summary' => 'Kerusakan sistem pneumatik rem service dan parking brake chamber kanan bocor.',
            'diagnosis' => 'Diafragma brake chamber pecah dan fitting hose kompresor retak.',
            'root_cause' => 'Kelelahan material karet diafragma akibat pemakaian jam operasi tinggi di jalan berdebu.',
            'assigned_mechanic_id' => $mech1->id,
            'supervisor_id' => $inspector->id,
            'estimated_cost' => 4500000.00,
            'actual_cost' => 4250000.00,
            'status' => 'waiting_sparepart',
            'rfu_status' => 'repair_in_progress',
            'approval_status' => 'approved',
            'approver_id' => $adminUser->id,
            'approved_at' => Carbon::today()->subDays(1)->setTime(15, 10),
            'created_by' => $adminUser->id,
        ]);

        $mr1->update(['work_order_id' => $wo1->id]);

        // Multi-Mechanic Assignment
        WorkOrderAssignment::create([
            'work_order_id' => $wo1->id,
            'mechanic_id' => $mech1->id,
            'role' => 'lead_mechanic',
            'assigned_date' => Carbon::today()->subDays(1),
            'working_hours' => 5.5,
            'notes' => 'Membongkar brake chamber dan periksa jalur angin pipa tembaga.',
            'status' => 'active',
        ]);
        WorkOrderAssignment::create([
            'work_order_id' => $wo1->id,
            'mechanic_id' => $mech2->id,
            'role' => 'assistant_mechanic',
            'assigned_date' => Carbon::today()->subDays(1),
            'working_hours' => 4.0,
            'notes' => 'Membantu pembersihan drum rem dan kuras tabung angin.',
            'status' => 'active',
        ]);

        // Tasks
        WorkOrderTask::create([
            'work_order_id' => $wo1->id,
            'task_name' => 'Bongkar Brake Chamber & Selang Angin Bocor',
            'description' => 'Lepas chamber rem roda kanan belakang',
            'is_completed' => true,
            'completed_by' => $mech1->id,
            'completed_at' => Carbon::today()->subDays(1)->setTime(17, 00),
        ]);
        WorkOrderTask::create([
            'work_order_id' => $wo1->id,
            'task_name' => 'Pasang Brake Chamber Baru & Bleeding Angin',
            'description' => 'Menunggu suku cadang baru datang dari gudang',
            'is_completed' => false,
        ]);

        // Mechanic Work Log via HP
        MechanicWorkLog::create([
            'work_order_id' => $wo1->id,
            'mechanic_id' => $mech1->id,
            'log_date' => Carbon::today()->subDays(1),
            'start_time' => Carbon::today()->subDays(1)->setTime(15, 30),
            'end_time' => Carbon::today()->subDays(1)->setTime(19, 00),
            'duration_hours' => 3.5,
            'diagnosis' => 'Diafragma chamber rem belakang robek 2 cm.',
            'action_taken' => 'Pelepasan unit chamber lama, pembuatan SPR suku cadang.',
            'work_notes' => 'Menunggu suku cadang sparepart chamber T30/30 dari gudang TAP.',
            'status_update' => 'waiting_sparepart',
        ]);

        // Job Card
        $jc1 = JobCard::create([
            'job_card_number' => 'JC-202611-101',
            'work_order_id' => $wo1->id,
            'site_id' => $site->id,
            'unit_id' => $unitBreakdown->id,
            'issue_date' => Carbon::today()->subDays(1),
            'initial_complaint' => 'Rem amblas dan tekanan angin rem angin bocor.',
            'mechanic_diagnosis' => 'Diafragma brake chamber bocor, hose fitting aus.',
            'work_performed' => 'Bongkar chamber rem, kuras tangki angin reservoir, pembersihan lining.',
            'lead_mechanic_id' => $mech1->id,
            'supervisor_id' => $inspector->id,
            'status' => 'active',
        ]);

        JobCardChecklist::create([
            'job_card_id' => $jc1->id,
            'item_name' => 'Pemeriksaan Tabung Angin Pneumatik & Seal',
            'category' => 'Brake System',
            'is_checked' => true,
            'checked_by' => $mech1->id,
            'notes' => 'Tabung dalam kondisi bersih setelah dikuras',
        ]);
        JobCardChecklist::create([
            'job_card_id' => $jc1->id,
            'item_name' => 'Pemasangan Brake Chamber T30/30 & Uji Tekanan 8 Bar',
            'category' => 'Brake System',
            'is_checked' => false,
            'notes' => 'Menunggu part dari gudang',
        ]);

        // Sparepart Request
        $spr1 = SparepartRequest::create([
            'request_number' => 'SPR-202611-001',
            'work_order_id' => $wo1->id,
            'site_id' => $site->id,
            'requested_by' => $mech1->id,
            'request_date' => Carbon::today()->subDays(1),
            'status' => 'approved',
            'approved_by' => $adminUser->id,
            'approved_at' => Carbon::today()->subDays(1)->setTime(16, 00),
            'total_cost' => 3200000.00,
            'notes' => 'Permintaan darurat untuk perbaikan rem unit DT kritis.',
            'created_by' => $adminUser->id,
        ]);

        SparepartRequestItem::create([
            'sparepart_request_id' => $spr1->id,
            'part_number' => 'HN-47830-1200',
            'part_name' => 'Brake Chamber Assembly T30/30 Spring Type',
            'category' => 'Brake Parts',
            'quantity_requested' => 2.0,
            'quantity_approved' => 2.0,
            'quantity_issued' => 2.0,
            'unit' => 'pcs',
            'unit_price' => 1400000.00,
            'total_price' => 2800000.00,
            'status' => 'approved',
        ]);
        SparepartRequestItem::create([
            'sparepart_request_id' => $spr1->id,
            'part_number' => 'HN-90048-AIRH',
            'part_name' => 'Air Hose Flexible 1/2 Inch Reinforced',
            'category' => 'Pneumatic Hose',
            'quantity_requested' => 4.0,
            'quantity_approved' => 4.0,
            'quantity_issued' => 4.0,
            'unit' => 'meter',
            'unit_price' => 100000.00,
            'total_price' => 400000.00,
            'status' => 'approved',
        ]);

        // Maintenance Cost Record
        MaintenanceCost::create([
            'work_order_id' => $wo1->id,
            'site_id' => $site->id,
            'unit_id' => $unitBreakdown->id,
            'cost_date' => Carbon::today()->subDays(1),
            'cost_type' => 'sparepart',
            'description' => 'Brake Chamber & Air Hose Replacement Part (SPR-202611-001)',
            'reference_number' => 'SPR-202611-001',
            'estimated_amount' => 3200000.00,
            'actual_amount' => 3200000.00,
            'created_by' => $adminUser->id,
        ]);
        MaintenanceCost::create([
            'work_order_id' => $wo1->id,
            'site_id' => $site->id,
            'unit_id' => $unitBreakdown->id,
            'cost_date' => Carbon::today()->subDays(1),
            'cost_type' => 'mechanic_labor',
            'description' => 'Biaya Jam Kerja Mekanik Workshop (9.5 Jam)',
            'reference_number' => 'LABOR-WO-101',
            'estimated_amount' => 1300000.00,
            'actual_amount' => 1050000.00,
            'created_by' => $adminUser->id,
        ]);

        // 3.4 Seed Scenario 2: Completed Work Order with Passed Inspection & RFU Approval!
        $woCompleted = WorkOrder::create([
            'wo_number' => 'WO-202611-098',
            'site_id' => $site->id,
            'unit_id' => $unitRFU->id,
            'source' => 'p2h_defect',
            'job_type' => 'corrective_maintenance',
            'priority' => 'high',
            'breakdown_time' => Carbon::today()->subDays(3)->setTime(8, 0),
            'start_repair_time' => Carbon::today()->subDays(3)->setTime(9, 0),
            'completion_time' => Carbon::today()->subDays(3)->setTime(16, 30),
            'actual_completion_date' => Carbon::today()->subDays(3)->setTime(16, 30),
            'downtime_minutes' => 510, // 8.5 hours
            'hm_at_service' => $unitRFU->last_hm ?: 2100.0,
            'km_at_service' => $unitRFU->last_km ?: 48000.0,
            'initial_complaint' => 'Silinder hidrolik dump lambat naik dan seal oli menetes.',
            'defect_summary' => 'Kebocoran pada rod seal silinder hoist hidrolik utama.',
            'diagnosis' => 'Rod seal mengalami gesekan pasir debu tambang sehingga terjadi celah oli.',
            'action_taken' => 'Penggantian 1 set seal kit silinder hoist, ganti oli hidrolik ISO VG 68 20L, uji coba dumping 5 kali tanpa muatan.',
            'root_cause' => 'Debu partikel batubara masuk ke wiper seal yang getas.',
            'assigned_mechanic_id' => $mech2->id,
            'supervisor_id' => $inspector->id,
            'estimated_cost' => 3800000.00,
            'actual_cost' => 3650000.00,
            'status' => 'completed',
            'rfu_status' => 'approved_rfu',
            'approval_status' => 'approved',
            'approver_id' => $adminUser->id,
            'approved_at' => Carbon::today()->subDays(3)->setTime(8, 30),
            'created_by' => $adminUser->id,
        ]);

        // Quality Control / Maintenance Inspection
        $insp1 = MaintenanceInspection::create([
            'inspection_number' => 'QC-202611-098',
            'work_order_id' => $woCompleted->id,
            'site_id' => $site->id,
            'unit_id' => $unitRFU->id,
            'inspector_id' => $inspector->id,
            'inspection_date' => Carbon::today()->subDays(3),
            'inspection_time' => '17:00:00',
            'inspection_type' => 'post_repair',
            'checklist_result' => [
                'hydraulic_lift_speed' => 'passed',
                'cylinder_seal_leakage' => 'none',
                'operating_pressure_bar' => '190 bar normal',
                'safety_prop_lock' => 'functional',
            ],
            'test_run_hm' => 0.5,
            'test_run_km' => 2.0,
            'test_run_result' => 'Uji naik-turun bak dump 5 kali dengan beban hidrolik responsif 12 detik, tidak ada rembesan oli baru.',
            'result' => 'passed',
            'inspector_notes' => 'Pekerjaan perbaikan silinder hidrolik rapi dan memenuhi standar K3LH TAP. Direkomendasikan RFU.',
            'inspector_signature_hash' => hash('sha256', 'QC-' . $unitRFU->unit_code . 'passed'),
        ]);

        // RFU Approval by Maintenance Planner
        RfuApproval::create([
            'work_order_id' => $woCompleted->id,
            'unit_id' => $unitRFU->id,
            'maintenance_inspection_id' => $insp1->id,
            'approver_id' => $inspector->id,
            'approval_date' => Carbon::today()->subDays(3)->setTime(17, 30),
            'decision' => 'approved_rfu',
            'approval_notes' => 'Unit dinyatakan SIAP OPERASI (RFU). Status armada dipulihkan ke Standby siap dijadwalkan Foreman Hauling.',
            'signature_hash' => hash('sha256', 'RFU-APP-' . $unitRFU->unit_code),
        ]);

        $unitRFU->update(['status' => 'standby']);

        // 3.5 Preventive Maintenance Schedule (PM 250, PM 500, PM 1000, PM 2000)
        foreach ($units as $u) {
            $curHm = (float) ($u->last_hm ?: 1000.0);

            MaintenanceSchedule::updateOrCreate(
                ['site_id' => $site->id, 'unit_id' => $u->id, 'service_type' => 'PM_250'],
                [
                    'schedule_basis' => 'hm',
                    'interval_value' => 250,
                    'last_service_date' => Carbon::today()->subDays(20),
                    'last_service_hm' => floor($curHm / 250) * 250,
                    'next_due_date' => Carbon::today()->addDays(10),
                    'next_due_hm' => (floor($curHm / 250) + 1) * 250,
                    'status' => 'normal',
                    'notes' => 'Ganti oli mesin, filter oli, filter solar, pelumasan grease chassis.',
                ]
            );

            MaintenanceSchedule::updateOrCreate(
                ['site_id' => $site->id, 'unit_id' => $u->id, 'service_type' => 'PM_500'],
                [
                    'schedule_basis' => 'hm',
                    'interval_value' => 500,
                    'last_service_date' => Carbon::today()->subDays(45),
                    'last_service_hm' => floor($curHm / 500) * 500,
                    'next_due_date' => Carbon::today()->addDays(25),
                    'next_due_hm' => (floor($curHm / 500) + 1) * 500,
                    'status' => 'normal',
                    'notes' => 'PM 250 + ganti filter udara, filter transmisi, cek diferensial.',
                ]
            );

            MaintenanceSchedule::updateOrCreate(
                ['site_id' => $site->id, 'unit_id' => $u->id, 'service_type' => 'PM_1000'],
                [
                    'schedule_basis' => 'hm',
                    'interval_value' => 1000,
                    'last_service_date' => Carbon::today()->subDays(90),
                    'last_service_hm' => floor($curHm / 1000) * 1000,
                    'next_due_date' => Carbon::today()->addDays(50),
                    'next_due_hm' => (floor($curHm / 1000) + 1) * 1000,
                    'status' => 'normal',
                    'notes' => 'Major Service: Ganti oli transmisi, oli final drive, kuras radiator coolant.',
                ]
            );
        }
    }
}
