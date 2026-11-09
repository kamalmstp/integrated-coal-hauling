<?php

namespace App\Console\Commands;

use Database\Seeders\TapRbacSeeder;
use Illuminate\Console\Command;

class BootstrapRbacCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tap:bootstrap-rbac';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Bootstrap and synchronize all 15 TAP Standard Roles, Granular Permissions, and Accounts';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting TAP RBAC synchronization...');

        $seeder = new TapRbacSeeder();
        $seeder->setCommand($this);
        $seeder->run();

        $this->info('TAP RBAC & Standard Roles bootstrapped successfully!');

        return Command::SUCCESS;
    }
}
