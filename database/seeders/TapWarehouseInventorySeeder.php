<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\InventoryBalance;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockTransfer;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use App\Models\WorkOrder;
use App\Services\InventoryService;
use Illuminate\Database\Seeder;

class TapWarehouseInventorySeeder extends Seeder
{
    public function run(): void
    {
        $inventoryService = app(InventoryService::class);

        // 1. Seed 10 Required Categories
        $categoriesData = [
            ['code' => 'sparepart', 'name' => 'Sparepart', 'description' => 'Suku cadang umum kendaraan dump truck dan sarana pendukung'],
            ['code' => 'tire_tyre', 'name' => 'Tire & Tyre', 'description' => 'Ban luar, ban dalam, flap, dan rim assembly dump truck'],
            ['code' => 'lubricant', 'name' => 'Lubricant', 'description' => 'Oli mesin, oli transmisi, oli gardan, oli hidrolik, dan grease'],
            ['code' => 'filter', 'name' => 'Filter', 'description' => 'Filter oli, filter solar, water separator, dan filter udara'],
            ['code' => 'electrical', 'name' => 'Electrical', 'description' => 'Aki/battery, alternator, starter, lampu kerja, sensor, dan wiring'],
            ['code' => 'engine_parts', 'name' => 'Engine Parts', 'description' => 'Komponen mesin utama, turbocharger, injector, piston, dan liner'],
            ['code' => 'hydraulic_parts', 'name' => 'Hydraulic Parts', 'description' => 'Pompa hidrolik, hoist cylinder, seal kit, dan hose tekanan tinggi'],
            ['code' => 'consumables', 'name' => 'Consumables', 'description' => 'Barang habis pakai workshop: kawat las, majun, cairan pembersih, baut'],
            ['code' => 'tools', 'name' => 'Tools', 'description' => 'Perkakas kerja mekanik, kunci torsi, impact wrench, dan alat ukur'],
            ['code' => 'general_supplies', 'name' => 'General Supplies', 'description' => 'Perlengkapan operasional umum, APD/PPE, rambu keselamatan, dan perlengkapan site'],
        ];

        $categoryMap = [];
        foreach ($categoriesData as $cat) {
            $categoryMap[$cat['code']] = InventoryCategory::updateOrCreate(
                ['code' => $cat['code']],
                $cat
            );
        }

        $sites = Site::orderBy('id')->get();
        if ($sites->isEmpty()) {
            return;
        }

        $site1 = $sites->first();
        $site2 = $sites->skip(1)->first() ?? $site1;

        $employees = Employee::orderBy('id')->get();
        $storeman1 = $employees->first();
        $storeman2 = $employees->skip(1)->first() ?? $storeman1;
        $adminUser = User::first();
        $vendor = Vendor::first();
        $unit1 = Unit::where('site_id', $site1->id)->first() ?? Unit::first();
        $workOrder1 = WorkOrder::where('site_id', $site1->id)->first() ?? WorkOrder::first();

        // 2. Seed Multiple Warehouses per Site
        $warehousesData = [
            [
                'site_id' => $site1->id,
                'code' => 'WH-MCM-MAIN',
                'name' => 'Gudang Utama Sparepart MCM',
                'warehouse_type' => 'main_warehouse',
                'location_address' => 'Kompleks Workshop Utama Site MCM Blok A1',
                'storeman_id' => $storeman1?->id,
                'capacity' => '5.000 SKU / 1.200 m2',
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'code' => 'WH-MCM-TIRE',
                'name' => 'Tire & Rim Yard MCM',
                'warehouse_type' => 'tire_yard',
                'location_address' => 'Area Tire Shop Workshop MCM Blok B2',
                'storeman_id' => $storeman1?->id,
                'capacity' => '600 Ban DT / 800 m2',
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'code' => 'WH-MCM-LUBE',
                'name' => 'Lubricant & Fuel Trap Storage MCM',
                'warehouse_type' => 'lubricant_storage',
                'location_address' => 'Zona Lube Bay MCM Blok C1',
                'storeman_id' => $storeman1?->id,
                'capacity' => '250 Drum / 40.000 Liter',
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'site_id' => $site2->id,
                'code' => 'WH-AGM-MAIN',
                'name' => 'Gudang Utama Sparepart AGM',
                'warehouse_type' => 'main_warehouse',
                'location_address' => 'Area Workshop Hauling Road KM 18 Site AGM',
                'storeman_id' => $storeman2?->id,
                'capacity' => '3.500 SKU / 900 m2',
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'site_id' => $site2->id,
                'code' => 'WH-AGM-SAT',
                'name' => 'Satellite Store Pit Stop KM 32 AGM',
                'warehouse_type' => 'satellite_store',
                'location_address' => 'Pit Stop Check Point KM 32 Site AGM',
                'storeman_id' => $storeman2?->id,
                'capacity' => '500 Fast-Moving SKU',
                'status' => 'active',
                'is_active' => true,
            ],
        ];

        $warehouseMap = [];
        foreach ($warehousesData as $wh) {
            $warehouseMap[$wh['code']] = Warehouse::updateOrCreate(
                ['code' => $wh['code']],
                $wh
            );
        }

        $whMcmMain = $warehouseMap['WH-MCM-MAIN'];
        $whMcmTire = $warehouseMap['WH-MCM-TIRE'];
        $whMcmLube = $warehouseMap['WH-MCM-LUBE'];
        $whAgmMain = $warehouseMap['WH-AGM-MAIN'];

        // 3. Seed Rack / Bin Locations
        $locationsData = [
            ['site_id' => $site1->id, 'warehouse_id' => $whMcmMain->id, 'location_code' => 'RACK-A01-B01', 'zone_name' => 'Zone A - Fast Moving Filter', 'rack_number' => 'RACK-A01', 'shelf_level' => 'L1', 'bin_code' => 'B01', 'capacity' => '200 PCS'],
            ['site_id' => $site1->id, 'warehouse_id' => $whMcmMain->id, 'location_code' => 'RACK-B02-B04', 'zone_name' => 'Zone B - Brake & Undercarriage', 'rack_number' => 'RACK-B02', 'shelf_level' => 'L2', 'bin_code' => 'B04', 'capacity' => '80 SET'],
            ['site_id' => $site1->id, 'warehouse_id' => $whMcmMain->id, 'location_code' => 'RACK-C01-B02', 'zone_name' => 'Zone C - Engine & Electrical', 'rack_number' => 'RACK-C01', 'shelf_level' => 'L1', 'bin_code' => 'B02', 'capacity' => '50 PCS'],
            ['site_id' => $site1->id, 'warehouse_id' => $whMcmMain->id, 'location_code' => 'RACK-D01-B01', 'zone_name' => 'Zone D - Hydraulic & Tools', 'rack_number' => 'RACK-D01', 'shelf_level' => 'L1', 'bin_code' => 'B01', 'capacity' => '100 PCS'],
            ['site_id' => $site1->id, 'warehouse_id' => $whMcmTire->id, 'location_code' => 'BAY-TIRE-01', 'zone_name' => 'Tire Bay Radial 11.00R20', 'rack_number' => 'BAY-01', 'shelf_level' => 'FLOOR', 'bin_code' => 'T01', 'capacity' => '120 PCS'],
            ['site_id' => $site1->id, 'warehouse_id' => $whMcmLube->id, 'location_code' => 'PALLET-LUBE-01', 'zone_name' => 'Bunded Pallet Engine Oil', 'rack_number' => 'PAL-01', 'shelf_level' => 'FLOOR', 'bin_code' => 'L01', 'capacity' => '40 DRUM'],
            ['site_id' => $site2->id, 'warehouse_id' => $whAgmMain->id, 'location_code' => 'AGM-RACK-A01', 'zone_name' => 'Zone A - General Sparepart AGM', 'rack_number' => 'RACK-A01', 'shelf_level' => 'L1', 'bin_code' => 'B01', 'capacity' => '150 PCS'],
        ];

        $locationMap = [];
        foreach ($locationsData as $loc) {
            $locationMap[$loc['location_code']] = WarehouseLocation::updateOrCreate(
                ['warehouse_id' => $loc['warehouse_id'], 'location_code' => $loc['location_code']],
                $loc
            );
        }

        // 4. Seed Item Master across all 10 Categories
        $itemsData = [
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-FLT-001',
                'part_number' => 'LF9009-FLG',
                'barcode' => '899000100001',
                'item_name' => 'Oil Filter Fleetguard LF9009 (Cummins/Dongfeng/Hino)',
                'category_id' => $categoryMap['filter']->id,
                'category_code' => 'filter',
                'brand' => 'Fleetguard',
                'specification' => 'Spin-on Full Flow/By-Pass Lube Filter Height 301mm OD 118mm',
                'unit_of_measurement' => 'PCS',
                'minimum_stock' => 20,
                'reorder_point' => 35,
                'maximum_stock' => 120,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-A01-B01']->id,
                'standard_cost' => 425000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-FLT-002',
                'part_number' => 'FS19765-FLG',
                'barcode' => '899000100002',
                'item_name' => 'Fuel Water Separator Filter FS19765',
                'category_id' => $categoryMap['filter']->id,
                'category_code' => 'filter',
                'brand' => 'Fleetguard',
                'specification' => 'Elemen Filter Solar Hauling Heavy Duty 10 Micron',
                'unit_of_measurement' => 'PCS',
                'minimum_stock' => 15,
                'reorder_point' => 25,
                'maximum_stock' => 100,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-A01-B01']->id,
                'standard_cost' => 380000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-SPR-001',
                'part_number' => '4707-SC-BRK',
                'barcode' => '899000100003',
                'item_name' => 'Brake Lining Kit Heavy Duty Rear Axle DT 30T',
                'category_id' => $categoryMap['sparepart']->id,
                'category_code' => 'sparepart',
                'brand' => 'Scania OEM / Bendix',
                'specification' => 'Kampas Rem Belakang Dump Truck Set (8 Pcs + Rivet)',
                'unit_of_measurement' => 'SET',
                'minimum_stock' => 10,
                'reorder_point' => 16,
                'maximum_stock' => 50,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-B02-B04']->id,
                'standard_cost' => 1850000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-TIR-001',
                'part_number' => 'BS-1100R20-M840',
                'barcode' => '899000100004',
                'item_name' => 'Tire Bridgestone 11.00 R20 M840 16PR (Set Ban + Flap)',
                'category_id' => $categoryMap['tire_tyre']->id,
                'category_code' => 'tire_tyre',
                'brand' => 'Bridgestone',
                'specification' => 'Radial On/Off Road Coal Hauling Dump Truck Tire 11.00R20',
                'unit_of_measurement' => 'PCS',
                'minimum_stock' => 12,
                'reorder_point' => 24,
                'maximum_stock' => 80,
                'default_warehouse_id' => $whMcmTire->id,
                'default_location_id' => $locationMap['BAY-TIRE-01']->id,
                'standard_cost' => 6450000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-LUB-001',
                'part_number' => 'SHL-RIMULA-R4X',
                'barcode' => '899000100005',
                'item_name' => 'Engine Oil Shell Rimula R4X 15W-40 CI-4',
                'category_id' => $categoryMap['lubricant']->id,
                'category_code' => 'lubricant',
                'brand' => 'Shell',
                'specification' => 'Oli Mesin Diesel Heavy Duty Turbocharged (Satuan Liter)',
                'unit_of_measurement' => 'LTR',
                'minimum_stock' => 400,
                'reorder_point' => 800,
                'maximum_stock' => 3000,
                'default_warehouse_id' => $whMcmLube->id,
                'default_location_id' => $locationMap['PALLET-LUBE-01']->id,
                'standard_cost' => 58000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-ELC-001',
                'part_number' => 'YUA-N200-HD',
                'barcode' => '899000100006',
                'item_name' => 'Battery Yuasa N200 Heavy Duty 12V 200Ah',
                'category_id' => $categoryMap['electrical']->id,
                'category_code' => 'electrical',
                'brand' => 'Yuasa',
                'specification' => 'Aki Dump Truck 12V 200Ah Conventional Heavy Duty',
                'unit_of_measurement' => 'PCS',
                'minimum_stock' => 6,
                'reorder_point' => 10,
                'maximum_stock' => 30,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-C01-B02']->id,
                'standard_cost' => 3450000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-ENG-001',
                'part_number' => 'HOL-HX55W-TRB',
                'barcode' => '899000100007',
                'item_name' => 'Turbocharger Assembly Holset HX55W',
                'category_id' => $categoryMap['engine_parts']->id,
                'category_code' => 'engine_parts',
                'brand' => 'Holset / Cummins',
                'specification' => 'Turbocharger Complete Assembly DT 340-400 HP',
                'unit_of_measurement' => 'UNIT',
                'minimum_stock' => 2,
                'reorder_point' => 4,
                'maximum_stock' => 8,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-C01-B02']->id,
                'standard_cost' => 14800000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-HYD-001',
                'part_number' => 'HYVA-SEAL-FE169',
                'barcode' => '899000100008',
                'item_name' => 'Hoist Cylinder Seal Kit Hyva FE 169-5',
                'category_id' => $categoryMap['hydraulic_parts']->id,
                'category_code' => 'hydraulic_parts',
                'brand' => 'Hyva',
                'specification' => 'Seal Kit Telescopic Dump Cylinder 5 Stage',
                'unit_of_measurement' => 'SET',
                'minimum_stock' => 4,
                'reorder_point' => 8,
                'maximum_stock' => 20,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-D01-B01']->id,
                'standard_cost' => 2950000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-CNS-001',
                'part_number' => 'KOB-LB52U-32',
                'barcode' => '899000100009',
                'item_name' => 'Welding Electrode Kobelco LB-52U 3.2mm (Box 20Kg)',
                'category_id' => $categoryMap['consumables']->id,
                'category_code' => 'consumables',
                'brand' => 'Kobelco',
                'specification' => 'Kawat Las High Tensile untuk Perbaikan Vessel Dump Truck',
                'unit_of_measurement' => 'BOX',
                'minimum_stock' => 5,
                'reorder_point' => 10,
                'maximum_stock' => 25,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-D01-B01']->id,
                'standard_cost' => 920000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-TLS-001',
                'part_number' => 'TEK-TRQ-34-800',
                'barcode' => '899000100010',
                'item_name' => 'Heavy Duty Torque Wrench 3/4" Drive 200-800 Nm',
                'category_id' => $categoryMap['tools']->id,
                'category_code' => 'tools',
                'brand' => 'Tekiro Industrial',
                'specification' => 'Kunci Torsi Wheel Nut Dump Truck 3/4 Inch',
                'unit_of_measurement' => 'PCS',
                'minimum_stock' => 2,
                'reorder_point' => 3,
                'maximum_stock' => 10,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-D01-B01']->id,
                'standard_cost' => 4200000,
                'is_active' => true,
            ],
            [
                'site_id' => $site1->id,
                'item_code' => 'ITM-GEN-001',
                'part_number' => 'APD-GLV-IMP01',
                'barcode' => '899000100011',
                'item_name' => 'Heavy Duty Mechanic Impact Safety Gloves',
                'category_id' => $categoryMap['general_supplies']->id,
                'category_code' => 'general_supplies',
                'brand' => 'Ansell Ringers',
                'specification' => 'Sarung Tangan Safety Mekanik Anti-Benturan & Oli',
                'unit_of_measurement' => 'PAIR',
                'minimum_stock' => 20,
                'reorder_point' => 40,
                'maximum_stock' => 100,
                'default_warehouse_id' => $whMcmMain->id,
                'default_location_id' => $locationMap['RACK-D01-B01']->id,
                'standard_cost' => 285000,
                'is_active' => true,
            ],
        ];

