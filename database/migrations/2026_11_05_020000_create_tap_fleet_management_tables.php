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
        // 1. Digital P2H Inspections (Pemeriksaan Pra-Operasi Harian)
        Schema::create('p2h_inspections', function (Blueprint $table) {
            $table->id();
            $table->string('inspection_number', 50)->unique()->index();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->date('inspection_date')->index();
            $table->time('inspection_time');
            $table->decimal('current_hm', 12, 2)->default(0);
            $table->decimal('current_km', 12, 2)->default(0);
            $table->string('overall_condition', 30)->default('rfu')->index(); // rfu (Ready For Use), rfu_with_notes, not_rfu (Breakdown/Not Ready)
            $table->boolean('has_critical_defect')->default(false)->index();
            $table->text('driver_notes')->nullable();
            $table->string('driver_signature_hash', 100)->nullable();
            $table->boolean('is_acknowledged')->default(true);
            $table->foreignId('supervisor_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->text('supervisor_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. P2H Checklist Items (15 Standard Mining Safety Checklist Items)
        Schema::create('p2h_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('p2h_inspection_id')->constrained('p2h_inspections')->cascadeOnDelete();
            $table->string('category', 50); // engine, fluids, controls, safety, body_structure
            $table->string('item_name', 100); // engine, oil, coolant, brake, steering, tire, wheel_nut, lamp, horn, mirror, seat_belt, body, hydraulic, battery, safety_equipment
            $table->boolean('is_critical')->default(false); // Critical items: brake, steering, hydraulic, oil leak, safety equipment
            $table->string('status', 20)->default('good'); // good, not_good, not_applicable
            $table->text('defect_description')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });

        // 3. Work Orders (Maintenance Defect Reports generated from P2H or Breakdown)
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('wo_number', 50)->unique()->index();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('p2h_inspection_id')->nullable()->constrained('p2h_inspections')->nullOnDelete();
            $table->string('source', 30)->default('p2h_defect'); // p2h_defect, road_breakdown, scheduled_pm, inspection
            $table->string('priority', 30)->default('high'); // critical_emergency, high, medium, low
            $table->dateTime('breakdown_time')->index();
            $table->dateTime('start_repair_time')->nullable();
            $table->dateTime('completion_time')->nullable();
            $table->integer('downtime_minutes')->default(0);
            $table->text('defect_summary');
            $table->text('action_taken')->nullable();
            $table->foreignId('assigned_mechanic_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('status', 30)->default('open')->index(); // open, in_progress, waiting_parts, completed, cancelled
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Unit HM/KM Shift Monitoring & Anomaly Detection
        Schema::create('unit_hm_km_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->date('log_date')->index();
            $table->decimal('start_hm', 12, 2);
            $table->decimal('end_hm', 12, 2);
            $table->decimal('diff_hm', 8, 2); // Operating hours in shift
            $table->decimal('start_km', 12, 2);
            $table->decimal('end_km', 12, 2);
            $table->decimal('diff_km', 8, 2); // Distance hauled in shift
            $table->boolean('is_anomaly')->default(false)->index();
            $table->string('anomaly_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 5. Maintenance Service Intervals & Planner (PM 250, 500, 1000, 2000)
        Schema::create('maintenance_service_intervals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->string('service_type', 50); // PM_250, PM_500, PM_1000, PM_2000
            $table->integer('interval_hm'); // 250, 500, 1000, 2000
            $table->decimal('last_service_hm', 12, 2)->default(0);
            $table->date('last_service_date')->nullable();
            $table->decimal('next_service_hm', 12, 2);
            $table->decimal('remaining_hm', 12, 2);
            $table->string('status', 30)->default('normal')->index(); // normal, due_soon, overdue, in_service
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['unit_id', 'service_type'], 'unit_service_unique');
        });

        // 6. Fleet Daily KPIs (PA, MA, UA, Operating & Downtime Hours)
        Schema::create('fleet_daily_kpis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete(); // null = site aggregate
            $table->date('date')->index();
            $table->decimal('calendar_hours', 6, 2)->default(24.00); // TH (Total Hours) = 24.00
            $table->decimal('operating_hours', 6, 2)->default(0.00); // OH
            $table->decimal('standby_hours', 6, 2)->default(0.00); // SB
            $table->decimal('downtime_hours', 6, 2)->default(0.00); // DT
            $table->integer('breakdown_count')->default(0);
            $table->decimal('physical_availability_pa', 5, 2)->default(100.00); // PA = (OH + SB) / TH * 100
            $table->decimal('mechanical_availability_ma', 5, 2)->default(100.00); // MA = OH / (OH + DT) * 100
            $table->decimal('utilization_ua', 5, 2)->default(0.00); // UA = OH / (OH + SB) * 100
            $table->decimal('mttr_hours', 6, 2)->default(0.00); // Mean Time to Repair
            $table->decimal('mtbf_hours', 6, 2)->default(0.00); // Mean Time Between Failures
            $table->timestamps();

            $table->unique(['site_id', 'unit_id', 'date'], 'site_unit_date_kpi_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fleet_daily_kpis');
        Schema::dropIfExists('maintenance_service_intervals');
        Schema::dropIfExists('unit_hm_km_logs');
        Schema::dropIfExists('work_orders');
        Schema::dropIfExists('p2h_items');
        Schema::dropIfExists('p2h_inspections');
    }
};
