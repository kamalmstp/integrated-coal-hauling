<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Material;
use App\Models\Permission;
use App\Models\Position;
use App\Models\Role;
use App\Models\Shift;
use App\Models\Site;
use App\Models\SystemSetting;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TapMasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $rolesData = [
            ['name' => 'super_admin', 'label' => 'Super Administrator', 'description' => 'Akses penuh ke seluruh konfigurasi, master data, dan operasional TAP.'],
            ['name' => 'project_manager', 'label' => 'Project Manager', 'description' => 'Mengawasi seluruh operasional hauling di level site/proyek.'],
            ['name' => 'supervisor_hauling', 'label' => 'Supervisor Hauling', 'description' => 'Mengontrol armada dump truck, jalan hauling, dan target ritase.'],
            ['name' => 'dispatcher', 'label' => 'Dispatcher Operasional', 'description' => 'Input data ritase, penugasan unit, dan status operasional real-time.'],
            ['name' => 'safety_officer', 'label' => 'HSE / Safety Officer', 'description' => 'Pengawasan keselamatan kerja, izin mengemudi (SIMPER), dan status MCU.'],
            ['name' => 'mechanic', 'label' => 'Maintenance & Mekanik', 'description' => 'Pemantauan status breakdown, service berkala, dan HM/KM unit.'],
            ['name' => 'viewer', 'label' => 'Management Viewer', 'description' => 'Hak akses melihat laporan dan metrik tanpa izin mengubah data.'],
        ];

        $roles = [];
        foreach ($rolesData as $rd) {
            $roles[$rd['name']] = Role::firstOrCreate(['name' => $rd['name']], $rd);
        }

        // 2. Permissions
        $permissionsData = [
            // Organization
            ['name' => 'manage_companies', 'label' => 'Kelola Perusahaan', 'group' => 'organization'],
            ['name' => 'manage_sites', 'label' => 'Kelola Site Proyek', 'group' => 'organization'],
            ['name' => 'manage_departments', 'label' => 'Kelola Departemen', 'group' => 'organization'],
            ['name' => 'manage_positions', 'label' => 'Kelola Jabatan', 'group' => 'organization'],
            // Master Data
            ['name' => 'manage_employees', 'label' => 'Kelola Data Karyawan', 'group' => 'master'],
            ['name' => 'manage_drivers', 'label' => 'Kelola Data Driver & SIMPER', 'group' => 'master'],
            ['name' => 'manage_units', 'label' => 'Kelola Armada & Unit Alat Berat', 'group' => 'master'],
            ['name' => 'manage_locations', 'label' => 'Kelola Lokasi & Jalur Hauling', 'group' => 'master'],
            ['name' => 'manage_shifts', 'label' => 'Kelola Shift Kerja', 'group' => 'master'],
            ['name' => 'manage_vendors', 'label' => 'Kelola Mitra & Vendor', 'group' => 'master'],
            ['name' => 'manage_customers', 'label' => 'Kelola Klien / Pemilik IUP', 'group' => 'master'],
            ['name' => 'manage_materials', 'label' => 'Kelola Jenis Material', 'group' => 'master'],
            // Security & Settings
            ['name' => 'manage_users', 'label' => 'Kelola Pengguna', 'group' => 'security'],
            ['name' => 'manage_roles', 'label' => 'Kelola Role & Hak Akses', 'group' => 'security'],
            ['name' => 'view_activity_logs', 'label' => 'Melihat Log Aktivitas', 'group' => 'security'],
            ['name' => 'manage_settings', 'label' => 'Konfigurasi Sistem', 'group' => 'security'],
            ['name' => 'view_dashboard', 'label' => 'Akses Dashboard', 'group' => 'general'],
        ];

        $allPermIds = [];
        foreach ($permissionsData as $pd) {
            $p = Permission::firstOrCreate(['name' => $pd['name']], $pd);
            $allPermIds[] = $p->id;
        }

        // Attach all permissions to super_admin
        $roles['super_admin']->permissions()->sync($allPermIds);

        // Project Manager permissions
        $pmPerms = Permission::whereIn('name', [
            'view_dashboard', 'manage_sites', 'manage_departments', 'manage_positions',
            'manage_employees', 'manage_drivers', 'manage_units', 'manage_locations',
            'manage_shifts', 'manage_vendors', 'manage_customers', 'manage_materials',
            'view_activity_logs'
        ])->pluck('id');
        $roles['project_manager']->permissions()->sync($pmPerms);

        // Supervisor Hauling permissions
        $spvPerms = Permission::whereIn('name', [
            'view_dashboard', 'manage_drivers', 'manage_units', 'manage_locations', 'manage_shifts'
        ])->pluck('id');
        $roles['supervisor_hauling']->permissions()->sync($spvPerms);

        // 3. Organization: Company
        $company = Company::firstOrCreate(
            ['code' => 'TAP'],
            [
                'name' => 'PT Teknindo Adhya Pane',
                'address' => 'Gedung Wisma Mulia Lt. 18, Jl. Jend. Gatot Subroto No. 42, Jakarta Selatan / Balikpapan Hub: Komplek Balikpapan Baru Blok AB-3',
                'phone' => '+62 21 5296-1234',
                'email' => 'corp@tap-mining.com',
                'npwp' => '01.234.567.8-012.000',
                'is_active' => true,
            ]
        );

        // 4. Sites
        $site1 = Site::firstOrCreate(
            ['code' => 'SITE-MTW'],
            [
                'company_id' => $company->id,
                'name' => 'Site Muara Teweh (Central Kalimantan)',
                'location' => 'Kabupaten Barito Utara, Kalimantan Tengah',
                'latitude' => -0.96324000,
                'longitude' => 114.88765000,
                'is_active' => true,
            ]
        );

        $site2 = Site::firstOrCreate(
            ['code' => 'SITE-LHT'],
            [
                'company_id' => $company->id,
                'name' => 'Site Lahat (South Sumatra)',
                'location' => 'Kabupaten Lahat & Muara Enim, Sumatera Selatan',
                'latitude' => -3.79156000,
                'longitude' => 103.54123000,
                'is_active' => true,
            ]
        );

        // 5. Departments
        $deptOps = Department::firstOrCreate(['code' => 'OPS'], [
            'company_id' => $company->id,
            'name' => 'Operations & Hauling',
            'description' => 'Divisi operasional pengangkutan batu bara, manajemen rute, dan produksi harian.',
            'is_active' => true,
        ]);

        $deptPlant = Department::firstOrCreate(['code' => 'PLANT'], [
            'company_id' => $company->id,
            'name' => 'Plant & Maintenance',
            'description' => 'Pemeliharaan armada dump truck, workshop alat berat, dan manajemen spare parts.',
            'is_active' => true,
        ]);

        $deptHse = Department::firstOrCreate(['code' => 'HSE'], [
            'company_id' => $company->id,
            'name' => 'Health, Safety & Environment (HSE)',
            'description' => 'Keselamatan dan kesehatan kerja tambang (K3LH), kepatuhan izin mengemudi (SIMPER), dan audit lingkungan.',
            'is_active' => true,
        ]);

        $deptHrga = Department::firstOrCreate(['code' => 'HRGA'], [
            'company_id' => $company->id,
            'name' => 'Human Resource & General Affairs',
            'description' => 'Manajemen kepegawaian, mess karyawan, perizinan, dan fasilitas site.',
            'is_active' => true,
        ]);

        $deptFin = Department::firstOrCreate(['code' => 'FIN'], [
            'company_id' => $company->id,
            'name' => 'Finance & Logistic',
            'description' => 'Keuangan, pembukuan bahan bakar (fuel tally), dan persediaan barang.',
            'is_active' => true,
        ]);

        // 6. Positions
        $posPM = Position::firstOrCreate(['code' => 'POS-PM'], [
            'department_id' => $deptOps->id,
            'parent_id' => null,
            'title' => 'Project Manager Site',
            'level' => 1,
            'is_active' => true,
        ]);

        $posSpvHaul = Position::firstOrCreate(['code' => 'POS-SPV-HAUL'], [
            'department_id' => $deptOps->id,
            'parent_id' => $posPM->id,
            'title' => 'Supervisor Hauling & Fleet',
            'level' => 2,
            'is_active' => true,
        ]);

        $posDispatch = Position::firstOrCreate(['code' => 'POS-DISPATCH'], [
            'department_id' => $deptOps->id,
            'parent_id' => $posSpvHaul->id,
            'title' => 'Dispatcher & Tallyman',
            'level' => 3,
            'is_active' => true,
        ]);

        $posHseLead = Position::firstOrCreate(['code' => 'POS-HSE-LEAD'], [
            'department_id' => $deptHse->id,
            'parent_id' => $posPM->id,
            'title' => 'HSE Superintendent',
            'level' => 2,
            'is_active' => true,
        ]);

        $posMechLead = Position::firstOrCreate(['code' => 'POS-PLANT-LEAD'], [
            'department_id' => $deptPlant->id,
            'parent_id' => $posPM->id,
            'title' => 'Plant Superintendent & Kepala Mekanik',
            'level' => 2,
            'is_active' => true,
        ]);

        $posDriverDT = Position::firstOrCreate(['code' => 'POS-DRIVER-DT'], [
            'department_id' => $deptOps->id,
            'parent_id' => $posSpvHaul->id,
            'title' => 'Driver Dump Truck Hauling',
            'level' => 4,
            'is_active' => true,
        ]);

        // 7. Vendors
        $vendorUT = Vendor::firstOrCreate(['vendor_code' => 'VND-UT-01'], [
            'name' => 'PT United Tractors Tbk',
            'vendor_type' => 'spareparts',
            'address' => 'Jl. Raya Bekasi KM 22, Cakung / Cab. Balikpapan',
            'contact_person' => 'Hendro Prasetyo',
            'phone' => '+62 542 765432',
            'email' => 'support.scania@unitedtractors.com',
            'npwp' => '01.001.234.5-091.000',
            'is_active' => true,
        ]);

        $vendorTrakindo = Vendor::firstOrCreate(['vendor_code' => 'VND-TRK-02'], [
            'name' => 'PT Trakindo Utama',
            'vendor_type' => 'service',
            'address' => 'Kawasan Industri Kariangau, Balikpapan',
            'contact_person' => 'Bambang Irawan',
            'phone' => '+62 542 876543',
            'email' => 'service@trakindo.co.id',
            'npwp' => '01.002.345.6-091.000',
            'is_active' => true,
        ]);

        $vendorPertamina = Vendor::firstOrCreate(['vendor_code' => 'VND-PTM-03'], [
            'name' => 'PT Pertamina Patra Niaga (Fuel Industrial)',
            'vendor_type' => 'fuel',
            'address' => 'Jl. Yos Sudarso No. 1, Balikpapan',
            'contact_person' => 'Dwi Cahyono',
            'phone' => '+62 542 412345',
            'email' => 'hsd.sales@pertaminapatraniaga.com',
            'npwp' => '01.003.456.7-091.000',
            'is_active' => true,
        ]);

        $vendorRental = Vendor::firstOrCreate(['vendor_code' => 'VND-RNT-04'], [
            'name' => 'PT Borneo Jaya Rentalindo',
            'vendor_type' => 'rental',
            'address' => 'Jl. Ahmad Yani KM 4, Muara Teweh',
            'contact_person' => 'Agus Subekti',
            'phone' => '+62 538 21987',
            'email' => 'borneo.rental@yahoo.co.id',
            'npwp' => '02.445.678.9-732.000',
            'is_active' => true,
        ]);

        // 8. Customers (Mining Concession Owners / IUP)
        $custMuto = Customer::firstOrCreate(['customer_code' => 'CUST-MUTO'], [
            'site_id' => $site1->id,
            'name' => 'PT Multi Tambangjaya Utama (Indika Energy)',
            'contract_number' => 'CTR/TAP-MUTO/2025/08',
            'contract_start_date' => '2025-01-01',
            'contract_end_date' => '2027-12-31',
            'target_tonnage' => 3500000.00,
            'contact_person' => 'Ir. Gunawan Wibisono',
            'phone' => '+62 538 33445',
            'email' => 'mining.ops@muto-coal.com',
            'is_active' => true,
        ]);

        $custBarito = Customer::firstOrCreate(['customer_code' => 'CUST-BARITO'], [
            'site_id' => $site1->id,
            'name' => 'PT Barito Sumber Energi',
            'contract_number' => 'CTR/TAP-BSE/2026/02',
            'contract_start_date' => '2026-02-01',
            'contract_end_date' => '2028-01-31',
            'target_tonnage' => 2000000.00,
            'contact_person' => 'Rudy Hartono',
            'phone' => '+62 538 55667',
            'email' => 'logistics@baritocoal.co.id',
            'is_active' => true,
        ]);

        // 9. Materials
        $matCoalRom = Material::firstOrCreate(['code' => 'MAT-CROM'], [
            'name' => 'Coal ROM (Run of Mine)',
            'unit_of_measure' => 'Ton',
            'density' => 1.300,
            'is_active' => true,
        ]);

        $matCoalCrush = Material::firstOrCreate(['code' => 'MAT-CCRS'], [
            'name' => 'Coal Crushed (Product Size)',
            'unit_of_measure' => 'Ton',
            'density' => 1.250,
            'is_active' => true,
        ]);

        $matOB = Material::firstOrCreate(['code' => 'MAT-OB'], [
            'name' => 'Overburden (OB) Rock Waste',
            'unit_of_measure' => 'BCM',
            'density' => 2.100,
            'is_active' => true,
        ]);

        $matFuel = Material::firstOrCreate(['code' => 'MAT-HSD'], [
            'name' => 'High Speed Diesel (HSD Solar B35)',
            'unit_of_measure' => 'Liter',
            'density' => 0.840,
            'is_active' => true,
        ]);

        // 10. Shifts
        Shift::firstOrCreate(['code' => 'SHIFT-DS'], [
            'site_id' => $site1->id,
            'name' => 'Shift 1 (Day Shift / Siang)',
            'start_time' => '06:00:00',
            'end_time' => '18:00:00',
            'is_night_shift' => false,
            'is_active' => true,
        ]);

        Shift::firstOrCreate(['code' => 'SHIFT-NS'], [
            'site_id' => $site1->id,
            'name' => 'Shift 2 (Night Shift / Malam)',
            'start_time' => '18:00:00',
            'end_time' => '06:00:00',
            'is_night_shift' => true,
            'is_active' => true,
        ]);

        Shift::firstOrCreate(['code' => 'SHIFT-LS'], [
            'site_id' => $site1->id,
            'name' => 'Long Shift (Hauling Extended)',
            'start_time' => '06:00:00',
            'end_time' => '20:00:00',
            'is_night_shift' => false,
            'is_active' => true,
        ]);

        // 11. Locations
        $locationsData = [
            ['code' => 'LOC-PIT-NORTH', 'name' => 'Pit North Block 3', 'location_type' => 'pit', 'km_marker' => 'KM 00+000'],
            ['code' => 'LOC-FRONT-A', 'name' => 'Front Loading Exca PC800-01', 'location_type' => 'front_loading', 'km_marker' => 'KM 01+200'],
            ['code' => 'LOC-ROAD-KM12', 'name' => 'Hauling Road KM 12 Checkpoint', 'location_type' => 'hauling_road', 'km_marker' => 'KM 12+000'],
            ['code' => 'LOC-ROAD-KM25', 'name' => 'Hauling Road KM 25 Bridge', 'location_type' => 'hauling_road', 'km_marker' => 'KM 25+500'],
            ['code' => 'LOC-STP-JETTY', 'name' => 'Stockpile ROM Jetty Teluk Siwak', 'location_type' => 'stockpile', 'km_marker' => 'KM 48+000'],
            ['code' => 'LOC-JETTY-01', 'name' => 'Jetty Barge Loading Port 1', 'location_type' => 'jetty', 'km_marker' => 'KM 49+200'],
            ['code' => 'LOC-DISP-EAST', 'name' => 'Disposal Area East Dump', 'location_type' => 'disposal', 'km_marker' => 'KM 03+500'],
            ['code' => 'LOC-WS-CENTRAL', 'name' => 'Central Workshop & Plant MTW', 'location_type' => 'workshop', 'km_marker' => 'KM 05+000'],
            ['code' => 'LOC-WH-PARTS', 'name' => 'Warehouse Spareparts & Tyre', 'location_type' => 'warehouse', 'km_marker' => 'KM 05+100'],
            ['code' => 'LOC-FUEL-KM05', 'name' => 'Fuel Station Tanki Induk KM 05', 'location_type' => 'fuel_station', 'km_marker' => 'KM 05+300'],
        ];

        foreach ($locationsData as $ld) {
            Location::firstOrCreate(
                ['code' => $ld['code']],
                array_merge($ld, [
                    'site_id' => $site1->id,
                    'is_active' => true,
                ])
            );
        }

        // 12. Key Employees
        $empPM = Employee::firstOrCreate(['employee_code' => 'TAP-EMP-001'], [
            'nik' => '3171012301850001',
            'name' => 'Dharmawan Wicaksono, S.T.',
            'company_id' => $company->id,
            'site_id' => $site1->id,
            'department_id' => $deptOps->id,
            'position_id' => $posPM->id,
            'join_date' => '2023-01-15',
            'employment_status' => 'permanent',
            'phone' => '+62 811-540-1001',
            'email' => 'pm.teweh@tap-mining.com',
            'address' => 'Komplek Pertambangan TAP Camp KM 05, Muara Teweh',
            'is_active' => true,
        ]);

        $empSpv = Employee::firstOrCreate(['employee_code' => 'TAP-EMP-002'], [
            'nik' => '6472021508880002',
            'name' => 'Hendra Saputra',
            'company_id' => $company->id,
            'site_id' => $site1->id,
            'department_id' => $deptOps->id,
            'position_id' => $posSpvHaul->id,
            'join_date' => '2023-03-01',
            'employment_status' => 'permanent',
            'phone' => '+62 812-540-2002',
            'email' => 'spv.hauling@tap-mining.com',
            'address' => 'Jl. Panglima Batur No. 12, Muara Teweh',
            'is_active' => true,
        ]);

        $empDispatch = Employee::firstOrCreate(['employee_code' => 'TAP-EMP-003'], [
            'nik' => '6472041105920003',
            'name' => 'Wahyu Hidayat',
            'company_id' => $company->id,
            'site_id' => $site1->id,
            'department_id' => $deptOps->id,
            'position_id' => $posDispatch->id,
            'join_date' => '2024-01-10',
            'employment_status' => 'contract',
            'phone' => '+62 813-540-3003',
            'email' => 'dispatch.teweh@tap-mining.com',
            'address' => 'Mess TAP KM 05, Muara Teweh',
            'is_active' => true,
        ]);

        $empHse = Employee::firstOrCreate(['employee_code' => 'TAP-EMP-004'], [
            'nik' => '6472051909890004',
            'name' => 'Rahmat Kurniawan, S.K.M.',
            'company_id' => $company->id,
            'site_id' => $site1->id,
            'department_id' => $deptHse->id,
            'position_id' => $posHseLead->id,
            'join_date' => '2023-06-01',
            'employment_status' => 'permanent',
            'phone' => '+62 811-540-4004',
            'email' => 'safety@tap-mining.com',
            'address' => 'Mess Staff TAP KM 05, Muara Teweh',
            'is_active' => true,
        ]);

        // Seed 6 Drivers as Employees
        $driverEmployees = [
            ['code' => 'TAP-DRV-001', 'nik' => '6472010101850011', 'name' => 'Supriyadi', 'sim' => '850112345678', 'simper' => 'SIMPER-TAP-2025-011', 'mcu' => 'fit'],
            ['code' => 'TAP-DRV-002', 'nik' => '6472010101860012', 'name' => 'Agus Priyono', 'sim' => '860112345679', 'simper' => 'SIMPER-TAP-2025-012', 'mcu' => 'fit'],
            ['code' => 'TAP-DRV-003', 'nik' => '6472010101870013', 'name' => 'Bambang Sudibyo', 'sim' => '870112345680', 'simper' => 'SIMPER-TAP-2025-013', 'mcu' => 'fit_with_note'],
            ['code' => 'TAP-DRV-004', 'nik' => '6472010101880014', 'name' => 'Roni Hermawan', 'sim' => '880112345681', 'simper' => 'SIMPER-TAP-2025-014', 'mcu' => 'fit'],
            ['code' => 'TAP-DRV-005', 'nik' => '6472010101890015', 'name' => 'Dedi Iskandar', 'sim' => '890112345682', 'simper' => 'SIMPER-TAP-2024-009', 'mcu' => 'unfit'],
            ['code' => 'TAP-DRV-006', 'nik' => '6472010101900016', 'name' => 'Eko Prasetyo', 'sim' => '900112345683', 'simper' => 'SIMPER-TAP-2025-016', 'mcu' => 'fit'],
        ];

        foreach ($driverEmployees as $de) {
            $emp = Employee::firstOrCreate(['employee_code' => $de['code']], [
                'nik' => $de['nik'],
                'name' => $de['name'],
                'company_id' => $company->id,
                'site_id' => $site1->id,
                'department_id' => $deptOps->id,
                'position_id' => $posDriverDT->id,
                'join_date' => '2024-02-01',
                'employment_status' => 'contract',
                'phone' => '+62 821-5000-' . rand(1000, 9999),
                'email' => strtolower(str_replace(' ', '.', $de['name'])) . '@tap-hauling.com',
                'address' => 'Dormitory Driver TAP Site Muara Teweh',
                'is_active' => true,
            ]);

            Driver::firstOrCreate(['driver_code' => 'DRV-' . substr($de['code'], -3)], [
                'employee_id' => $emp->id,
                'sim_number' => $de['sim'],
                'sim_type' => 'BII Umum',
                'sim_expiry' => '2028-05-20',
                'simper_number' => $de['simper'],
                'simper_expiry' => '2026-12-31',
                'mcu_status' => $de['mcu'],
                'mcu_date' => '2026-01-15',
                'mcu_expiry' => '2027-01-15',
                'is_active' => $de['mcu'] !== 'unfit',
                'notes' => $de['mcu'] === 'fit_with_note' ? 'Wajib menggunakan kacamata saat shift malam' : null,
            ]);
        }

        // 13. Units Master (Hauling Fleets)
        $unitsData = [
            // Dump Truck 10 Roda
            ['code' => 'DT-101', 'plat' => 'KT 8101 MT', 'type' => 'dump_truck_10', 'brand' => 'Hino', 'model' => '500 FM 260 JD', 'year' => 2023, 'ton' => 30.00, 'm3' => 22.00, 'hm' => 4520.50, 'km' => 68200.00, 'status' => 'operating'],
            ['code' => 'DT-102', 'plat' => 'KT 8102 MT', 'type' => 'dump_truck_10', 'brand' => 'Hino', 'model' => '500 FM 260 JD', 'year' => 2023, 'ton' => 30.00, 'm3' => 22.00, 'hm' => 4410.20, 'km' => 65300.00, 'status' => 'operating'],
            ['code' => 'DT-103', 'plat' => 'KT 8103 MT', 'type' => 'dump_truck_10', 'brand' => 'Mitsubishi Fuso', 'model' => 'Fighter FN 62 F', 'year' => 2024, 'ton' => 32.00, 'm3' => 24.00, 'hm' => 2890.00, 'km' => 42100.00, 'status' => 'operating'],
            // Dump Truck 12 Roda (Heavy Hauling)
            ['code' => 'DT-201', 'plat' => 'KT 8201 MT', 'type' => 'dump_truck_12', 'brand' => 'Scania', 'model' => 'P410 B8x4HZ', 'year' => 2024, 'ton' => 45.00, 'm3' => 34.00, 'hm' => 3100.80, 'km' => 52300.00, 'status' => 'operating'],
            ['code' => 'DT-202', 'plat' => 'KT 8202 MT', 'type' => 'dump_truck_12', 'brand' => 'Scania', 'model' => 'P410 B8x4HZ', 'year' => 2024, 'ton' => 45.00, 'm3' => 34.00, 'hm' => 3050.40, 'km' => 51100.00, 'status' => 'maintenance'],
            ['code' => 'DT-203', 'plat' => 'KT 8203 MT', 'type' => 'dump_truck_12', 'brand' => 'Volvo', 'model' => 'FMX 440 8x4', 'year' => 2023, 'ton' => 48.00, 'm3' => 36.00, 'hm' => 5120.00, 'km' => 74800.00, 'status' => 'standby'],
            ['code' => 'DT-204', 'plat' => 'KT 8204 MT', 'type' => 'dump_truck_12', 'brand' => 'Volvo', 'model' => 'FMX 440 8x4', 'year' => 2023, 'ton' => 48.00, 'm3' => 36.00, 'hm' => 5430.50, 'km' => 79200.00, 'status' => 'breakdown'],
            // Light Vehicle (LV Patrol / Operasional)
            ['code' => 'LV-01', 'plat' => 'KT 1101 MT', 'type' => 'light_vehicle', 'brand' => 'Toyota', 'model' => 'Hilux 2.4 Double Cabin 4x4', 'year' => 2024, 'ton' => 1.00, 'm3' => 1.50, 'hm' => 1800.00, 'km' => 34200.00, 'status' => 'operating'],
            ['code' => 'LV-02', 'plat' => 'KT 1102 MT', 'type' => 'light_vehicle', 'brand' => 'Mitsubishi', 'model' => 'Triton HDX 4x4', 'year' => 2023, 'ton' => 1.00, 'm3' => 1.50, 'hm' => 2600.00, 'km' => 49100.00, 'status' => 'operating'],
            // Fuel Truck
            ['code' => 'FT-01', 'plat' => 'KT 8301 MT', 'type' => 'fuel_truck', 'brand' => 'Hino', 'model' => '500 Tanker 16,000 L', 'year' => 2023, 'ton' => 16.00, 'm3' => 16.00, 'hm' => 3900.00, 'km' => 45000.00, 'status' => 'operating'],
            // Service Truck
            ['code' => 'ST-01', 'plat' => 'KT 8401 MT', 'type' => 'service_truck', 'brand' => 'Isuzu', 'model' => 'Giga FVM Mobile Lube Unit', 'year' => 2023, 'ton' => 10.00, 'm3' => 8.00, 'hm' => 2950.00, 'km' => 38000.00, 'status' => 'operating'],
            // Support Equipment
            ['code' => 'WT-01', 'plat' => 'KT 8501 MT', 'type' => 'support_equipment', 'brand' => 'Hino', 'model' => 'Water Truck 20,000 L', 'year' => 2022, 'ton' => 20.00, 'm3' => 20.00, 'hm' => 6100.00, 'km' => 81000.00, 'status' => 'operating'],
        ];

        foreach ($unitsData as $u) {
            Unit::firstOrCreate(['unit_code' => $u['code']], [
                'registration_number' => $u['plat'],
                'unit_type' => $u['type'],
                'brand' => $u['brand'],
                'model' => $u['model'],
                'year' => $u['year'],
                'capacity_ton' => $u['ton'],
                'capacity_m3' => $u['m3'],
                'chassis_number' => 'MHK' . strtoupper(substr(md5($u['code']), 0, 14)),
                'engine_number' => 'ENG' . strtoupper(substr(md5($u['plat']), 0, 10)),
                'last_hm' => $u['hm'],
                'last_km' => $u['km'],
                'status' => $u['status'],
                'operation_start_date' => '2024-01-01',
                'site_id' => $site1->id,
                'vendor_id' => str_starts_with($u['code'], 'DT-2') ? $vendorRental->id : null,
                'is_active' => true,
            ]);
        }

        // 14. System Configuration Settings
        $settings = [
            ['key' => 'app.site.default', 'group' => 'site', 'value' => 'SITE-MTW', 'description' => 'Site default operasional sistem'],
            ['key' => 'app.hauling.operational_hours', 'group' => 'operational', 'value' => '24', 'description' => 'Durasi jam operasional hauling harian'],
            ['key' => 'app.hauling.daily_target_ton', 'group' => 'operational', 'value' => '15000', 'description' => 'Target produksi hauling harian (Ton)'],
            ['key' => 'app.safety.speed_limit_loaded', 'group' => 'operational', 'value' => '40', 'description' => 'Batas kecepatan maksimal kondisi bermuatan (KM/Jam)'],
            ['key' => 'app.safety.speed_limit_empty', 'group' => 'operational', 'value' => '50', 'description' => 'Batas kecepatan maksimal kondisi kosongan (KM/Jam)'],
            ['key' => 'app.unit.fuel_density_ratio', 'group' => 'units', 'value' => '0.840', 'description' => 'Rasio densitas bahan bakar solar HSD (Ton/M3)'],
            ['key' => 'app.doc_sequence.ticket', 'group' => 'document_sequence', 'value' => 'TKT/HAUL/{YEAR}{MONTH}/{SEQ}', 'description' => 'Format penomoran tiket hauling otomatis'],
            ['key' => 'app.doc_sequence.spk', 'group' => 'document_sequence', 'value' => 'SPK/TAP/{YEAR}/{MONTH}/{SEQ}', 'description' => 'Format penomoran surat perintah kerja otomatis'],
            ['key' => 'app.doc_sequence.mcu', 'group' => 'document_sequence', 'value' => 'MCU/TAP/{YEAR}/{SEQ}', 'description' => 'Format penomoran surat hasil MCU'],
        ];

        foreach ($settings as $s) {
            SystemSetting::firstOrCreate(['key' => $s['key']], $s);
        }

        // 15. Create Master Users & Link to Roles
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@tap-mining.com'],
            [
                'name' => 'Ahmad Fauzi (Super Administrator)',
                'role' => 'admin',
                'status' => 'active',
                'phone' => '+62 812-3456-7890',
                'company_id' => $company->id,
                'site_id' => $site1->id,
                'password' => Hash::make('password123'),
            ]
        );
        $adminUser->roles()->syncWithoutDetaching([$roles['super_admin']->id]);

        $pmUser = User::firstOrCreate(
            ['email' => 'pm.teweh@tap-mining.com'],
            [
                'name' => 'Dharmawan Wicaksono (Project Manager)',
                'role' => 'manager',
                'status' => 'active',
                'phone' => '+62 811-540-1001',
                'employee_id' => $empPM->id,
                'company_id' => $company->id,
                'site_id' => $site1->id,
                'password' => Hash::make('password123'),
            ]
        );
        $pmUser->roles()->syncWithoutDetaching([$roles['project_manager']->id]);

        $spvUser = User::firstOrCreate(
            ['email' => 'spv.hauling@tap-mining.com'],
            [
                'name' => 'Hendra Saputra (Supervisor Hauling)',
                'role' => 'user',
                'status' => 'active',
                'phone' => '+62 812-540-2002',
                'employee_id' => $empSpv->id,
                'company_id' => $company->id,
                'site_id' => $site1->id,
                'password' => Hash::make('password123'),
            ]
        );
        $spvUser->roles()->syncWithoutDetaching([$roles['supervisor_hauling']->id]);

        $dispatchUser = User::firstOrCreate(
            ['email' => 'dispatch.teweh@tap-mining.com'],
            [
                'name' => 'Wahyu Hidayat (Dispatcher)',
                'role' => 'user',
                'status' => 'active',
                'phone' => '+62 813-540-3003',
                'employee_id' => $empDispatch->id,
                'company_id' => $company->id,
                'site_id' => $site1->id,
                'password' => Hash::make('password123'),
            ]
        );
        $dispatchUser->roles()->syncWithoutDetaching([$roles['dispatcher']->id]);

        $safetyUser = User::firstOrCreate(
            ['email' => 'safety@tap-mining.com'],
            [
                'name' => 'Rahmat Kurniawan (Safety Officer)',
                'role' => 'editor',
                'status' => 'active',
                'phone' => '+62 811-540-4004',
                'employee_id' => $empHse->id,
                'company_id' => $company->id,
                'site_id' => $site1->id,
                'password' => Hash::make('password123'),
            ]
        );
        $safetyUser->roles()->syncWithoutDetaching([$roles['safety_officer']->id]);

        // 16. Sample Initial Activity Logs
        ActivityLog::create([
            'user_id' => $adminUser->id,
            'action' => 'seed',
            'module' => 'system_foundation',
            'description' => 'Inisialisasi Master Data & System Foundation PT Teknindo Adhya Pane berhasil.',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder Script',
            'properties' => ['roles_count' => 7, 'units_count' => 12, 'drivers_count' => 6],
            'created_at' => now(),
        ]);
    }
}
