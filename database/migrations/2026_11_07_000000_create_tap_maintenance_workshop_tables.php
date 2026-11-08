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
        // 1. Breakdown Reports (Laporan Kerusakan Driver, Foreman, Mekanik)
        Schema::create('breakdown_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->string('reporter_type', 20)->default('driver')->index(); // driver, foreman, mechanic
            $table->foreignId('reporter_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('reporter_name', 100);
            $table->date('breakdown_date')->index();
            $table->time('breakdown_time');
            $table->decimal('current_hm', 12, 2)->default(0);
            $table->decimal('current_km', 12, 2)->default(0);
            $table->string('location_name', 150);
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('damage_category', 50)->index(); // engine, transmission, hydraulic, brake, steering, electrical, tire, suspension, cooling_system, body, other
            $table->text('damage_description');
            $table->string('priority', 20)->default('medium')->index(); // critical, high, medium, low
            $table->string('photo_path')->nullable();
            $table->string('video_path')->nullable();
            $table->string('status', 30)->default('submitted')->index(); // submitted, reviewed, converted_to_request, converted_to_wo, rejected
            $table->boolean('is_critical')->default(false)->index();
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Maintenance Requests
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('breakdown_report_id')->nullable()->constrained('breakdown_reports')->nullOnDelete();
            $table->foreignId('p2h_inspection_id')->nullable()->constrained('p2h_inspections')->nullOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('requester_name', 100);
            $table->string('damage_category', 50)->index();
            $table->text('work_description');
            $table->string('priority', 20)->default('medium')->index(); // critical, high, medium, low
            $table->date('request_date')->index();
            $table->string('attachment_path')->nullable();
            $table->string('status', 30)->default('submitted')->index(); // submitted, under_review, approved, rejected, converted_to_wo, closed
            $table->string('approval_status', 20)->default('pending')->index(); // pending, approved, rejected
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('approval_notes')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('work_order_id')->nullable(); // Reference to work order if converted (prevent duplicate WOs)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Upgrade work_orders with comprehensive Phase 4 fields
        Schema::table('work_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('work_orders', 'site_id')) {
                $table->foreignId('site_id')->nullable()->after('wo_number')->constrained('sites')->nullOnDelete();
            }
            if (!Schema::hasColumn('work_orders', 'maintenance_request_id')) {
                $table->foreignId('maintenance_request_id')->nullable()->after('p2h_inspection_id')->constrained('maintenance_requests')->nullOnDelete();
            }
            if (!Schema::hasColumn('work_orders', 'breakdown_report_id')) {
                $table->foreignId('breakdown_report_id')->nullable()->after('maintenance_request_id')->constrained('breakdown_reports')->nullOnDelete();
            }
            if (!Schema::hasColumn('work_orders', 'job_type')) {
                $table->string('job_type', 50)->default('corrective_maintenance')->after('source')->index(); // preventive_maintenance, corrective_maintenance, emergency_repair, inspection, tire_maintenance, electrical_repair, general_repair
            }
            if (!Schema::hasColumn('work_orders', 'target_completion_date')) {
                $table->dateTime('target_completion_date')->nullable()->after('completion_time');
            }
            if (!Schema::hasColumn('work_orders', 'actual_completion_date')) {
                $table->dateTime('actual_completion_date')->nullable()->after('target_completion_date');
            }
            if (!Schema::hasColumn('work_orders', 'hm_at_service')) {
                $table->decimal('hm_at_service', 12, 2)->default(0)->after('downtime_minutes');
            }
            if (!Schema::hasColumn('work_orders', 'km_at_service')) {
                $table->decimal('km_at_service', 12, 2)->default(0)->after('hm_at_service');
            }
            if (!Schema::hasColumn('work_orders', 'initial_complaint')) {
                $table->text('initial_complaint')->nullable()->after('km_at_service');
            }
            if (!Schema::hasColumn('work_orders', 'diagnosis')) {
                $table->text('diagnosis')->nullable()->after('initial_complaint');
            }
            if (!Schema::hasColumn('work_orders', 'root_cause')) {
                $table->text('root_cause')->nullable()->after('action_taken');
            }
            if (!Schema::hasColumn('work_orders', 'supervisor_id')) {
                $table->foreignId('supervisor_id')->nullable()->after('assigned_mechanic_id')->constrained('employees')->nullOnDelete();
            }
            if (!Schema::hasColumn('work_orders', 'estimated_cost')) {
                $table->decimal('estimated_cost', 15, 2)->default(0)->after('supervisor_id');
            }
            if (!Schema::hasColumn('work_orders', 'actual_cost')) {
                $table->decimal('actual_cost', 15, 2)->default(0)->after('estimated_cost');
            }
            if (!Schema::hasColumn('work_orders', 'rfu_status')) {
                $table->string('rfu_status', 30)->default('waiting_repair')->after('status')->index(); // waiting_repair, repair_in_progress, waiting_inspection, inspection_failed, approved_rfu, rejected_rfu
            }
            if (!Schema::hasColumn('work_orders', 'approval_status')) {
                $table->string('approval_status', 20)->default('approved')->after('rfu_status')->index(); // pending, approved, rejected
            }
            if (!Schema::hasColumn('work_orders', 'approver_id')) {
                $table->foreignId('approver_id')->nullable()->after('approval_status')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('work_orders', 'approved_at')) {
                $table->dateTime('approved_at')->nullable()->after('approver_id');
            }
        });

        // 4. Work Order Assignments (Multi-Mechanic Assignments)
        Schema::create('work_order_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('mechanic_id')->constrained('employees')->restrictOnDelete();
            $table->string('role', 30)->default('lead_mechanic'); // lead_mechanic, assistant_mechanic, electrician, welder, tireman
            $table->date('assigned_date');
            $table->decimal('working_hours', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('assigned'); // assigned, active, completed
            $table->timestamps();
        });

        // 5. Work Order Tasks (Daftar Tugas / Checklist Perbaikan)
        Schema::create('work_order_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->string('task_name', 150);
            $table->text('description')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->foreignId('completed_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });

        // 6. Mechanic Work Logs (Kontribusi jam kerja, diagnosa, foto sebelum/sesudah via HP)
        Schema::create('mechanic_work_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('mechanic_id')->constrained('employees')->restrictOnDelete();
            $table->date('log_date')->index();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->decimal('duration_hours', 6, 2)->default(0);
            $table->text('diagnosis')->nullable();
            $table->text('action_taken')->nullable();
            $table->text('work_notes')->nullable();
            $table->string('photo_before')->nullable();
            $table->string('photo_after')->nullable();
            $table->string('status_update', 30)->nullable();
            $table->timestamps();
        });

        // 7. Job Cards (Pusat kartu kerja per Work Order, siap cetak/ekspor)
        Schema::create('job_cards', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_number', 50)->unique()->index();
            $table->foreignId('work_order_id')->unique()->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->date('issue_date')->index();
            $table->text('initial_complaint')->nullable();
            $table->text('mechanic_diagnosis')->nullable();
            $table->text('work_performed')->nullable();
            $table->string('photo_before')->nullable();
            $table->string('photo_after')->nullable();
            $table->text('work_result')->nullable();
            $table->foreignId('lead_mechanic_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->dateTime('supervisor_inspected_at')->nullable();
            $table->text('supervisor_notes')->nullable();
            $table->string('status', 20)->default('active')->index(); // active, completed, signed_off
            $table->timestamps();
        });

        // 8. Job Card Checklists
        Schema::create('job_card_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->constrained('job_cards')->cascadeOnDelete();
            $table->string('item_name', 150);
            $table->string('category', 50);
            $table->boolean('is_checked')->default(false);
            $table->foreignId('checked_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 9. Sparepart Requests (Integrasi permintaan suku cadang dari WO ke Gudang)
        Schema::create('sparepart_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number', 50)->unique()->index();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('requested_by')->constrained('employees')->restrictOnDelete();
            $table->date('request_date')->index();
            $table->string('status', 30)->default('submitted')->index(); // draft, submitted, approved, issued_by_warehouse, pending_integration, rejected
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('issued_at')->nullable();
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 10. Sparepart Request Items
        Schema::create('sparepart_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sparepart_request_id')->constrained('sparepart_requests')->cascadeOnDelete();
            $table->string('part_number', 100)->index();
            $table->string('part_name', 150);
            $table->string('category', 50)->nullable();
            $table->decimal('quantity_requested', 10, 2);
            $table->decimal('quantity_approved', 10, 2)->default(0);
            $table->decimal('quantity_issued', 10, 2)->default(0);
            $table->string('unit', 20)->default('pcs'); // pcs, set, ltr, drum, kg
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->string('status', 20)->default('pending'); // pending, approved, issued, rejected
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 11. Maintenance Inspections & Quality Control (Pemeriksaan pra-RFU)
        Schema::create('maintenance_inspections', function (Blueprint $table) {
            $table->id();
            $table->string('inspection_number', 50)->unique()->index();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('inspector_id')->constrained('employees')->restrictOnDelete();
            $table->date('inspection_date')->index();
            $table->time('inspection_time');
            $table->string('inspection_type', 30)->default('post_repair'); // post_repair, preventive_qa, safety_clearance
            $table->json('checklist_result')->nullable();
            $table->decimal('test_run_hm', 8, 2)->nullable();
            $table->decimal('test_run_km', 8, 2)->nullable();
            $table->text('test_run_result')->nullable();
            $table->string('result', 20)->default('passed')->index(); // passed, failed, needs_rework
            $table->text('defects_found')->nullable();
            $table->text('inspector_notes')->nullable();
            $table->string('inspector_signature_hash')->nullable();
            $table->timestamps();
        });

        // 12. RFU Approvals (Ready For Use Workflow & Otorisasi Pejabat Berwenang)
        Schema::create('rfu_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('maintenance_inspection_id')->nullable()->constrained('maintenance_inspections')->nullOnDelete();
            $table->foreignId('approver_id')->constrained('employees')->restrictOnDelete(); // Rules: Cannot be the lead mechanic
            $table->dateTime('approval_date');
            $table->string('decision', 20)->default('approved_rfu')->index(); // approved_rfu, rejected_rfu
            $table->text('approval_notes')->nullable();
            $table->string('signature_hash')->nullable();
            $table->timestamps();
        });

        // 13. Maintenance Costs (Tracking Biaya Suku Cadang, Material, Jasa, Mekanik)
        Schema::create('maintenance_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->date('cost_date')->index();
            $table->string('cost_type', 30)->index(); // sparepart, material, third_party_service, consumable, mechanic_labor, other
            $table->string('description', 255);
            $table->string('reference_number', 100)->nullable();
            $table->decimal('estimated_amount', 15, 2)->default(0);
            $table->decimal('actual_amount', 15, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 14. Maintenance Schedules (Program Preventative Maintenance HM/KM/Kalender)
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->string('service_type', 50)->index(); // PM_250, PM_500, PM_1000, PM_2000, etc.
            $table->string('schedule_basis', 20)->default('hm'); // hm, km, calendar
            $table->integer('interval_value'); // e.g. 250, 500, 1000, 2000
            $table->date('last_service_date')->nullable();
            $table->decimal('last_service_hm', 12, 2)->default(0);
            $table->decimal('last_service_km', 12, 2)->default(0);
            $table->date('next_due_date')->nullable();
            $table->decimal('next_due_hm', 12, 2)->nullable();
            $table->decimal('next_due_km', 12, 2)->nullable();
            $table->string('status', 20)->default('normal')->index(); // normal, due_soon, overdue, in_service
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
        Schema::dropIfExists('maintenance_costs');
        Schema::dropIfExists('rfu_approvals');
        Schema::dropIfExists('maintenance_inspections');
        Schema::dropIfExists('sparepart_request_items');
        Schema::dropIfExists('sparepart_requests');
        Schema::dropIfExists('job_card_checklists');
        Schema::dropIfExists('job_cards');
        Schema::dropIfExists('mechanic_work_logs');
        Schema::dropIfExists('work_order_tasks');
        Schema::dropIfExists('work_order_assignments');
        Schema::dropIfExists('maintenance_requests');
        Schema::dropIfExists('breakdown_reports');

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropForeign(['site_id']);
            $table->dropForeign(['maintenance_request_id']);
            $table->dropForeign(['breakdown_report_id']);
            $table->dropForeign(['supervisor_id']);
            $table->dropForeign(['approver_id']);
            $table->dropColumn([
                'site_id',
                'maintenance_request_id',
                'breakdown_report_id',
                'job_type',
                'target_completion_date',
                'actual_completion_date',
                'hm_at_service',
                'km_at_service',
                'initial_complaint',
                'diagnosis',
                'root_cause',
                'supervisor_id',
                'estimated_cost',
                'actual_cost',
                'rfu_status',
                'approval_status',
                'approver_id',
                'approved_at',
            ]);
        });
    }
};
