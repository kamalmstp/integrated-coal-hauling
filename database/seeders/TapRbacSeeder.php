<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Site;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TapRbacSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Define all 15 Standard Roles
        $rolesData = [
            'super_admin' => [
                'name' => 'super_admin',
                'label' => 'Super Admin',
                'description' => 'Akses penuh tanpa batas ke seluruh konfigurasi, sistem, master data, dan seluruh site TAP.',
            ],
            'management' => [
                'name' => 'management',
                'label' => 'Management / Direksi',
                'description' => 'Akses monitoring eksekutif, KPI analytics lintas site, dan export laporan tanpa hak modifikasi teknis.',
            ],
            'project_manager' => [
                'name' => 'project_manager',
                'label' => 'Project Manager',
                'description' => 'Pengawasan operasional komprehensif tingkat site, persetujuan administratif, dan otorisasi sumber daya.',
            ],
            'pjo' => [
                'name' => 'pjo',
                'label' => 'PJO (Penanggung Jawab Operasional)',
                'description' => 'Penanggung jawab operasional tambang, kepatuhan K3LH/HSE, otorisasi keselamatan kerja dan kelaikan unit.',
            ],
            'svp_hauling' => [
                'name' => 'svp_hauling',
                'label' => 'SVP Hauling',
                'description' => 'Supervisor lapangan hauling, pengawasan dispatch harian, koordinasi armada, dan verifikasi dumping ticket.',
            ],
            'admin_produksi' => [
                'name' => 'admin_produksi',
                'label' => 'Admin Produksi',
                'description' => 'Operator input dispatch, pencatatan dan rekonsiliasi dumping ticket, serta rekapitulasi produksi harian.',
            ],
            'svp_plant_maintenance' => [
                'name' => 'svp_plant_maintenance',
                'label' => 'SVP Plant & Maintenance',
                'description' => 'Supervisor bengkel/workshop, persetujuan work order, inspeksi akhir perbaikan, dan approval RFU unit.',
            ],
            'maintenance_planner' => [
                'name' => 'maintenance_planner',
                'label' => 'Maintenance Planner',
                'description' => 'Perencanaan jadwal preventive maintenance (PM), pembuatan work order, alokasi sparepart, dan monitoring backlog.',
            ],
            'mekanik' => [
                'name' => 'mekanik',
                'label' => 'Mekanik',
                'description' => 'Teknisi lapangan: eksekusi perbaikan unit, checklist task inspeksi work order, dan pencatatan pemakaian sparepart.',
            ],
            'admin_scm' => [
                'name' => 'admin_scm',
                'label' => 'Admin SCM',
                'description' => 'Supply chain coordinator: pengawasan persediaan multi-gudang, koordinasi pengadaan, dan evaluasi vendor.',
            ],
            'admin_procurement' => [
                'name' => 'admin_procurement',
                'label' => 'Admin Procurement',
                'description' => 'Pengelola purchase request (PR), penerbitan RFQ, perbandingan penawaran vendor, PO, dan verifikasi invoice.',
            ],
            'warehouse_storeman' => [
                'name' => 'warehouse_storeman',
                'label' => 'Warehouse / Storeman',
                'description' => 'Pengelola fisik gudang: penerimaan barang (goods receipt), penataan rak/bin, pengeluaran sparepart, dan stock opname.',
            ],
            'fuelman' => [
                'name' => 'fuelman',
                'label' => 'Fuelman',
                'description' => 'Operator bahan bakar: sounding tangki harian, pengisian solar per unit dump truck, dan digital fuel ticket.',
            ],
            'hr_ga' => [
                'name' => 'hr_ga',
                'label' => 'HR/GA',
                'description' => 'Pengelola personalia: master karyawan, monitoring kontrak PKWT/PKWTT, kelayakan driver (SIM/SIMPER/MCU), dan absensi.',
            ],
            'driver_dt' => [
                'name' => 'driver_dt',
                'label' => 'Driver DT',
                'description' => 'Pengemudi armada dump truck: pengisian digital P2H pra-operasi, pengecekan status unit, dan riwayat trip.',
            ],
        ];

        $roles = [];
        foreach ($rolesData as $key => $data) {
            $roles[$key] = Role::updateOrCreate(
                ['name' => $data['name']],
                [
                    'label' => $data['label'],
                    'description' => $data['description'],
                    'is_active' => true,
                ]
            );
        }

        // 2. Granular Permissions across all modules
        $permissionsList = [
            // General & Dashboard
            ['name' => 'view_dashboard', 'label' => 'Melihat Dashboard Utama', 'group' => 'general'],
            ['name' => 'view_executive_dashboard', 'label' => 'Melihat Dashboard Eksekutif', 'group' => 'general'],

            // Organization
            ['name' => 'view_organization', 'label' => 'Melihat Organisasi & Site', 'group' => 'organization'],
            ['name' => 'create_organization', 'label' => 'Menambah Data Organisasi', 'group' => 'organization'],
            ['name' => 'edit_organization', 'label' => 'Mengubah Data Organisasi', 'group' => 'organization'],
            ['name' => 'delete_organization', 'label' => 'Menghapus Data Organisasi', 'group' => 'organization'],

            // Master Data
            ['name' => 'view_master', 'label' => 'Melihat Master Data', 'group' => 'master'],
            ['name' => 'create_master', 'label' => 'Menambah Master Data', 'group' => 'master'],
            ['name' => 'edit_master', 'label' => 'Mengubah Master Data', 'group' => 'master'],
            ['name' => 'delete_master', 'label' => 'Menghapus Master Data', 'group' => 'master'],
            ['name' => 'import_master', 'label' => 'Import Master Data', 'group' => 'master'],
            ['name' => 'export_master', 'label' => 'Export Master Data', 'group' => 'master'],

            // Users & Security
            ['name' => 'view_users', 'label' => 'Melihat Daftar Pengguna', 'group' => 'security'],
            ['name' => 'create_users', 'label' => 'Menambah Pengguna Baru', 'group' => 'security'],
            ['name' => 'edit_users', 'label' => 'Mengubah Data Pengguna & Site Akses', 'group' => 'security'],
            ['name' => 'delete_users', 'label' => 'Menonaktifkan / Hapus Pengguna', 'group' => 'security'],
            ['name' => 'manage_roles', 'label' => 'Mengatur Role & Hak Akses', 'group' => 'security'],
            ['name' => 'view_activity_logs', 'label' => 'Melihat Audit Log Aktivitas', 'group' => 'security'],
            ['name' => 'view_login_logs', 'label' => 'Melihat Log Aktivitas Login', 'group' => 'security'],
            ['name' => 'reset_password', 'label' => 'Reset Password Pengguna', 'group' => 'security'],

            // Production & Dispatch
            ['name' => 'view_production', 'label' => 'Melihat Modul Produksi & Dispatch', 'group' => 'production'],
            ['name' => 'create_production', 'label' => 'Membuat Dispatch & Tiket Baru', 'group' => 'production'],
            ['name' => 'edit_production', 'label' => 'Mengubah Data Produksi', 'group' => 'production'],
            ['name' => 'delete_production', 'label' => 'Menghapus Data Produksi', 'group' => 'production'],
            ['name' => 'approve_production', 'label' => 'Menyetujui Dispatch & Tiket', 'group' => 'production'],
            ['name' => 'reject_production', 'label' => 'Menolak Tiket Dumping', 'group' => 'production'],
            ['name' => 'export_production', 'label' => 'Export Laporan Produksi', 'group' => 'production'],
            ['name' => 'import_production', 'label' => 'Import Tiket Timbangan CSV/Excel', 'group' => 'production'],
            ['name' => 'print_production', 'label' => 'Cetak Tiket Dumping & Dispatch', 'group' => 'production'],

            // Fleet & Unit
            ['name' => 'view_fleet', 'label' => 'Melihat Modul Armada & Unit', 'group' => 'fleet'],
            ['name' => 'create_fleet', 'label' => 'Mendaftarkan Unit Baru', 'group' => 'fleet'],
            ['name' => 'edit_fleet', 'label' => 'Mengubah Data Armada', 'group' => 'fleet'],
            ['name' => 'delete_fleet', 'label' => 'Menghapus Unit Armada', 'group' => 'fleet'],
            ['name' => 'manage_p2h', 'label' => 'Input & Verifikasi Form P2H', 'group' => 'fleet'],
            ['name' => 'manage_hm_km', 'label' => 'Input Monitoring HM / KM', 'group' => 'fleet'],
            ['name' => 'report_breakdown', 'label' => 'Melaporkan Breakdown Unit', 'group' => 'fleet'],
            ['name' => 'approve_rfu', 'label' => 'Menyetujui Kesiapan Unit (RFU)', 'group' => 'fleet'],
            ['name' => 'export_fleet', 'label' => 'Export Status & KPI Armada', 'group' => 'fleet'],
            ['name' => 'print_fleet', 'label' => 'Cetak Lembar P2H & Fleet Card', 'group' => 'fleet'],

            // Maintenance & Workshop
            ['name' => 'view_maintenance', 'label' => 'Melihat Perawatan & Workshop', 'group' => 'maintenance'],
            ['name' => 'create_maintenance', 'label' => 'Membuat Work Order & PM', 'group' => 'maintenance'],
            ['name' => 'edit_maintenance', 'label' => 'Mengubah Work Order & Task Checklist', 'group' => 'maintenance'],
            ['name' => 'delete_maintenance', 'label' => 'Membatalkan Work Order', 'group' => 'maintenance'],
            ['name' => 'approve_work_order', 'label' => 'Menyetujui Work Order', 'group' => 'maintenance'],
            ['name' => 'reject_work_order', 'label' => 'Menolak Permintaan Perbaikan', 'group' => 'maintenance'],
            ['name' => 'execute_work_order', 'label' => 'Mengerjakan Perbaikan Unit', 'group' => 'maintenance'],
            ['name' => 'export_maintenance', 'label' => 'Export Laporan Perawatan', 'group' => 'maintenance'],
            ['name' => 'print_maintenance', 'label' => 'Cetak SPK / Work Order Form', 'group' => 'maintenance'],

            // Warehouse & Sparepart
            ['name' => 'view_warehouse', 'label' => 'Melihat Pergudangan & Stok', 'group' => 'warehouse'],
            ['name' => 'create_warehouse', 'label' => 'Input Transaksi Stok / Mutasi', 'group' => 'warehouse'],
            ['name' => 'edit_warehouse', 'label' => 'Mengubah Data Gudang & Item', 'group' => 'warehouse'],
            ['name' => 'delete_warehouse', 'label' => 'Menghapus Item / Gudang', 'group' => 'warehouse'],
            ['name' => 'approve_warehouse', 'label' => 'Menyetujui Transfer / Adjustment Stok', 'group' => 'warehouse'],
            ['name' => 'reject_warehouse', 'label' => 'Menolak Permintaan Sparepart', 'group' => 'warehouse'],
            ['name' => 'export_warehouse', 'label' => 'Export Kartu Stok & Laporan Gudang', 'group' => 'warehouse'],
            ['name' => 'print_warehouse', 'label' => 'Cetak Bukti Pengeluaran Barang / BIN Card', 'group' => 'warehouse'],

            // Procurement
            ['name' => 'view_procurement', 'label' => 'Melihat Modul Pengadaan', 'group' => 'procurement'],
            ['name' => 'create_procurement', 'label' => 'Membuat Purchase Request & PO', 'group' => 'procurement'],
            ['name' => 'edit_procurement', 'label' => 'Mengubah Data PR, RFQ, PO', 'group' => 'procurement'],
            ['name' => 'delete_procurement', 'label' => 'Membatalkan PR / PO', 'group' => 'procurement'],
            ['name' => 'approve_procurement', 'label' => 'Approval Purchase Request & PO', 'group' => 'procurement'],
            ['name' => 'reject_procurement', 'label' => 'Reject PR / PO', 'group' => 'procurement'],
            ['name' => 'export_procurement', 'label' => 'Export Laporan Pengadaan & Vendor', 'group' => 'procurement'],
            ['name' => 'print_procurement', 'label' => 'Cetak Purchase Order & Goods Receipt', 'group' => 'procurement'],

            // Fuel Management
            ['name' => 'view_fuel', 'label' => 'Melihat Manajemen BBM Solar', 'group' => 'fuel'],
            ['name' => 'create_fuel', 'label' => 'Input Sounding & Dispensing BBM', 'group' => 'fuel'],
            ['name' => 'edit_fuel', 'label' => 'Mengubah Catatan BBM', 'group' => 'fuel'],
            ['name' => 'delete_fuel', 'label' => 'Menghapus Transaksi BBM', 'group' => 'fuel'],
            ['name' => 'approve_fuel', 'label' => 'Approval Adjustment Stok Solar', 'group' => 'fuel'],
            ['name' => 'reject_fuel', 'label' => 'Menolak Transaksi BBM', 'group' => 'fuel'],
            ['name' => 'export_fuel', 'label' => 'Export Analisis Konsumsi Solar', 'group' => 'fuel'],
            ['name' => 'print_fuel', 'label' => 'Cetak Digital Fuel Ticket', 'group' => 'fuel'],

            // HR & Employee
            ['name' => 'view_hr', 'label' => 'Melihat Modul HR & Personalia', 'group' => 'hr'],
            ['name' => 'create_hr', 'label' => 'Input Karyawan, Kontrak & SIMPER', 'group' => 'hr'],
            ['name' => 'edit_hr', 'label' => 'Mengubah Data Karyawan & Absensi', 'group' => 'hr'],
            ['name' => 'delete_hr', 'label' => 'Menonaktifkan Karyawan', 'group' => 'hr'],
            ['name' => 'approve_hr', 'label' => 'Persetujuan Cuti & Koreksi Absensi', 'group' => 'hr'],
            ['name' => 'reject_hr', 'label' => 'Menolak Pengajuan Cuti / Absensi', 'group' => 'hr'],
            ['name' => 'export_hr', 'label' => 'Export Laporan Karyawan & Absensi', 'group' => 'hr'],
            ['name' => 'print_hr', 'label' => 'Cetak Dokumen & ID Badge Karyawan', 'group' => 'hr'],

            // Centralized Reporting & Analytics
            ['name' => 'view_analytics', 'label' => 'Melihat Seluruh Laporan & Analitik', 'group' => 'analytics'],
            ['name' => 'export_analytics', 'label' => 'Export Centralized Report (Excel/CSV)', 'group' => 'analytics'],
            ['name' => 'print_analytics', 'label' => 'Cetak Laporan Manajemen', 'group' => 'analytics'],
        ];

        $permissionModels = [];
        foreach ($permissionsList as $p) {
            $permissionModels[$p['name']] = Permission::updateOrCreate(
                ['name' => $p['name']],
                ['label' => $p['label'], 'group' => $p['group']]
            );
        }

        $allPermissionIds = collect($permissionModels)->pluck('id')->toArray();

        // 3. Map Permissions to Standard Roles
        // Super Admin gets EVERYTHING
        $roles['super_admin']->permissions()->sync($allPermissionIds);

        // Management: Read-only + Analytics + Exports across all modules
        $managementPerms = Permission::where(function ($q) {
            $q->where('name', 'like', 'view_%')
              ->orWhere('name', 'like', 'export_%')
              ->orWhere('name', 'like', 'print_%');
        })->pluck('id')->toArray();
        $roles['management']->permissions()->sync($managementPerms);

        // Project Manager: Full operational view & approvals
        $pmPerms = Permission::where(function ($q) {
            $q->where('name', 'like', 'view_%')
              ->orWhere('name', 'like', 'approve_%')
              ->orWhere('name', 'like', 'reject_%')
              ->orWhere('name', 'like', 'export_%')
              ->orWhere('name', 'like', 'print_%')
              ->orWhereIn('group', ['production', 'fleet', 'maintenance']);
        })->whereNotIn('name', ['delete_users', 'manage_roles'])->pluck('id')->toArray();
        $roles['project_manager']->permissions()->sync($pmPerms);

        // PJO: Safety, compliance, fleet RFU sign-off, work order approvals, production oversight
        $pjoPerms = Permission::whereIn('name', [
            'view_dashboard', 'view_executive_dashboard',
            'view_production', 'approve_production', 'export_production', 'print_production',
            'view_fleet', 'manage_p2h', 'report_breakdown', 'approve_rfu', 'export_fleet', 'print_fleet',
            'view_maintenance', 'approve_work_order', 'export_maintenance', 'print_maintenance',
            'view_fuel', 'export_fuel',
            'view_hr', 'approve_hr', 'export_hr',
            'view_analytics', 'export_analytics', 'print_analytics'
        ])->pluck('id')->toArray();
        $roles['pjo']->permissions()->sync($pjoPerms);

        // SVP Hauling: Hauling dispatch, driver & unit coordination, ticket verification
        $svpHaulingPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_production', 'create_production', 'edit_production', 'approve_production', 'reject_production', 'export_production', 'import_production', 'print_production',
            'view_fleet', 'manage_p2h', 'manage_hm_km', 'report_breakdown', 'export_fleet', 'print_fleet',
            'view_master',
            'view_analytics', 'export_analytics'
        ])->pluck('id')->toArray();
        $roles['svp_hauling']->permissions()->sync($svpHaulingPerms);

        // Admin Produksi: Daily dispatch entries, dumping tickets, import ticket
        $adminProdPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_production', 'create_production', 'edit_production', 'export_production', 'import_production', 'print_production',
            'view_fleet', 'manage_hm_km', 'print_fleet',
            'view_master'
        ])->pluck('id')->toArray();
        $roles['admin_produksi']->permissions()->sync($adminProdPerms);

        // SVP Plant & Maintenance: Workshop supervisor, WO approvals, RFU sign-off
        $svpPlantPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_fleet', 'report_breakdown', 'approve_rfu', 'export_fleet', 'print_fleet',
            'view_maintenance', 'create_maintenance', 'edit_maintenance', 'approve_work_order', 'reject_work_order', 'export_maintenance', 'print_maintenance',
            'view_warehouse', 'approve_warehouse',
            'view_analytics', 'export_analytics'
        ])->pluck('id')->toArray();
        $roles['svp_plant_maintenance']->permissions()->sync($svpPlantPerms);

        // Maintenance Planner: PM schedules, WO preparation, parts planning
        $maintPlannerPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_fleet', 'manage_hm_km', 'report_breakdown',
            'view_maintenance', 'create_maintenance', 'edit_maintenance', 'execute_work_order', 'export_maintenance', 'print_maintenance',
            'view_warehouse', 'create_warehouse',
            'view_master'
        ])->pluck('id')->toArray();
        $roles['maintenance_planner']->permissions()->sync($maintPlannerPerms);

        // Mekanik: Work orders inspection, checklist, repair execution
        $mekanikPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_fleet', 'report_breakdown',
            'view_maintenance', 'execute_work_order', 'print_maintenance',
            'view_warehouse'
        ])->pluck('id')->toArray();
        $roles['mekanik']->permissions()->sync($mekanikPerms);

        // Admin SCM: Supply chain, warehouse & procurement monitoring
        $adminScmPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_warehouse', 'create_warehouse', 'edit_warehouse', 'approve_warehouse', 'reject_warehouse', 'export_warehouse', 'print_warehouse',
            'view_procurement', 'create_procurement', 'edit_procurement', 'approve_procurement', 'reject_procurement', 'export_procurement', 'print_procurement',
            'view_master', 'export_master',
            'view_analytics', 'export_analytics'
        ])->pluck('id')->toArray();
        $roles['admin_scm']->permissions()->sync($adminScmPerms);

        // Admin Procurement: PR, RFQ, PO, Invoice
        $adminProcPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_procurement', 'create_procurement', 'edit_procurement', 'export_procurement', 'print_procurement',
            'view_warehouse',
            'view_master'
        ])->pluck('id')->toArray();
        $roles['admin_procurement']->permissions()->sync($adminProcPerms);

        // Warehouse / Storeman: Goods receipt, rack bin, stock in/out, opname
        $storemanPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_warehouse', 'create_warehouse', 'edit_warehouse', 'export_warehouse', 'print_warehouse',
            'view_procurement', 'print_procurement',
            'view_master'
        ])->pluck('id')->toArray();
        $roles['warehouse_storeman']->permissions()->sync($storemanPerms);

        // Fuelman: Sounding, dispensing, digital ticket
        $fuelmanPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_fuel', 'create_fuel', 'edit_fuel', 'export_fuel', 'print_fuel',
            'view_fleet', 'manage_hm_km'
        ])->pluck('id')->toArray();
        $roles['fuelman']->permissions()->sync($fuelmanPerms);

        // HR/GA: Employee, contracts, licenses, attendance, leaves
        $hrGaPerms = Permission::whereIn('name', [
            'view_dashboard',
            'view_hr', 'create_hr', 'edit_hr', 'approve_hr', 'reject_hr', 'export_hr', 'print_hr',
            'view_master', 'create_master', 'edit_master',
            'view_analytics', 'export_analytics'
        ])->pluck('id')->toArray();
        $roles['hr_ga']->permissions()->sync($hrGaPerms);

        // Driver DT: P2H inspection input, unit & trip view
        $driverPerms = Permission::whereIn('name', [
            'view_dashboard',
            'manage_p2h',
            'view_fleet',
            'view_production'
        ])->pluck('id')->toArray();
        $roles['driver_dt']->permissions()->sync($driverPerms);

        // 4. Default Company & Sites Setup
        $company = Company::firstOrCreate(
            ['code' => 'TAP'],
            [
                'name' => 'PT Teknindo Adhya Pane',
                'address' => 'Gedung Wisma Mulia Lt. 18, Jakarta Selatan / Balikpapan Hub',
                'phone' => '+62 21 5296-1234',
                'email' => 'corp@tap-mining.com',
                'is_active' => true,
            ]
        );

        $siteMtw = Site::firstOrCreate(
            ['code' => 'SITE-MTW'],
            [
                'company_id' => $company->id,
                'name' => 'Site Muara Teweh (Central Kalimantan)',
                'location' => 'Kabupaten Barito Utara, Kalimantan Tengah',
                'is_active' => true,
            ]
        );

        $siteLht = Site::firstOrCreate(
            ['code' => 'SITE-LHT'],
            [
                'company_id' => $company->id,
                'name' => 'Site Lahat (South Sumatra)',
                'location' => 'Kabupaten Lahat, Sumatera Selatan',
                'is_active' => true,
            ]
        );

        // 5. Bootstrap Standard Accounts for All 15 Roles
        $accounts = [
            [
                'email' => 'admin@tap-mining.com',
                'username' => 'superadmin',
                'name' => 'Mustapa Ahmad Kamal (Super Admin)',
                'role_key' => 'super_admin',
                'role_str' => 'admin',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id, $siteLht->id],
            ],
            [
                'email' => 'management@tap-mining.com',
                'username' => 'management',
                'name' => 'Ir. Bambang Soedirman (Direktur Operasional)',
                'role_key' => 'management',
                'role_str' => 'manager',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id, $siteLht->id],
            ],
            [
                'email' => 'pm.teweh@tap-mining.com',
                'username' => 'pm_teweh',
                'name' => 'Dharmawan Wicaksono (Project Manager MTW)',
                'role_key' => 'project_manager',
                'role_str' => 'manager',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id, $siteLht->id],
            ],
            [
                'email' => 'pjo.teweh@tap-mining.com',
                'username' => 'pjo_teweh',
                'name' => 'Budi Santoso, S.T. (PJO Muara Teweh)',
                'role_key' => 'pjo',
                'role_str' => 'manager',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'spv.hauling@tap-mining.com',
                'username' => 'svp_hauling',
                'name' => 'Hendra Saputra (SVP Hauling)',
                'role_key' => 'svp_hauling',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'admin.produksi@tap-mining.com',
                'username' => 'admin_prod',
                'name' => 'Wahyu Hidayat (Admin Produksi)',
                'role_key' => 'admin_produksi',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'spv.plant@tap-mining.com',
                'username' => 'svp_plant',
                'name' => 'Ahmad Fauzi (SVP Plant & Maintenance)',
                'role_key' => 'svp_plant_maintenance',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'planner.maint@tap-mining.com',
                'username' => 'maint_planner',
                'name' => 'Rian Pratama (Maintenance Planner)',
                'role_key' => 'maintenance_planner',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'mekanik.agus@tap-mining.com',
                'username' => 'mekanik_agus',
                'name' => 'Agus Riyadi (Mekanik Senior)',
                'role_key' => 'mekanik',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'admin.scm@tap-mining.com',
                'username' => 'admin_scm',
                'name' => 'Surya Wijaya (Admin SCM & Supply Chain)',
                'role_key' => 'admin_scm',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id, $siteLht->id],
            ],
            [
                'email' => 'admin.proc@tap-mining.com',
                'username' => 'admin_proc',
                'name' => 'Dewi Lestari (Admin Procurement)',
                'role_key' => 'admin_procurement',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'warehouse.storeman@tap-mining.com',
                'username' => 'storeman',
                'name' => 'Joko Susilo (Warehouse Storeman)',
                'role_key' => 'warehouse_storeman',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'fuelman.andi@tap-mining.com',
                'username' => 'fuelman_andi',
                'name' => 'Andi Wijaya (Fuelman Muara Teweh)',
                'role_key' => 'fuelman',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'hrga.teweh@tap-mining.com',
                'username' => 'hr_ga',
                'name' => 'Siti Nurhaliza (HR/GA Specialist)',
                'role_key' => 'hr_ga',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
            [
                'email' => 'driver.budi@tap-mining.com',
                'username' => 'driver_budi',
                'name' => 'Budi Santoso (Driver DT-01)',
                'role_key' => 'driver_dt',
                'role_str' => 'user',
                'site_id' => $siteMtw->id,
                'extra_sites' => [$siteMtw->id],
            ],
        ];

        foreach ($accounts as $acc) {
            $user = User::where('email', $acc['email'])->first();
            if (!$user) {
                $user = User::create([
                    'name' => $acc['name'],
                    'username' => $acc['username'],
                    'email' => $acc['email'],
                    'role' => $acc['role_str'],
                    'status' => 'active',
                    'company_id' => $company->id,
                    'site_id' => $acc['site_id'],
                    'password' => Hash::make('password123'),
                ]);
            } else {
                $user->update([
                    'name' => $acc['name'],
                    'username' => $acc['username'] ?? $user->username,
                    'status' => 'active',
                    'company_id' => $company->id,
                    'site_id' => $acc['site_id'],
                ]);
            }

            // Sync role
            if (isset($roles[$acc['role_key']])) {
                $user->roles()->syncWithoutDetaching([$roles[$acc['role_key']]->id]);
            }

            // Sync user sites
            $siteSyncData = [];
            foreach ($acc['extra_sites'] as $sId) {
                $siteSyncData[$sId] = ['is_default' => ($sId == $acc['site_id'])];
            }
            $user->sites()->sync($siteSyncData);
        }
    }
}
