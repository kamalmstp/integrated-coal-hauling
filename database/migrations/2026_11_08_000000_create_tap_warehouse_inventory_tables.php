<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Inventory Categories
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique()->index();
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Warehouses (Multi-Warehouse per Site)
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('code', 40)->unique()->index();
            $table->string('name', 150);
            $table->string('warehouse_type', 40)->default('main_warehouse'); // main_warehouse, lubricant_storage, tire_yard, satellite_store, general_warehouse
            $table->string('location_address', 255)->nullable();
            $table->foreignId('storeman_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('capacity', 100)->nullable();
            $table->string('status', 20)->default('active')->index(); // active, inactive, maintenance
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Warehouse Locations (Rack / Bin / Shelf)
        Schema::create('warehouse_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->string('location_code', 60)->index(); // e.g., RACK-A01-BIN01
            $table->string('zone_name', 100)->nullable();
            $table->string('rack_number', 40)->nullable();
            $table->string('shelf_level', 40)->nullable();
            $table->string('bin_code', 40)->nullable();
            $table->string('capacity', 60)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['warehouse_id', 'location_code']);
        });

        // 4. Inventory Items (Item Master)
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->string('item_code', 50)->unique()->index();
            $table->string('part_number', 100)->nullable()->index();
            $table->string('barcode', 100)->nullable()->index();
            $table->string('item_name', 180)->index();
            $table->foreignId('category_id')->constrained('inventory_categories')->restrictOnDelete();
            $table->string('category_code', 40)->index(); // sparepart, tire_tyre, lubricant, filter, electrical, engine_parts, hydraulic_parts, consumables, tools, general_supplies
            $table->string('brand', 100)->nullable();
            $table->text('specification')->nullable();
            $table->string('unit_of_measurement', 30)->default('PCS'); // PCS, SET, LTR, DRUM, KG, BOX, UNIT
            $table->decimal('minimum_stock', 12, 2)->default(0);
            $table->decimal('maximum_stock', 12, 2)->nullable();
            $table->decimal('reorder_point', 12, 2)->default(0);
            $table->foreignId('default_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('default_location_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            $table->decimal('standard_cost', 15, 2)->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Inventory Balances (Per Site, Per Warehouse, Per Item with Moving Weighted Average Cost)
        Schema::create('inventory_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('warehouse_location_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('on_hand_qty', 14, 2)->default(0);
            $table->decimal('reserved_qty', 14, 2)->default(0);
            $table->decimal('available_qty', 14, 2)->default(0);
            $table->decimal('average_unit_cost', 15, 2)->default(0);
            $table->decimal('total_value', 18, 2)->default(0);
            $table->dateTime('last_in_date')->nullable();
            $table->dateTime('last_out_date')->nullable();
            $table->dateTime('last_movement_date')->nullable()->index();
            $table->timestamps();

            $table->unique(['warehouse_id', 'inventory_item_id']);
        });

        // 6. Inventory Transactions (Header for Stock In & Stock Out)
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('document_number', 60)->unique()->index();
            $table->date('transaction_date')->index();
            $table->dateTime('transaction_datetime')->index();
            $table->string('direction', 10)->index(); // IN, OUT
            $table->string('transaction_type', 40)->index();
            // IN: goods_receipt, opening_balance, purchase_receiving, return_from_maintenance, transfer_in, adjustment_in
            // OUT: maintenance_issue, operational_issue, general_issue, transfer_out, return_to_vendor, adjustment_out
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->string('reference_type', 50)->nullable()->index(); // work_order, sparepart_request, stock_transfer, stock_opname, stock_adjustment, purchase_order, manual
            $table->unsignedBigInteger('reference_id')->nullable()->index();
            $table->string('reference_document', 100)->nullable()->index();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
            $table->foreignId('sparepart_request_id')->nullable()->constrained('sparepart_requests')->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->foreignId('requester_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('storeman_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('status', 20)->default('confirmed')->index(); // draft, confirmed, cancelled
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 7. Inventory Transaction Items (Detail & Immutable Stock Card Ledger)
        Schema::create('inventory_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_transaction_id')->constrained('inventory_transactions')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('warehouse_location_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->string('direction', 10)->index(); // IN, OUT
            $table->string('transaction_type', 40)->index();
            $table->dateTime('transaction_datetime')->index();
            $table->decimal('opening_balance_qty', 14, 2)->default(0);
            $table->decimal('qty_in', 14, 2)->default(0);
            $table->decimal('qty_out', 14, 2)->default(0);
            $table->decimal('running_balance_qty', 14, 2)->default(0);
            $table->string('unit', 30)->default('PCS');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('moving_average_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 18, 2)->default(0);
            $table->decimal('running_valuation', 18, 2)->default(0);
            $table->string('reference_document', 100)->nullable();
            $table->string('remarks', 255)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 8. Stock Transfers (Inter-Warehouse Transfer Header)
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number', 50)->unique()->index();
            $table->date('transfer_date')->index();
            $table->foreignId('from_site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('to_site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('to_warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('requester_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('dispatched_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->dateTime('dispatched_at')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->dateTime('received_at')->nullable();
            $table->string('status', 30)->default('draft')->index(); // draft, approved, in_transit, completed, cancelled
            $table->decimal('total_transfer_value', 18, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 9. Stock Transfer Items
        Schema::create('stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_id')->constrained('stock_transfers')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->decimal('qty_requested', 14, 2);
            $table->decimal('qty_dispatched', 14, 2)->default(0);
            $table->decimal('qty_received', 14, 2)->default(0);
            $table->string('unit', 30)->default('PCS');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 18, 2)->default(0);
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });

        // 10. Stock Opnames (Physical Inventory Count Schedule & Header)
        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->string('opname_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->date('scheduled_date')->index();
            $table->date('conducted_date')->nullable();
            $table->string('status', 30)->default('scheduled')->index(); // scheduled, counting, under_investigation, approved, completed, cancelled
            $table->foreignId('storeman_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('auditor_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('investigation_notes')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 11. Stock Opname Items
        Schema::create('stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained('stock_opnames')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->foreignId('warehouse_location_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            $table->decimal('system_qty', 14, 2)->default(0);
            $table->decimal('physical_qty', 14, 2)->default(0);
            $table->decimal('variance_qty', 14, 2)->default(0); // physical_qty - system_qty
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('variance_value', 18, 2)->default(0);
            $table->string('status', 30)->default('pending'); // pending, matched, discrepancy, investigated, adjusted
            $table->text('investigation_reason')->nullable();
            $table->timestamps();
        });

        // 12. Stock Adjustments (Official Approval Document to Adjust Stock Balance)
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('adjustment_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('stock_opname_id')->nullable()->constrained('stock_opnames')->nullOnDelete();
            $table->date('adjustment_date')->index();
            $table->string('reason_category', 50)->default('opname_variance'); // opname_variance, damaged_goods, expired_lubricant, found_surplus, administrative_correction
            $table->string('status', 30)->default('pending_approval')->index(); // draft, pending_approval, approved, rejected
            $table->foreignId('requested_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 13. Stock Adjustment Items
        Schema::create('stock_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_adjustment_id')->constrained('stock_adjustments')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->string('direction', 10); // IN, OUT
            $table->decimal('system_qty', 14, 2)->default(0);
            $table->decimal('physical_qty', 14, 2)->default(0);
            $table->decimal('adjustment_qty', 14, 2); // positive quantity to add (IN) or deduct (OUT)
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('total_value_impact', 18, 2)->default(0);
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });

        // 14. Inventory Reservations (Picking & Holding Stock for Approved Sparepart Requests)
        Schema::create('inventory_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reservation_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->foreignId('sparepart_request_id')->nullable()->constrained('sparepart_requests')->cascadeOnDelete();
            $table->foreignId('sparepart_request_item_id')->nullable()->constrained('sparepart_request_items')->cascadeOnDelete();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
            $table->decimal('reserved_qty', 14, 2);
            $table->decimal('fulfilled_qty', 14, 2)->default(0);
            $table->string('status', 30)->default('active')->index(); // active, fulfilled, released, cancelled
            $table->foreignId('reserved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reserved_at');
            $table->timestamps();
        });

        // 15. Purchase Requests (Procurement Integration Proposal for Phase 6)
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('pr_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->date('request_date')->index();
            $table->string('source', 40)->default('reorder_point'); // reorder_point, backorder, manual_request
            $table->string('priority', 20)->default('normal'); // critical, high, normal, low
            $table->string('status', 30)->default('submitted')->index(); // draft, submitted, approved_for_po, rejected, converted_to_po
            $table->decimal('estimated_total', 18, 2)->default(0);
            $table->foreignId('requested_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->decimal('current_stock', 14, 2)->default(0);
            $table->decimal('minimum_stock', 14, 2)->default(0);
            $table->decimal('reorder_point', 14, 2)->default(0);
            $table->decimal('maximum_stock', 14, 2)->nullable();
            $table->decimal('recommended_qty', 14, 2)->default(0);
            $table->decimal('requested_qty', 14, 2);
            $table->string('unit', 30)->default('PCS');
            $table->decimal('estimated_unit_price', 15, 2)->default(0);
            $table->decimal('estimated_subtotal', 18, 2)->default(0);
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });

        // 16. Upgrade Phase 4 sparepart_requests & sparepart_request_items for full Warehouse Picking, Partial Issue, Backorder, Return
        Schema::table('sparepart_requests', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('site_id')->constrained('warehouses')->nullOnDelete();
            $table->foreignId('storeman_id')->nullable()->after('issued_by')->constrained('employees')->nullOnDelete();
            $table->dateTime('picked_at')->nullable()->after('approved_at');
            $table->foreignId('received_by')->nullable()->after('issued_at')->constrained('employees')->nullOnDelete();
            $table->dateTime('received_at')->nullable()->after('received_by');
            $table->text('rejection_reason')->nullable()->after('notes');
        });

        Schema::table('sparepart_request_items', function (Blueprint $table) {
            $table->foreignId('inventory_item_id')->nullable()->after('sparepart_request_id')->constrained('inventory_items')->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->after('inventory_item_id')->constrained('warehouses')->nullOnDelete();
            $table->foreignId('warehouse_location_id')->nullable()->after('warehouse_id')->constrained('warehouse_locations')->nullOnDelete();
            $table->decimal('quantity_picked', 10, 2)->default(0)->after('quantity_approved');
            $table->decimal('quantity_backorder', 10, 2)->default(0)->after('quantity_issued');
            $table->decimal('quantity_returned', 10, 2)->default(0)->after('quantity_backorder');
        });
    }

    public function down(): void
    {
        Schema::table('sparepart_request_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('warehouse_location_id');
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropConstrainedForeignId('inventory_item_id');
            $table->dropColumn(['quantity_picked', 'quantity_backorder', 'quantity_returned']);
        });

        Schema::table('sparepart_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('received_by');
            $table->dropConstrainedForeignId('storeman_id');
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropColumn(['picked_at', 'received_at', 'rejection_reason']);
        });

        Schema::dropIfExists('purchase_request_items');
        Schema::dropIfExists('purchase_requests');
        Schema::dropIfExists('inventory_reservations');
        Schema::dropIfExists('stock_adjustment_items');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('stock_opname_items');
        Schema::dropIfExists('stock_opnames');
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('inventory_transaction_items');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_balances');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('warehouse_locations');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('inventory_categories');
    }
};
