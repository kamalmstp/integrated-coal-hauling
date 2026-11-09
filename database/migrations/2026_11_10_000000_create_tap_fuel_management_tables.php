<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Fuel Parameters (Per-Site Configurable Fuel Estimation & Governance Parameters)
        Schema::create('fuel_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->unique()->constrained('sites')->cascadeOnDelete();
            $table->decimal('estimation_factor', 10, 6)->default(0.047500); // TAP Formula: Tonase x Jarak x 0.0475
            $table->decimal('default_haul_distance_km', 8, 2)->default(32.00);
            $table->decimal('standard_fuel_price_per_liter', 12, 2)->default(14850.00);
            $table->decimal('low_stock_threshold_percent', 5, 2)->default(20.00);
            $table->decimal('variance_tolerance_percent', 5, 2)->default(0.50);
            $table->decimal('max_dispense_per_tx_liter', 10, 2)->default(450.00);
            $table->text('authorization_notes')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Fuel Suppliers
        Schema::create('fuel_suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier_code', 50)->unique();
            $table->string('name', 180);
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->string('contact_person', 120)->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email', 120)->nullable();
            $table->text('address')->nullable();
            $table->string('fuel_type', 60)->default('Solar B35 Industri');
            $table->string('contract_number', 100)->nullable();
            $table->decimal('contract_price_per_liter', 12, 2)->default(14850.00);
            $table->string('payment_terms', 60)->default('TOP 30 Days');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Fuel Tanks (Multiple Tanks per Site: Stationary Storage Tank / Mobile Bowser)
        Schema::create('fuel_tanks', function (Blueprint $table) {
            $table->id();
            $table->string('tank_number', 50)->unique();
            $table->string('tank_name', 150);
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('tank_type', 40)->default('stationary_tank'); // stationary_tank, mobile_bowser, daily_tank
            $table->string('shape_type', 40)->default('calibrated_chart'); // calibrated_chart, horizontal_cylinder, vertical_cylinder
            $table->decimal('capacity_liters', 14, 2);
            $table->decimal('dead_stock_liters', 12, 2)->default(500.00);
            $table->decimal('minimum_alert_liters', 12, 2)->default(5000.00);
            $table->decimal('max_height_cm', 8, 2)->default(300.00);
            $table->decimal('length_cm', 8, 2)->nullable();
            $table->decimal('diameter_cm', 8, 2)->nullable();
            $table->decimal('opening_stock_liters', 14, 2)->default(0);
            $table->decimal('current_stock_liters', 14, 2)->default(0);
            $table->decimal('average_cost_per_liter', 12, 2)->default(14850.00);
            $table->dateTime('last_sounding_at')->nullable();
            $table->decimal('last_sounding_cm', 8, 2)->nullable();
            $table->decimal('last_sounding_liters', 14, 2)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Fuel Calibrations (Validated Tank Strapping Chart: Height cm -> Volume Liters)
        Schema::create('fuel_calibrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->cascadeOnDelete();
            $table->decimal('height_cm', 8, 2);
            $table->decimal('volume_liters', 14, 2);
            $table->decimal('mm_increment_factor', 8, 4)->default(0);
            $table->string('calibration_certificate_no', 100)->nullable();
            $table->date('calibrated_date')->nullable();
            $table->timestamps();

            $table->unique(['fuel_tank_id', 'height_cm'], 'fuel_tank_height_unique');
        });

        // 5. Fuel Receipts (Fuel Purchase, Fuel Receiving, Fuel Invoice, Opening Stock)
        Schema::create('fuel_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number', 50)->unique();
            $table->string('receipt_type', 30)->default('fuel_receiving'); // fuel_receiving, opening_stock
            $table->date('receipt_date')->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('fuel_supplier_id')->nullable()->constrained('fuel_suppliers')->nullOnDelete();
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
            $table->string('po_number', 60)->nullable();
            $table->string('do_number', 80)->nullable();
            $table->string('invoice_number', 80)->nullable();
            $table->date('invoice_date')->nullable();
            $table->string('invoice_status', 30)->default('unbilled'); // unbilled, invoiced, verified
            $table->string('transport_vehicle_no', 40)->nullable();
            $table->string('driver_name', 100)->nullable();
            $table->decimal('total_do_liters', 14, 2)->default(0);
            $table->decimal('total_received_liters', 14, 2)->default(0);
            $table->decimal('total_amount', 16, 2)->default(0);
            $table->string('status', 30)->default('confirmed'); // confirmed, cancelled
            $table->foreignId('received_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->string('attachment_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Fuel Receipt Items
        Schema::create('fuel_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fuel_receipt_id')->constrained('fuel_receipts')->cascadeOnDelete();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->restrictOnDelete();
            $table->decimal('do_volume_liters', 14, 2)->default(0);
            $table->decimal('received_volume_liters', 14, 2);
            $table->decimal('temperature_celsius', 5, 2)->nullable();
            $table->decimal('density_kg_m3', 6, 4)->nullable();
            $table->decimal('flowmeter_start', 14, 2)->nullable();
            $table->decimal('flowmeter_end', 14, 2)->nullable();
            $table->decimal('sounding_before_cm', 8, 2)->nullable();
            $table->decimal('sounding_after_cm', 8, 2)->nullable();
            $table->decimal('unit_price', 12, 2)->default(14850.00);
            $table->decimal('subtotal_amount', 16, 2)->default(0);
            $table->decimal('stock_before_liters', 14, 2)->default(0);
            $table->decimal('stock_after_liters', 14, 2)->default(0);
            $table->string('remarks')->nullable();
            $table->timestamps();
        });

        // 7. Fuel Transactions (Dispensing, Transfer, Receiving Ledger, Adjustment Ledger, Digital Fuel Ticket)
        Schema::create('fuel_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number', 50)->unique();
            $table->string('digital_ticket_code', 60)->unique();
            $table->string('transaction_type', 30)->index(); // dispensing, transfer, receiving, adjustment, opening_stock
            $table->date('transaction_date')->index();
            $table->time('transaction_time');
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->foreignId('source_tank_id')->nullable()->constrained('fuel_tanks')->restrictOnDelete();
            $table->foreignId('destination_tank_id')->nullable()->constrained('fuel_tanks')->restrictOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->restrictOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->foreignId('fuelman_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('dumping_ticket_id')->nullable()->constrained('dumping_tickets')->nullOnDelete();
            $table->foreignId('dispatch_assignment_id')->nullable()->constrained('dispatch_assignments')->nullOnDelete();
            $table->string('reference_ticket_number', 60)->nullable();
            $table->string('fuel_source_type', 40)->default('stationary_station'); // stationary_station, mobile_bowser
            $table->decimal('current_hm', 12, 2)->nullable();
            $table->decimal('previous_hm', 12, 2)->nullable();
            $table->decimal('hm_delta', 10, 2)->default(0);
            $table->decimal('current_km', 12, 2)->nullable();
            $table->decimal('previous_km', 12, 2)->nullable();
            $table->decimal('km_delta', 10, 2)->default(0);
            $table->decimal('liters', 14, 2);
            $table->decimal('unit_cost', 12, 2)->default(14850.00);
            $table->decimal('total_cost', 16, 2)->default(0);
            $table->decimal('flowmeter_start', 14, 2)->nullable();
            $table->decimal('flowmeter_end', 14, 2)->nullable();
            $table->decimal('stock_before_liters', 14, 2)->default(0);
            $table->decimal('stock_after_liters', 14, 2)->default(0);
            $table->string('status', 30)->default('completed'); // completed, voided
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 8. Fuel Transaction Items
        Schema::create('fuel_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fuel_transaction_id')->constrained('fuel_transactions')->cascadeOnDelete();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->restrictOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('movement_direction', 10); // in, out
            $table->string('fuel_grade', 40)->default('Solar B35');
            $table->decimal('quantity_liters', 14, 2);
            $table->decimal('unit_cost', 12, 2)->default(14850.00);
            $table->decimal('subtotal_cost', 16, 2)->default(0);
            $table->decimal('balance_before_liters', 14, 2)->default(0);
            $table->decimal('balance_after_liters', 14, 2)->default(0);
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 9. Fuel Soundings (Daily Tank Sounding & Physical Volume Calculation)
        Schema::create('fuel_soundings', function (Blueprint $table) {
            $table->id();
            $table->string('sounding_number', 50)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->restrictOnDelete();
            $table->date('sounding_date')->index();
            $table->time('sounding_time');
            $table->decimal('measurement_cm', 8, 2);
            $table->decimal('water_level_cm', 8, 2)->default(0);
            $table->decimal('temperature_celsius', 5, 2)->default(30.00);
            $table->string('calibration_method', 40)->default('calibration_chart'); // calibration_chart, cylinder_geometry
            $table->json('conversion_snapshot')->nullable();
            $table->decimal('estimated_volume_liters', 14, 2);
            $table->decimal('system_stock_liters', 14, 2);
            $table->decimal('variance_liters', 14, 2)->default(0);
            $table->decimal('variance_percent', 8, 4)->default(0);
            $table->string('reconciliation_status', 30)->default('within_tolerance'); // matched, within_tolerance, investigation_required, adjusted
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('attachment_path')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // 10. Fuel Adjustments (Official Stock Adjustment Procedure)
        Schema::create('fuel_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('adjustment_number', 50)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->restrictOnDelete();
            $table->foreignId('fuel_sounding_id')->nullable()->constrained('fuel_soundings')->nullOnDelete();
            $table->date('adjustment_date')->index();
            $table->string('adjustment_type', 40)->default('sounding_correction'); // gain, loss, sounding_correction, evaporation, meter_calibration
            $table->decimal('system_stock_before_liters', 14, 2);
            $table->decimal('adjustment_liters', 14, 2); // + for gain, - for loss
            $table->decimal('physical_stock_after_liters', 14, 2);
            $table->decimal('unit_cost', 12, 2)->default(14850.00);
            $table->decimal('total_adjustment_value', 16, 2)->default(0);
            $table->string('status', 30)->default('pending_approval'); // pending_approval, approved, rejected
            $table->text('reason');
            $table->text('investigation_notes')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('fuel_transaction_id')->nullable()->constrained('fuel_transactions')->nullOnDelete();
            $table->timestamps();
        });

        // 11. Fuel Reconciliations (Opening + Received - Issued +/- Transfer +/- Adjustment vs Physical Sounding)
        Schema::create('fuel_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->string('reconciliation_number', 50)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->restrictOnDelete();
            $table->date('reconciliation_date')->index();
            $table->decimal('opening_stock_liters', 14, 2)->default(0);
            $table->decimal('fuel_received_liters', 14, 2)->default(0);
            $table->decimal('fuel_issued_liters', 14, 2)->default(0);
            $table->decimal('transfer_in_liters', 14, 2)->default(0);
            $table->decimal('transfer_out_liters', 14, 2)->default(0);
            $table->decimal('adjustment_liters', 14, 2)->default(0);
            $table->decimal('system_closing_stock_liters', 14, 2)->default(0);
            $table->decimal('physical_sounding_cm', 8, 2)->nullable();
            $table->decimal('physical_sounding_liters', 14, 2)->default(0);
            $table->decimal('variance_liters', 14, 2)->default(0);
            $table->decimal('variance_percent', 8, 4)->default(0);
            $table->string('status', 30)->default('balanced'); // balanced, minor_variance, investigation_required, resolved
            $table->text('investigation_findings')->nullable();
            $table->text('corrective_action')->nullable();
            $table->foreignId('fuel_sounding_id')->nullable()->constrained('fuel_soundings')->nullOnDelete();
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_reconciliations');
        Schema::dropIfExists('fuel_adjustments');
        Schema::dropIfExists('fuel_soundings');
        Schema::dropIfExists('fuel_transaction_items');
        Schema::dropIfExists('fuel_transactions');
        Schema::dropIfExists('fuel_receipt_items');
        Schema::dropIfExists('fuel_receipts');
        Schema::dropIfExists('fuel_calibrations');
        Schema::dropIfExists('fuel_tanks');
        Schema::dropIfExists('fuel_suppliers');
        Schema::dropIfExists('fuel_parameters');
    }
};
