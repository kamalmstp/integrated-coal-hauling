<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            TapMasterDataSeeder::class,
            TapProductionDataSeeder::class,
            TapFleetDataSeeder::class,
            TapMaintenanceDataSeeder::class,
            TapWarehouseInventorySeeder::class,
            TapProcurementManagementSeeder::class,
            TapFuelManagementSeeder::class,
            TapHrEmployeeManagementSeeder::class,
            TapRbacSeeder::class,
        ]);
    }
}
