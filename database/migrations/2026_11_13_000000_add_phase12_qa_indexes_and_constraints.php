<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dumping_tickets', function (Blueprint $table) {
            $table->index(['site_id', 'ticket_date', 'status', 'is_production'], 'idx_dt_site_date_status_prod');
            $table->index(['site_id', 'unit_id', 'ticket_date'], 'idx_dt_site_unit_date');
            $table->index(['site_id', 'driver_id', 'ticket_date'], 'idx_dt_site_driver_date');
        });

        Schema::table('fuel_transactions', function (Blueprint $table) {
            $table->index(['site_id', 'transaction_type', 'status', 'transaction_date'], 'idx_ftx_site_type_status_date');
            $table->index(['unit_id', 'transaction_date', 'transaction_type'], 'idx_ftx_unit_date_type');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->index(['site_id', 'status', 'rfu_status'], 'idx_wo_site_status_rfu');
            $table->index(['unit_id', 'status', 'rfu_status'], 'idx_wo_unit_status_rfu');
        });

        Schema::table('maintenance_costs', function (Blueprint $table) {
            $table->index(['site_id', 'cost_date', 'cost_type'], 'idx_mc_site_date_type');
            $table->index(['work_order_id', 'cost_type', 'reference_number'], 'idx_mc_wo_type_ref');
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->index(['site_id', 'direction', 'transaction_type', 'transaction_date'], 'idx_itx_site_dir_type_date');
        });
    }

    public function down(): void
    {
        Schema::table('dumping_tickets', function (Blueprint $table) {
            $table->dropIndex('idx_dt_site_date_status_prod');
            $table->dropIndex('idx_dt_site_unit_date');
            $table->dropIndex('idx_dt_site_driver_date');
        });

        Schema::table('fuel_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_ftx_site_type_status_date');
            $table->dropIndex('idx_ftx_unit_date_type');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropIndex('idx_wo_site_status_rfu');
            $table->dropIndex('idx_wo_unit_status_rfu');
        });

        Schema::table('maintenance_costs', function (Blueprint $table) {
            $table->dropIndex('idx_mc_site_date_type');
            $table->dropIndex('idx_mc_wo_type_ref');
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_itx_site_dir_type_date');
        });
    }
};
