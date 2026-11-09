<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Employee;
use App\Models\FuelCalibration;
use App\Models\FuelParameter;
use App\Models\FuelReceipt;
use App\Models\FuelReconciliation;
use App\Models\FuelSounding;
use App\Models\FuelSupplier;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\Location;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vendor;
use App\Services\FuelService;
use Illuminate\Database\Seeder;

class TapFuelManagementSeeder extends Seeder
{
    public function run(): void
    {
        if (FuelTank::count() > 0) {
            return;
        }

        $fuelService = app(FuelService::class);
        $user = User::first();
        if ($user) {
            auth()->login($user);
        }

        $sites = Site::where('is_active', true)->orderBy('id')->get();
        if ($sites->isEmpty()) {
            return;
        }

        $siteA = $sites->first();
        $siteB = $sites->skip(1)->first() ?? $siteA;

        // 1. Seed Site Fuel Parameters (0.0475 configurable parameter)
        foreach ($sites as $site) {
            FuelParameter::updateOrCreate(
                ['site_id' => $site->id],
                [
                    'estimation_factor' => 0.047500,
                    'default_haul_distance_km' => 32.00,
                    'standard_fuel_price_per_liter' => 14850.00,
                    'low_stock_threshold_percent' => 20.00,
                    'variance_tolerance_percent' => 0.50,
                    'max_dispense_per_tx_liter' => 450.00,
                    'authorization_notes' => 'Standar Kontrak Hauling TAP: Estimated Fuel = Tonase x Jarak x 0.0475',
                    'updated_by' => $user?->id,
                ]
            );
        }

        // 2. Seed Fuel Suppliers
        $vendor = Vendor::first();
        $supplierPertamina = FuelSupplier::create([
            'supplier_code' => 'FSUP-PTM-01',
            'name' => 'PT Pertamina Patra Niaga (Industrial Fuel Kaltim)',
            'vendor_id' => $vendor?->id,
            'contact_person' => 'Hendra Wijaya',
            'phone' => '0542-778899',
            'email' => 'industrial.kaltim@pertamina.com',
            'address' => 'Depot BBM Industri Balikpapan, Kalimantan Timur',
            'fuel_type' => 'Biosolar B35 Industri',
            'contract_number' => 'KTR-TAP-PTM-2026-01',
            'contract_price_per_liter' => 14850.00,
            'payment_terms' => 'TOP 30 Days',
            'is_active' => true,
        ]);

        $supplierAkr = FuelSupplier::create([
            'supplier_code' => 'FSUP-AKR-02',
            'name' => 'PT AKR Corporindo Tbk (Mining Fuel Division)',
            'contact_person' => 'Rudi Santoso',
            'phone' => '0541-665544',
            'email' => 'mining.fuel@akr.co.id',
            'address' => 'Terminal BBM Palaran, Samarinda',
            'fuel_type' => 'Biosolar B35 Industri',
            'contract_number' => 'KTR-TAP-AKR-2026-02',
            'contract_price_per_liter' => 14900.00,
            'payment_terms' => 'TOP 30 Days',
            'is_active' => true,
        ]);

        // 3. Seed Multiple Fuel Tanks per Site + Validated Calibration Charts
        $fuelLoc = Location::where('site_id', $siteA->id)->first();
        $bowserUnit = Unit::where('site_id', $siteA->id)->where('unit_type', 'like', '%fuel%')->first();

        $tankMainA = FuelTank::create([
            'tank_number' => 'FT-MTH-01',
            'tank_name' => 'Main Storage Tank #1 Fuel Station Muara Teweh',
            'site_id' => $siteA->id,
            'location_id' => $fuelLoc?->id,
            'tank_type' => 'stationary_tank',
            'shape_type' => 'calibrated_chart',
            'capacity_liters' => 50000.00,
            'dead_stock_liters' => 1000.00,
            'minimum_alert_liters' => 10000.00,
            'max_height_cm' => 300.00,
            'length_cm' => 720.00,
            'diameter_cm' => 300.00,
            'opening_stock_liters' => 0,
            'current_stock_liters' => 0,
            'average_cost_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        $tankBowserA = FuelTank::create([
            'tank_number' => 'BOWSER-MTH-01',
            'tank_name' => 'Mobile Fuel Truck Bowser #1 (Pit Service)',
            'site_id' => $siteA->id,
            'location_id' => $fuelLoc?->id,
            'unit_id' => $bowserUnit?->id,
            'tank_type' => 'mobile_bowser',
            'shape_type' => 'calibrated_chart',
            'capacity_liters' => 10000.00,
            'dead_stock_liters' => 250.00,
            'minimum_alert_liters' => 2000.00,
            'max_height_cm' => 180.00,
            'length_cm' => 400.00,
            'diameter_cm' => 180.00,
            'opening_stock_liters' => 0,
            'current_stock_liters' => 0,
            'average_cost_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        $tankMainB = FuelTank::create([
            'tank_number' => 'FT-SITE2-01',
            'tank_name' => 'Main Storage Tank #1 Site Project B',
            'site_id' => $siteB->id,
            'tank_type' => 'stationary_tank',
            'shape_type' => 'calibrated_chart',
            'capacity_liters' => 40000.00,
            'dead_stock_liters' => 800.00,
            'minimum_alert_liters' => 8000.00,
            'max_height_cm' => 250.00,
            'length_cm' => 820.00,
            'diameter_cm' => 250.00,
            'opening_stock_liters' => 0,
            'current_stock_liters' => 0,
            'average_cost_per_liter' => 14850.00,
            'is_active' => true,
        ]);

        // Seed Validated Calibration Charts (Strapping Tables) for all tanks
        $this->seedCalibrationChart($tankMainA, 'CERT-MET-MTH01-2026');
        $this->seedCalibrationChart($tankBowserA, 'CERT-MET-BWS01-2026');
        $this->seedCalibrationChart($tankMainB, 'CERT-MET-ST201-2026');

        $fuelman = Employee::where('site_id', $siteA->id)->first();
        $today = now()->toDateString();

        // 4. Record Opening Stock & Fuel Purchase Receiving into FT-MTH-01
        $fuelService->recordFuelReceipt([
            'receipt_number' => 'FREC-OPEN-MTH01',
            'receipt_type' => 'opening_stock',
            'receipt_date' => $today,
            'site_id' => $siteA->id,
            'received_by' => $fuelman?->id,
            'remarks' => 'Saldo Awal Tangki Utama FT-MTH-01',
        ], [
            [
                'fuel_tank_id' => $tankMainA->id,
                'do_volume_liters' => 25000,
                'received_volume_liters' => 25000,
                'unit_price' => 14850,
            ],
        ]);

        $fuelService->recordFuelReceipt([
            'receipt_number' => 'FREC-PTM-2026-001',
            'receipt_type' => 'fuel_receiving',
            'receipt_date' => $today,
            'site_id' => $siteA->id,
            'fuel_supplier_id' => $supplierPertamina->id,
            'po_number' => 'PO-FUEL-TAP-001',
            'do_number' => 'DO-PTM-88291',
            'invoice_number' => 'INV-PTM-2026-991',
            'invoice_date' => $today,
            'invoice_status' => 'invoiced',
            'transport_vehicle_no' => 'KT 8991 BU',
            'driver_name' => 'Suparman (Transportir BBM)',
            'received_by' => $fuelman?->id,
            'remarks' => 'Pengiriman Solar Industri B35 16.000 Liter dari Pertamina',
        ], [
            [
                'fuel_tank_id' => $tankMainA->id,
                'do_volume_liters' => 16000,
                'received_volume_liters' => 16000,
                'temperature_celsius' => 29.5,
                'density_kg_m3' => 0.8415,
                'flowmeter_start' => 100000,
                'flowmeter_end' => 116000,
                'unit_price' => 14850,
            ],
        ]);

        // 5. Transfer 5,000 L from Main Tank FT-MTH-01 to Mobile Bowser BOWSER-MTH-01
        $fuelService->transferFuel([
            'transaction_number' => 'FTRF-MTH-001',
            'transaction_date' => $today,
            'transaction_time' => '07:15:00',
            'site_id' => $siteA->id,
            'source_tank_id' => $tankMainA->id,
            'destination_tank_id' => $tankBowserA->id,
            'fuelman_id' => $fuelman?->id,
            'liters' => 5000,
            'remarks' => 'Pengisian Bowser Pit Service Pagi Shift 1',
        ]);

        // 6. Dispense Fuel to Dump Truck Units (linked to Production Tickets & HM/KM)
        $units = Unit::where('site_id', $siteA->id)->take(3)->get();
        $driver = Driver::first();
        $shift = Shift::first();
        $prodTicket = DumpingTicket::where('site_id', $siteA->id)->where('status', 'verified')->first();

        foreach ($units as $idx => $unit) {
            $liters = 240 + ($idx * 30);
            $fuelService->dispenseFuel([
                'transaction_number' => 'FTX-DISP-00' . ($idx + 1),
                'digital_ticket_code' => 'DFT-TAP-00' . ($idx + 1),
                'transaction_date' => $today,
                'transaction_time' => '08:' . str_pad((string) (10 + $idx * 12), 2, '0', STR_PAD_LEFT) . ':00',
                'site_id' => $siteA->id,
                'shift_id' => $shift?->id,
                'source_tank_id' => $idx === 2 ? $tankBowserA->id : $tankMainA->id,
                'unit_id' => $unit->id,
                'driver_id' => $driver?->id,
                'fuelman_id' => $fuelman?->id,
                'dumping_ticket_id' => $idx === 0 ? $prodTicket?->id : null,
                'reference_ticket_number' => $idx === 0 ? $prodTicket?->ticket_number : null,
                'current_hm' => (float) $unit->last_hm + 8.5,
                'current_km' => (float) $unit->last_km + 128.0,
                'liters' => $liters,
                'flowmeter_start' => 50000 + ($idx * 300),
                'flowmeter_end' => 50000 + ($idx * 300) + $liters,
                'remarks' => "Pengisian BBM Operasional Hauling Unit {$unit->unit_code}",
            ]);
        }

        // 7. Record Daily Tank Sounding & Daily Reconciliation for Main Tank FT-MTH-01
        $tankMainA->refresh();
        // Find a sounding height near current_stock_liters (~35,490 L -> around 201 cm on 300cm/50,000L chart)
        $sounding = $fuelService->recordTankSounding([
            'sounding_number' => 'SND-MTH01-001',
            'site_id' => $siteA->id,
            'fuel_tank_id' => $tankMainA->id,
            'sounding_date' => $today,
            'sounding_time' => '18:00:00',
            'measurement_cm' => 213.00,
            'water_level_cm' => 0.00,
            'temperature_celsius' => 30.2,
            'remarks' => 'Sounding Penutupan Shift Sore Tangki Utama FT-MTH-01',
        ]);

        $fuelService->generateTankReconciliation([
            'reconciliation_number' => 'FRECON-MTH01-001',
            'site_id' => $siteA->id,
            'fuel_tank_id' => $tankMainA->id,
            'reconciliation_date' => $today,
            'opening_stock_liters' => 25000,
            'fuel_sounding_id' => $sounding->id,
            'investigation_findings' => 'Selisih antara stok buku dan sounding fisik tercatat untuk evaluasi kalibrasi harian.',
        ]);
    }

