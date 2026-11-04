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
        // 1. Daily Dispatches
        Schema::create('daily_dispatches', function (Blueprint $table) {
            $table->id();
            $table->string('dispatch_number', 50)->unique();
            $table->date('date')->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('status', 30)->default('active')->index(); // draft, active, completed, cancelled
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Dispatch Assignments (Unit-Driver Assignment)
        Schema::create('dispatch_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_dispatch_id')->constrained('daily_dispatches')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->restrictOnDelete();
            $table->foreignId('loading_point_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('dumping_point_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('material_id')->constrained('materials')->restrictOnDelete();
            $table->integer('target_ritase')->default(5);
            $table->integer('actual_ritase')->default(0);
            $table->string('status', 30)->default('assigned')->index(); // assigned, operating, standby, breakdown, completed, cancelled
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Dispatch Assignment Logs (Assignment History & Audit)
        Schema::create('dispatch_assignment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_assignment_id')->constrained('dispatch_assignments')->cascadeOnDelete();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_type', 50); // status_change, unit_swap, driver_swap, route_change, note_update
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('reason');
            $table->timestamp('created_at')->useCurrent();
        });

        // 4. Hauling Activities (Journey & Loading Log)
        Schema::create('hauling_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_assignment_id')->nullable()->constrained('dispatch_assignments')->nullOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->restrictOnDelete();
            $table->foreignId('loading_point_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('dumping_point_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('material_id')->constrained('materials')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->date('activity_date')->index();
            $table->dateTime('loading_start_time')->nullable();
            $table->dateTime('loading_end_time')->nullable();
            $table->dateTime('hauling_start_time')->nullable();
            $table->dateTime('dumping_time')->nullable();
            $table->string('journey_status', 30)->default('loading')->index(); // loading, hauling, queueing_dump, dumped, returning, delay_breakdown, delay_weather, delay_road
            $table->string('delay_type', 50)->nullable(); // breakdown, weather_rain, road_slippery, traffic, front_queue, other
            $table->integer('delay_duration_minutes')->default(0);
            $table->text('delay_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 5. Ticket Import Batches (Bulk Import Tracking)
        Schema::create('ticket_import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code', 50)->unique();
            $table->string('file_name');
            $table->integer('total_rows')->default(0);
            $table->integer('successful_rows')->default(0);
            $table->integer('failed_rows')->default(0);
            $table->integer('duplicate_rows')->default(0);
            $table->json('error_summary')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 6. Dumping Tickets (Production Core Table)
        Schema::create('dumping_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 50)->unique()->index();
            $table->date('ticket_date')->index();
            $table->dateTime('dumping_time')->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->restrictOnDelete();
            $table->foreignId('loading_point_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('dumping_point_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('material_id')->constrained('materials')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->decimal('tonnage', 10, 2);
            $table->decimal('gross_weight', 10, 2)->nullable();
            $table->decimal('tare_weight', 10, 2)->nullable();
            $table->string('checker_name', 100)->default('Checker JSI');
            $table->string('source', 30)->default('manual'); // manual, import_excel, api
            $table->string('status', 30)->default('submitted')->index(); // draft, submitted, pending_verification, verified, rejected, corrected, cancelled
            $table->text('remarks')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('batch_import_id')->nullable()->constrained('ticket_import_batches')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('verified_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_production')->default(false)->index(); // True ONLY when verified
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 7. Ticket Corrections (Audit Trail & Workflow for modifications)
        Schema::create('ticket_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dumping_ticket_id')->constrained('dumping_tickets')->cascadeOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('old_data');
            $table->json('new_data');
            $table->text('reason');
            $table->string('status', 30)->default('approved'); // pending, approved, rejected
            $table->timestamps();
        });

        // 8. Production Targets (Daily & Monthly Targets)
        Schema::create('production_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('period_type', 20)->default('daily'); // daily, monthly
            $table->date('target_date')->nullable()->index();
            $table->integer('month')->nullable(); // 1-12
            $table->integer('year'); // e.g. 2026
            $table->decimal('target_tonnage', 15, 2)->default(0);
            $table->integer('target_ritase')->default(0);
            $table->integer('working_days')->default(30);
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['site_id', 'period_type', 'target_date', 'month', 'year'], 'prod_target_unique');
        });

        // 9. Ticket Reconciliations (TAP vs JSI External Comparison)
        Schema::create('ticket_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->string('reconciliation_code', 50)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('source_file_name')->nullable();
            $table->integer('total_tap_tickets')->default(0);
            $table->decimal('total_tap_tonnage', 15, 2)->default(0);
            $table->integer('total_jsi_tickets')->default(0);
            $table->decimal('total_jsi_tonnage', 15, 2)->default(0);
            $table->integer('matched_tickets_count')->default(0);
            $table->decimal('matched_tonnage', 15, 2)->default(0);
            $table->integer('discrepancy_tickets_count')->default(0);
            $table->decimal('discrepancy_tonnage', 15, 2)->default(0);
            $table->integer('missing_in_tap_count')->default(0);
            $table->integer('missing_in_jsi_count')->default(0);
            $table->string('status', 30)->default('draft')->index(); // draft, in_review, settled, disputed
            $table->text('settlement_notes')->nullable();
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reconciled_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 10. Reconciliation Items (Line-by-line comparison)
        Schema::create('reconciliation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reconciliation_id')->constrained('ticket_reconciliations')->cascadeOnDelete();
            $table->foreignId('dumping_ticket_id')->nullable()->constrained('dumping_tickets')->nullOnDelete();
            $table->string('jsi_ticket_number', 50)->nullable()->index();
            $table->string('tap_ticket_number', 50)->nullable()->index();
            $table->date('ticket_date')->nullable()->index();
            $table->decimal('jsi_tonnage', 10, 2)->default(0);
            $table->decimal('tap_tonnage', 10, 2)->default(0);
            $table->decimal('tonnage_diff', 10, 2)->default(0);
            $table->string('jsi_unit_code', 50)->nullable();
            $table->string('tap_unit_code', 50)->nullable();
            $table->string('match_status', 30)->index(); // match, missing_in_tap, missing_in_jsi, tonnage_diff, unit_diff, date_diff, duplicate
            $table->string('resolution_status', 30)->default('unresolved')->index(); // unresolved, resolved_accept_tap, resolved_accept_jsi, resolved_adjusted, ignored
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reconciliation_items');
        Schema::dropIfExists('ticket_reconciliations');
        Schema::dropIfExists('production_targets');
        Schema::dropIfExists('ticket_corrections');
        Schema::dropIfExists('dumping_tickets');
        Schema::dropIfExists('ticket_import_batches');
        Schema::dropIfExists('hauling_activities');
        Schema::dropIfExists('dispatch_assignment_logs');
        Schema::dropIfExists('dispatch_assignments');
        Schema::dropIfExists('daily_dispatches');
    }
};