        $itemMap = [];
        foreach ($itemsData as $itemData) {
            $itemMap[$itemData['item_code']] = InventoryItem::updateOrCreate(
                ['item_code' => $itemData['item_code']],
                $itemData
            );
        }

        // Only seed initial transactions if none exist yet
        if (\App\Models\InventoryTransaction::count() === 0) {
            // 5. Opening Balance & Purchase Receiving (Stock In)
            $inventoryService->stockIn([
                'document_number' => 'OB-MCM-20261101-001',
                'transaction_date' => now()->subDays(15)->toDateString(),
                'transaction_datetime' => now()->subDays(15),
                'transaction_type' => 'opening_balance',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'reference_document' => 'OPENING-2026-MCM',
                'requester_id' => $storeman1?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman1?->id,
                'remarks' => 'Saldo awal persediaan Gudang Utama MCM',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-FLT-001']->id, 'quantity' => 50, 'unit_cost' => 420000],
                ['inventory_item_id' => $itemMap['ITM-FLT-002']->id, 'quantity' => 22, 'unit_cost' => 380000], // Low Stock (min 15, reorder 25)
                ['inventory_item_id' => $itemMap['ITM-SPR-001']->id, 'quantity' => 14, 'unit_cost' => 1850000],
                ['inventory_item_id' => $itemMap['ITM-ELC-001']->id, 'quantity' => 5, 'unit_cost' => 3450000], // Critical Stock (<= min 6)
                ['inventory_item_id' => $itemMap['ITM-HYD-001']->id, 'quantity' => 12, 'unit_cost' => 2950000],
                ['inventory_item_id' => $itemMap['ITM-CNS-001']->id, 'quantity' => 30, 'unit_cost' => 920000], // Excess Stock (> max 25)
                ['inventory_item_id' => $itemMap['ITM-TLS-001']->id, 'quantity' => 6, 'unit_cost' => 4200000],
                ['inventory_item_id' => $itemMap['ITM-GEN-001']->id, 'quantity' => 65, 'unit_cost' => 285000],
            ]);

            // Second Purchase Receiving to demonstrate Moving Weighted Average (MWA) on ITM-FLT-001
            $inventoryService->stockIn([
                'document_number' => 'GRN-MCM-20261103-002',
                'transaction_date' => now()->subDays(10)->toDateString(),
                'transaction_datetime' => now()->subDays(10),
                'transaction_type' => 'purchase_receiving',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'vendor_id' => $vendor?->id,
                'reference_document' => 'PO-TAP-2026-089',
                'requester_id' => $storeman1?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman1?->id,
                'remarks' => 'Penerimaan pembelian Filter & Kampas Rem dari PO-TAP-2026-089',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-FLT-001']->id, 'quantity' => 30, 'unit_cost' => 450000],
                ['inventory_item_id' => $itemMap['ITM-SPR-001']->id, 'quantity' => 6, 'unit_cost' => 1900000],
            ]);

            // Tire Warehouse Opening Balance
            $inventoryService->stockIn([
                'document_number' => 'OB-TIRE-20261101-001',
                'transaction_date' => now()->subDays(14)->toDateString(),
                'transaction_datetime' => now()->subDays(14),
                'transaction_type' => 'opening_balance',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmTire->id,
                'reference_document' => 'OPENING-TIRE-2026',
                'requester_id' => $storeman1?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman1?->id,
                'remarks' => 'Saldo awal ban Bridgestone 11.00R20 di Tire Yard MCM',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-TIR-001']->id, 'quantity' => 22, 'unit_cost' => 6450000],
            ]);

            // Lubricant Warehouse Opening Balance
            $inventoryService->stockIn([
                'document_number' => 'OB-LUBE-20261101-001',
                'transaction_date' => now()->subDays(14)->toDateString(),
                'transaction_datetime' => now()->subDays(14),
                'transaction_type' => 'opening_balance',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmLube->id,
                'reference_document' => 'OPENING-LUBE-2026',
                'requester_id' => $storeman1?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman1?->id,
                'remarks' => 'Saldo awal oli mesin Shell Rimula R4X di Lube Storage MCM',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-LUB-001']->id, 'quantity' => 1200, 'unit_cost' => 58000],
            ]);

            // Site 2 (AGM) Opening Balance
            $inventoryService->stockIn([
                'document_number' => 'OB-AGM-20261101-001',
                'transaction_date' => now()->subDays(12)->toDateString(),
                'transaction_datetime' => now()->subDays(12),
                'transaction_type' => 'opening_balance',
                'site_id' => $site2->id,
                'warehouse_id' => $whAgmMain->id,
                'reference_document' => 'OPENING-AGM-2026',
                'requester_id' => $storeman2?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman2?->id,
                'remarks' => 'Saldo awal Gudang Utama Site AGM',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-FLT-001']->id, 'quantity' => 28, 'unit_cost' => 430000],
                ['inventory_item_id' => $itemMap['ITM-SPR-001']->id, 'quantity' => 8, 'unit_cost' => 1875000],
            ]);

            // 6. Stock Out (Maintenance Issue & Operational Issue)
            $inventoryService->stockOut([
                'document_number' => 'GIN-MCM-20261105-001',
                'transaction_date' => now()->subDays(5)->toDateString(),
                'transaction_datetime' => now()->subDays(5),
                'transaction_type' => 'maintenance_issue',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'unit_id' => $unit1?->id,
                'work_order_id' => $workOrder1?->id,
                'reference_type' => 'work_order',
                'reference_id' => $workOrder1?->id,
                'reference_document' => $workOrder1?->wo_number ?? 'WO-TAP-2026-001',
                'requester_id' => $storeman1?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman1?->id,
                'remarks' => 'Pengeluaran filter dan kampas rem untuk servis berkala & perbaikan rem DT',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-FLT-001']->id, 'quantity' => 6],
                ['inventory_item_id' => $itemMap['ITM-SPR-001']->id, 'quantity' => 8],
            ]);

            $inventoryService->stockOut([
                'document_number' => 'GIN-TIRE-20261106-001',
                'transaction_date' => now()->subDays(3)->toDateString(),
                'transaction_datetime' => now()->subDays(3),
                'transaction_type' => 'maintenance_issue',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmTire->id,
                'unit_id' => $unit1?->id,
                'work_order_id' => $workOrder1?->id,
                'reference_type' => 'work_order',
                'reference_id' => $workOrder1?->id,
                'reference_document' => $workOrder1?->wo_number ?? 'WO-TAP-2026-001',
                'requester_id' => $storeman1?->id,
                'approver_id' => $adminUser?->id,
                'storeman_id' => $storeman1?->id,
                'remarks' => 'Penggantian 4 ban belakang DT Bridgestone 11.00R20',
                'created_by' => $adminUser?->id,
            ], [
                ['inventory_item_id' => $itemMap['ITM-TIR-001']->id, 'quantity' => 4],
            ]);

            // Backdate movement dates on 2 balances to showcase Slow Moving (45 days) and Non-Moving (110 days) reports
            InventoryBalance::where('warehouse_id', $whMcmMain->id)
                ->where('inventory_item_id', $itemMap['ITM-HYD-001']->id)
                ->update([
                    'last_in_date' => now()->subDays(50),
                    'last_out_date' => now()->subDays(45),
                    'last_movement_date' => now()->subDays(45),
                ]);

            InventoryBalance::where('warehouse_id', $whMcmMain->id)
                ->where('inventory_item_id', $itemMap['ITM-TLS-001']->id)
                ->update([
                    'last_in_date' => now()->subDays(115),
                    'last_out_date' => null,
                    'last_movement_date' => now()->subDays(115),
                ]);

            // 7. Inter-Warehouse Stock Transfer (Completed & In-Transit)
            $transfer1 = StockTransfer::create([
                'transfer_number' => 'TRF-TAP-20261106-001',
                'transfer_date' => now()->subDays(2)->toDateString(),
                'from_site_id' => $site1->id,
                'from_warehouse_id' => $whMcmMain->id,
                'to_site_id' => $site2->id,
                'to_warehouse_id' => $whAgmMain->id,
                'requester_id' => $storeman2?->id,
                'approved_by' => $adminUser?->id,
                'approved_at' => now()->subDays(2),
                'status' => 'approved',
                'remarks' => 'Transfer darurat Filter Oli LF9009 dari Gudang MCM ke Gudang AGM',
                'created_by' => $adminUser?->id,
            ]);

            $transfer1->items()->create([
                'inventory_item_id' => $itemMap['ITM-FLT-001']->id,
                'qty_requested' => 4,
                'qty_dispatched' => 4,
                'unit' => 'PCS',
            ]);

            $inventoryService->dispatchTransfer($transfer1, $storeman1?->id);
            $inventoryService->receiveTransfer($transfer1->fresh(), $storeman2?->id);

            // 8. Stock Opname & Stock Adjustment
            $opname = StockOpname::create([
                'opname_number' => 'OPN-MCM-20261107-001',
                'site_id' => $site1->id,
                'warehouse_id' => $whMcmMain->id,
                'scheduled_date' => now()->subDay()->toDateString(),
                'conducted_date' => now()->subDay()->toDateString(),
                'status' => 'under_investigation',
                'storeman_id' => $storeman1?->id,
                'auditor_id' => $storeman2?->id,
                'investigation_notes' => 'Ditemukan selisih -2 PAIR sarung tangan safety akibat belum tercatat saat pengambilan darurat shift malam.',
                'remarks' => 'Stock Opname Siklus Bulanan Gudang Utama MCM',
                'created_by' => $adminUser?->id,
            ]);

            $balFlt = InventoryBalance::where('warehouse_id', $whMcmMain->id)->where('inventory_item_id', $itemMap['ITM-FLT-001']->id)->first();
            $balGlv = InventoryBalance::where('warehouse_id', $whMcmMain->id)->where('inventory_item_id', $itemMap['ITM-GEN-001']->id)->first();

            if ($balFlt) {
                $opname->items()->create([
                    'inventory_item_id' => $itemMap['ITM-FLT-001']->id,
                    'warehouse_location_id' => $balFlt->warehouse_location_id,
                    'system_qty' => $balFlt->on_hand_qty,
                    'physical_qty' => $balFlt->on_hand_qty,
                    'variance_qty' => 0,
                    'unit_cost' => $balFlt->average_unit_cost,
                    'variance_value' => 0,
                    'status' => 'matched',
                    'investigation_reason' => 'Sesuai fisik dan kartu stok',
                ]);
            }

            if ($balGlv) {
                $physQty = (float) $balGlv->on_hand_qty - 2;
                $varQty = -2;
                $opname->items()->create([
                    'inventory_item_id' => $itemMap['ITM-GEN-001']->id,
                    'warehouse_location_id' => $balGlv->warehouse_location_id,
                    'system_qty' => $balGlv->on_hand_qty,
                    'physical_qty' => $physQty,
                    'variance_qty' => $varQty,
                    'unit_cost' => $balGlv->average_unit_cost,
                    'variance_value' => $varQty * (float) $balGlv->average_unit_cost,
                    'status' => 'discrepancy',
                    'investigation_reason' => 'Selisih 2 pasang sarung tangan sedang diajukan Stock Adjustment untuk approval kepala gudang',
                ]);

                // Create a Pending Stock Adjustment linked to this opname
                $adj = StockAdjustment::create([
                    'adjustment_number' => 'ADJ-MCM-20261107-001',
                    'site_id' => $site1->id,
                    'warehouse_id' => $whMcmMain->id,
                    'stock_opname_id' => $opname->id,
                    'adjustment_date' => now()->toDateString(),
                    'reason_category' => 'opname_variance',
                    'status' => 'pending_approval',
                    'requested_by' => $storeman1?->id,
                    'remarks' => 'Usulan penyesuaian hasil Stock Opname OPN-MCM-20261107-001 (Menunggu Approval)',
                    'created_by' => $adminUser?->id,
                ]);

                $adj->items()->create([
                    'inventory_item_id' => $itemMap['ITM-GEN-001']->id,
                    'direction' => 'OUT',
                    'system_qty' => $balGlv->on_hand_qty,
                    'physical_qty' => $physQty,
                    'adjustment_qty' => 2,
                    'unit_cost' => $balGlv->average_unit_cost,
                    'total_value_impact' => 2 * (float) $balGlv->average_unit_cost,
                    'notes' => 'Penyesuaian selisih kurang 2 PAIR Safety Gloves',
                ]);
            }

            // 9. Link existing Phase 4 SparepartRequests to InventoryItem & Warehouse
            $existingRequests = SparepartRequest::with('items')->get();
            foreach ($existingRequests as $spReq) {
                $spReq->update([
                    'warehouse_id' => $whMcmMain->id,
                    'storeman_id' => $storeman1?->id,
                ]);
                foreach ($spReq->items as $spItem) {
                    $spItem->update([
                        'inventory_item_id' => $itemMap['ITM-FLT-001']->id,
                        'warehouse_id' => $whMcmMain->id,
                    ]);
                }
            }

            // 10. Create a Sample Purchase Request (PR) from Reorder Point Alert
            if (PurchaseRequest::count() === 0) {
                $inventoryService->createReorderPurchaseRequest(
                    $site1->id,
                    $whMcmMain->id,
                    [$itemMap['ITM-ELC-001']->id, $itemMap['ITM-ENG-001']->id, $itemMap['ITM-FLT-002']->id],
                    $storeman1?->id,
                    'Usulan Purchase Request otomatis untuk item Critical & Out of Stock di Gudang Utama MCM'
                );
            }
        }
    }
}