    protected function seedCalibrationChart(FuelTank $tank, string $certNo): void
    {
        $maxH = (float) $tank->max_height_cm;
        $cap = (float) $tank->capacity_liters;
        $r = $maxH / 2.0;

        // Create 31 strapping points from 0% to 100% height using horizontal cylinder geometry
        $steps = 30;
        $prevH = 0.0;
        $prevV = 0.0;

        for ($i = 0; $i <= $steps; $i++) {
            $h = round(($maxH / $steps) * $i, 2);
            if ($i === 0) {
                $vol = 0.0;
            } elseif ($i === $steps) {
                $vol = $cap;
            } else {
                $theta = 2.0 * acos(($r - $h) / $r);
                $segmentArea = 0.5 * $r * $r * ($theta - sin($theta));
                $fullArea = M_PI * $r * $r;
                $vol = round($cap * ($segmentArea / $fullArea), 2);
            }

            $mmFactor = ($h > $prevH) ? round(($vol - $prevV) / (($h - $prevH) * 10), 4) : 0.0;

            FuelCalibration::updateOrCreate(
                [
                    'fuel_tank_id' => $tank->id,
                    'height_cm' => $h,
                ],
                [
                    'volume_liters' => $vol,
                    'mm_increment_factor' => $mmFactor,
                    'calibration_certificate_no' => $certNo,
                    'calibrated_date' => now()->subMonths(2)->toDateString(),
                ]
            );

            $prevH = $h;
            $prevV = $vol;
        }
    }
}
