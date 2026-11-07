<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Employee;
use App\Models\FleetDailyKpi;
use App\Models\MaintenanceServiceInterval;
use App\Models\P2hInspection;
use App\Models\P2hItem;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use App\Models\User;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TapFleetDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fleet Permissions
        $fleetPerms = [
            ['name' => 'manage_fleet_registry', 'label' => 'Kelola Unit Registry & Spesifikasi', 'group' => 'fleet'],
            ['name' => 'manage_p2h', 'label' => 'Input & Verifikasi Form Digital P2H', 'group' => 'fleet'],
            ['name' => 'manage_hm_km', 'label' => 'Monitoring HM/KM & Deteksi Anomali', 'group' => 'fleet'],
            ['name' => 'manage_work_orders', 'label' => 'Kelola Work Order & Downtime Unit', 'group' => 'fleet'],
            ['name' => 'view_fleet_kpi', 'label' => 'Lihat KPI Fleet (PA, MA, UA, MTTR, MTBF)', 'group' => 'fleet'],
        ];

        $allPermIds = [];
        foreach ($fleetPerms as $pData) {
            $p = Permission::firstOrCreate(['name' => $pData['name']], $pData);
            $allPermIds[] = $p->id;
        }

        // Attach to super_admin and project_manager
        Role::whereIn('name', ['super_admin', 'project_manager'])->each(function ($role) use ($allPermIds) {
            $role->permissions()->syncWithoutDetaching($allPermIds);
        });

        // Attach to supervisor_hauling
        $spvRole = Role::where('name', 'supervisor_hauling')->first();
        if ($spvRole) {
            $spvRole->permissions()->syncWithoutDetaching($allPermIds);
        }

        // Attach mechanic & dispatcher
        $mechRole = Role::where('name', 'mechanic')->first();
        if ($mechRole) {
            $mPerms = Permission::whereIn('name', ['manage_fleet_registry', 'manage_p2h', 'manage_work_orders', 'view_fleet_kpi'])->pluck('id');
            $mechRole->permissions()->syncWithoutDetaching($mPerms);
        }

        // 2. Base Data
        $site = Site::first();
        $shift1 = Shift::where('name', 'like', '%Shift 1%')->first() ?? Shift::first();
        $adminUser = User::where('email', 'admin@tap-mining.com')->first() ?? User::first();
        $spvUser = User::where('email', 'spv.hauling@tap-mining.com')->first() ?? $adminUser;
        $mechanicEmp = Employee::where('position_id', function ($q) {
            $q->select('id')->from('positions')->where('code', 'POS-PLANT-LEAD')->limit(1);
        })->first() ?? Employee::first();

        $units = Unit::all();
        $drivers = Driver::with('employee')->where('is_active', true)->get();

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Standard 15 P2H Checklist items template
        $checklistTemplate = [
            ['name' => 'engine', 'category' => 'engine', 'is_critical' => true, 'label' => 'Engine & Ruang Mesin'],
            ['name' => 'oil', 'category' => 'fluids', 'is_critical' => true, 'label' => 'Level Oli Mesin & Kebocoran'],
            ['name' => 'coolant', 'category' => 'fluids', 'is_critical' => false, 'label' => 'Air Radiator / Coolant'],
            ['name' => 'brake', 'category' => 'controls', 'is_critical' => true, 'label' => 'Rem Servis & Rem Parkir (Brake System)'],
            ['name' => 'steering', 'category' => 'controls', 'is_critical' => true, 'label' => 'Sistem Kemudi (Steering Linkage)'],
            ['name' => 'tire', 'category' => 'controls', 'is_critical' => true, 'label' => 'Kondisi Ban & Tekanan Angin (Tire)'],
            ['name' => 'wheel_nut', 'category' => 'controls', 'is_critical' => true, 'label' => 'Baut Roda / Wheel Nut Kencang'],
            ['name' => 'lamp', 'category' => 'electrical', 'is_critical' => false, 'label' => 'Lampu Kerja, Headlamp, Sein, Rotary'],
            ['name' => 'horn', 'category' => 'electrical', 'is_critical' => false, 'label' => 'Klakson / Horn'],
            ['name' => 'mirror', 'category' => 'cabin', 'is_critical' => false, 'label' => 'Kaca Spion & Kaca Depan'],
            ['name' => 'seat_belt', 'category' => 'safety', 'is_critical' => true, 'label' => 'Sabuk Pengaman (Seat Belt)'],
            ['name' => 'body', 'category' => 'body_structure', 'is_critical' => false, 'label' => 'Vessel Dump, Cabin, Tangga'],
            ['name' => 'hydraulic', 'category' => 'hydraulic', 'is_critical' => true, 'label' => 'Pompa & Silinder Hidrolik Dump'],
            ['name' => 'battery', 'category' => 'electrical', 'is_critical' => false, 'label' => 'Aki / Battery & Terminal'],
            ['name' => 'safety_equipment', 'category' => 'safety', 'is_critical' => true, 'label' => 'APAR, Segitiga Pengaman, P3K'],
        ];

        // 3. Seed P2H Inspections for today
        if ($units->count() > 0 && $drivers->count() > 0) {
            foreach ($units->take(6) as $idx => $unit) {
                $driver = $drivers->get($idx % $drivers->count());
                $inspNum = 'P2H-' . $today->format('Ymd') . '-' . str_pad($idx + 1, 3, '0', STR_PAD_LEFT);

                // Simulation: DT-204 has critical brake failure -> not_rfu -> triggers Work Order
                $hasCritical = ($unit->unit_code === 'DT-204');
                $hasWarning = ($unit->unit_code === 'DT-202');
                $overallCondition = $hasCritical ? 'not_rfu' : ($hasWarning ? 'rfu_with_notes' : 'rfu');

                $p2h = P2hInspection::firstOrCreate(
                    ['inspection_number' => $inspNum],
                    [
                        'unit_id' => $unit->id,
                        'driver_id' => $driver->id,
                        'shift_id' => $shift1->id,
                        'inspection_date' => $today->toDateString(),
                        'inspection_time' => '05:45:00',
                        'current_hm' => $unit->last_hm,
                        'current_km' => $unit->last_km,
                        'overall_condition' => $overallCondition,
                        'has_critical_defect' => $hasCritical,
                        'driver_notes' => $hasCritical
                            ? 'Tekanan rem angin drop di bawah 5 bar. Pedal rem ambles saat diinjak di workshop KM 05.'
                            : ($hasWarning ? 'Kaca spion sebelah kiri retak minor namun visibilitas masih cukup.' : 'Unit siap operasi, seluruh item normal.'),
                        'driver_signature_hash' => hash('sha256', $driver->driver_code . $today->toDateString()),
                        'is_acknowledged' => true,
                        'supervisor_id' => $mechanicEmp?->id,
                        'supervisor_notes' => $hasCritical ? 'Unit ditahan di Workshop KM 05. Tidak diizinkan keluar hauling!' : 'P2H diverifikasi.',
                        'created_by' => $spvUser->id,
                    ]
                );

                // Seed Checklist Items
                foreach ($checklistTemplate as $tmpl) {
                    $itemStatus = 'good';
                    $defect = null;

                    if ($hasCritical && $tmpl['name'] === 'brake') {
                        $itemStatus = 'not_good';
                        $defect = 'Brake chamber bocor angin, tekanan drop di bawah batas aman.';
                    } elseif ($hasWarning && $tmpl['name'] === 'mirror') {
                        $itemStatus = 'not_good';
                        $defect = 'Kaca spion kiri retak rambut.';
                    }

                    P2hItem::firstOrCreate(
                        [
                            'p2h_inspection_id' => $p2h->id,
                            'item_name' => $tmpl['name'],
                        ],
                        [
                            'category' => $tmpl['category'],
                            'is_critical' => $tmpl['is_critical'],
                            'status' => $itemStatus,
                            'defect_description' => $defect,
                        ]
                    );
                }

                // If critical defect, update Unit status to breakdown and create Work Order
                if ($hasCritical) {
                    $unit->update(['status' => 'breakdown']);

                    $woNum = 'WO-' . $today->format('Ym') . '-001';
                    WorkOrder::firstOrCreate(
                        ['wo_number' => $woNum],
                        [
                            'unit_id' => $unit->id,
                            'p2h_inspection_id' => $p2h->id,
                            'source' => 'p2h_defect',
                            'priority' => 'critical_emergency',
                            'breakdown_time' => Carbon::now()->subHours(3),
                            'start_repair_time' => Carbon::now()->subHours(2),
                            'downtime_minutes' => 180,
                            'defect_summary' => 'Kerusakan Kritis P2H: Kebocoran udara Brake Chamber belakang kanan. Unit Dilarang Beroperasi (NOT RFU).',
                            'action_taken' => 'Mekanik sedang melakukan penggantian seal kit dan bleeding brake system.',
                            'assigned_mechanic_id' => $mechanicEmp?->id,
                            'status' => 'in_progress',
                            'created_by' => $spvUser->id,
                        ]
                    );
                }
            }
        }

        // 4. Seed HM / KM Logs & Anomaly Detection
        foreach ($units as $idx => $unit) {
            $startHm = $unit->last_hm - 30.0;
            $startKm = $unit->last_km - 450.0;

            for ($day = 3; $day >= 0; $day--) {
                $logDate = $today->copy()->subDays($day);
                $isAnomaly = ($unit->unit_code === 'DT-103' && $day === 1);
                $diffHm = $isAnomaly ? 16.5 : rand(90, 115) / 10.0; // 16.5 hours in 12h shift = Anomaly!
                $diffKm = rand(120, 180);

                UnitHmKmLog::firstOrCreate(
                    [
                        'unit_id' => $unit->id,
                        'log_date' => $logDate->toDateString(),
                        'shift_id' => $shift1->id,
                    ],
                    [
                        'driver_id' => $drivers->first()?->id,
                        'start_hm' => $startHm,
                        'end_hm' => $startHm + $diffHm,
                        'diff_hm' => $diffHm,
                        'start_km' => $startKm,
                        'end_km' => $startKm + $diffKm,
                        'diff_km' => $diffKm,
                        'is_anomaly' => $isAnomaly,
                        'anomaly_reason' => $isAnomaly ? 'Penambahan HM (16.5 Jam) melebihi durasi maksimal 1 shift kerja (12 Jam).' : null,
                        'notes' => 'Catatan operasional ritase normal hauling',
                        'created_by' => $spvUser->id,
                    ]
                );

                $startHm += $diffHm;
                $startKm += $diffKm;
            }
        }

        // 5. Seed Maintenance Service Intervals (PM 250, 500, 1000, 2000)
        $serviceTypes = [
            ['type' => 'PM_250', 'interval' => 250, 'label' => 'Service Berkala PM 250 HM (Engine Oil & Filter)'],
            ['type' => 'PM_500', 'interval' => 500, 'label' => 'Service Berkala PM 500 HM (Fuel Filter & Hydraulic Check)'],
            ['type' => 'PM_1000', 'interval' => 1000, 'label' => 'Service Berkala PM 1000 HM (Transmission & Differential)'],
            ['type' => 'PM_2000', 'interval' => 2000, 'label' => 'Service Berkala PM 2000 HM (General Valve & Hydraulic Flush)'],
        ];

        foreach ($units as $unit) {
            $curHm = (float) $unit->last_hm;

            foreach ($serviceTypes as $st) {
                $lastServiceHm = floor($curHm / $st['interval']) * $st['interval'];
                $nextServiceHm = $lastServiceHm + $st['interval'];
                $remainingHm = $nextServiceHm - $curHm;

                $status = 'normal';
                if ($remainingHm <= 0) {
                    $status = 'overdue';
                } elseif ($remainingHm <= 40) {
                    $status = 'due_soon';
                }

                MaintenanceServiceInterval::updateOrCreate(
                    [
                        'unit_id' => $unit->id,
                        'service_type' => $st['type'],
                    ],
                    [
                        'interval_hm' => $st['interval'],
                        'last_service_hm' => $lastServiceHm,
                        'last_service_date' => $today->copy()->subDays(rand(10, 30))->toDateString(),
                        'next_service_hm' => $nextServiceHm,
                        'remaining_hm' => $remainingHm,
                        'status' => $status,
                        'notes' => $st['label'],
                    ]
                );
            }
        }

        // 6. Seed Fleet Daily KPIs for Site & Units (Past 7 days)
        for ($i = 6; $i >= 0; $i--) {
            $kpiDate = $today->copy()->subDays($i);

            // Aggregate for Site
            $calendarHours = 24.00 * $units->count(); // Total Hours for all fleet
            $downtimeHours = ($i === 0) ? 14.5 : rand(6, 18);
            $operatingHours = rand(150, 180);
            $standbyHours = max(0, $calendarHours - $operatingHours - $downtimeHours);
            $breakdownCount = ($i === 0) ? 1 : rand(0, 2);

            // Explicit formulas:
            // PA = (OH + SB) / TH * 100%
            $pa = $calendarHours > 0 ? round((($operatingHours + $standbyHours) / $calendarHours) * 100, 2) : 100.0;
            // MA = OH / (OH + DT) * 100%
            $ma = ($operatingHours + $downtimeHours) > 0 ? round(($operatingHours / ($operatingHours + $downtimeHours)) * 100, 2) : 100.0;
            // UA = OH / (OH + SB) * 100%
            $ua = ($operatingHours + $standbyHours) > 0 ? round(($operatingHours / ($operatingHours + $standbyHours)) * 100, 2) : 0.0;
            $mttr = $breakdownCount > 0 ? round($downtimeHours / $breakdownCount, 2) : 0.0;
            $mtbf = $breakdownCount > 0 ? round($operatingHours / $breakdownCount, 2) : $operatingHours;

            FleetDailyKpi::updateOrCreate(
                [
                    'site_id' => $site->id,
                    'unit_id' => null, // site aggregate
                    'date' => $kpiDate->toDateString(),
                ],
                [
                    'calendar_hours' => $calendarHours,
                    'operating_hours' => $operatingHours,
                    'standby_hours' => $standbyHours,
                    'downtime_hours' => $downtimeHours,
                    'breakdown_count' => $breakdownCount,
                    'physical_availability_pa' => $pa,
                    'mechanical_availability_ma' => $ma,
                    'utilization_ua' => $ua,
                    'mttr_hours' => $mttr,
                    'mtbf_hours' => $mtbf,
                ]
            );
        }
    }
}
