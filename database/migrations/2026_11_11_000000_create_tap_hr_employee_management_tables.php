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
        // 1. Extend existing employees table with Phase 8 HR & Bank/Personal fields (NO duplicate employee table)
        Schema::table('employees', function (Blueprint $table) {
            if (!Schema::hasColumn('employees', 'birth_place')) {
                $table->string('birth_place', 100)->nullable()->after('name');
            }
            if (!Schema::hasColumn('employees', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('birth_place');
            }
            if (!Schema::hasColumn('employees', 'gender')) {
                $table->string('gender', 10)->default('L')->after('birth_date');
            }
            if (!Schema::hasColumn('employees', 'marital_status')) {
                $table->string('marital_status', 30)->nullable()->after('gender');
            }
            if (!Schema::hasColumn('employees', 'bank_name')) {
                $table->string('bank_name', 80)->nullable()->after('document_notes');
            }
            if (!Schema::hasColumn('employees', 'bank_account_number')) {
                $table->string('bank_account_number', 60)->nullable()->after('bank_name');
            }
            if (!Schema::hasColumn('employees', 'bank_account_holder')) {
                $table->string('bank_account_holder', 120)->nullable()->after('bank_account_number');
            }
            if (!Schema::hasColumn('employees', 'npwp_number')) {
                $table->string('npwp_number', 50)->nullable()->after('bank_account_holder');
            }
            if (!Schema::hasColumn('employees', 'bpjs_kesehatan_number')) {
                $table->string('bpjs_kesehatan_number', 50)->nullable()->after('npwp_number');
            }
            if (!Schema::hasColumn('employees', 'bpjs_ketenagakerjaan_number')) {
                $table->string('bpjs_ketenagakerjaan_number', 50)->nullable()->after('bpjs_kesehatan_number');
            }
            if (!Schema::hasColumn('employees', 'resignation_date')) {
                $table->date('resignation_date')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('employees', 'termination_date')) {
                $table->date('termination_date')->nullable()->after('resignation_date');
            }
            if (!Schema::hasColumn('employees', 'separation_reason')) {
                $table->text('separation_reason')->nullable()->after('termination_date');
            }
        });

        // 2. Extend existing drivers table with Administrative Eligibility & Unit Assignment (NO duplicate driver table)
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'administrative_eligibility_status')) {
                $table->string('administrative_eligibility_status', 40)->default('eligible')->after('mcu_expiry')->index();
            }
            if (!Schema::hasColumn('drivers', 'assigned_unit_id')) {
                $table->foreignId('assigned_unit_id')->nullable()->after('administrative_eligibility_status')->constrained('units')->nullOnDelete();
            }
            if (!Schema::hasColumn('drivers', 'training_status')) {
                $table->string('training_status', 40)->default('certified')->after('assigned_unit_id');
            }
            if (!Schema::hasColumn('drivers', 'last_training_date')) {
                $table->date('last_training_date')->nullable()->after('training_status');
            }
        });

        // 3. HR Site Settings (Time validation & Expiry Reminder Configuration per Site)
        Schema::create('hr_site_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->unique()->constrained('sites')->cascadeOnDelete();
            $table->integer('check_in_grace_minutes')->default(15);
            $table->integer('earliest_check_in_minutes_before')->default(90);
            $table->decimal('max_overtime_hours_per_day', 5, 2)->default(4.00);
            $table->integer('contract_reminder_days')->default(30);
            $table->integer('document_reminder_days')->default(30);
            $table->boolean('require_gps_on_mobile')->default(true);
            $table->string('timezone', 50)->default('Asia/Makassar');
            $table->timestamps();
        });

        // 4. Employment Contracts (PKWT, PKWTT, Contract Start/End, Extension, Resignation, Termination)
        Schema::create('employment_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number', 60)->unique();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('contract_type', 30)->index(); // PKWT, PKWTT, Probation, Addendum_Extension
            $table->integer('sequence_number')->default(1);
            $table->foreignId('parent_contract_id')->nullable()->constrained('employment_contracts')->nullOnDelete();
            $table->date('start_date')->index();
            $table->date('end_date')->nullable()->index();
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->string('status', 30)->default('active')->index(); // active, extended, expired, resigned, terminated
            $table->string('separation_type', 30)->default('none'); // none, resignation, termination, end_of_contract
            $table->date('separation_date')->nullable();
            $table->text('separation_reason')->nullable();
            $table->string('document_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Employee Transfers (Inter-Site Mutation, Department/Position Transfer & Driver Site History)
        Schema::create('employee_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number', 60)->unique();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('transfer_type', 40)->default('site_mutation'); // site_mutation, department_transfer, promotion, demotion, rotation
            $table->date('effective_date')->index();
            $table->foreignId('from_site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('to_site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('from_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('to_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('from_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->foreignId('to_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('status', 30)->default('completed')->index(); // pending, approved, completed, rejected
            $table->text('reason');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
        });

        // 6. Employee Status Histories (Audit Trail of Employment Status & Site History)
        Schema::create('employee_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('event_type', 40)->index(); // hired, contract_created, contract_extended, promoted_pkwtt, site_transfer, resignation, termination, status_change
            $table->string('old_employment_status', 40)->nullable();
            $table->string('new_employment_status', 40)->nullable();
            $table->foreignId('old_site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->foreignId('new_site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->date('effective_date')->index();
            $table->string('reference_number', 60)->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 7. Driver Trainings (Defensive Driving, K3LH, SIMPER Refreshment)
        Schema::create('driver_trainings', function (Blueprint $table) {
            $table->id();
            $table->string('training_code', 60)->unique();
            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('training_name', 160);
            $table->string('training_category', 50)->default('safety_k3lh'); // safety_k3lh, defensive_driving, technical_unit, simper_certification
            $table->string('provider', 120)->default('TAP HSE & Training Academy');
            $table->date('training_date');
            $table->date('expiry_date')->nullable();
            $table->decimal('score', 5, 2)->default(90.00);
            $table->string('certificate_number', 80)->nullable();
            $table->string('status', 30)->default('passed'); // passed, scheduled, expired, failed
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. Shift Assignments (Employee & Driver Roster per Shift & Site)
        Schema::create('shift_assignments', function (Blueprint $table) {
            $table->id();
            $table->string('assignment_code', 60)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->date('roster_date')->index();
            $table->string('work_status', 30)->default('scheduled'); // scheduled, off_roster, field_break, leave
            $table->foreignId('assigned_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('notes')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['employee_id', 'roster_date'], 'emp_roster_date_unique');
        });

        // 9. Attendances (Check In, Check Out, Mobile HP Input, Overtime, Absence, Approval)
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->string('attendance_number', 60)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->foreignId('shift_assignment_id')->nullable()->constrained('shift_assignments')->nullOnDelete();
            $table->date('attendance_date')->index();
            $table->string('status', 30)->default('present')->index(); // present, late, absent, on_leave, sick, permit, off_day
            $table->dateTime('check_in_at')->nullable();
            $table->dateTime('check_out_at')->nullable();
            $table->time('scheduled_start_time')->nullable();
            $table->time('scheduled_end_time')->nullable();
            $table->integer('late_minutes')->default(0);
            $table->decimal('work_duration_hours', 6, 2)->default(0);
            $table->decimal('overtime_hours', 6, 2)->default(0);
            $table->string('overtime_reason')->nullable();
            $table->string('overtime_status', 30)->default('none'); // none, pending, approved, rejected
            $table->string('input_source', 30)->default('mobile_hp'); // mobile_hp, web_portal, biometric_gate, supervisor_entry
            $table->string('device_info', 120)->nullable();
            $table->decimal('gps_latitude', 10, 8)->nullable();
            $table->decimal('gps_longitude', 11, 8)->nullable();
            $table->string('approval_status', 30)->default('approved'); // pending, approved, rejected, corrected
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'attendance_date'], 'emp_attendance_date_unique');
        });

        // 10. Attendance Corrections
        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();
            $table->string('correction_number', 60)->unique();
            $table->foreignId('attendance_id')->constrained('attendances')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->dateTime('requested_check_in_at')->nullable();
            $table->dateTime('requested_check_out_at')->nullable();
            $table->decimal('requested_overtime_hours', 6, 2)->default(0);
            $table->text('reason');
            $table->string('status', 30)->default('pending'); // pending, approved, rejected
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 11. Leave Requests (Annual Leave, Sick Leave, Field Break, Permit & Approval)
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->string('leave_number', 60)->unique();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('leave_type', 40)->index(); // annual_leave, sick_leave, roster_field_break, unpaid_leave, special_permit
            $table->date('start_date')->index();
            $table->date('end_date')->index();
            $table->integer('total_days')->default(1);
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->string('status', 30)->default('pending_approval')->index(); // pending_approval, approved, rejected, cancelled
            $table->foreignId('substitute_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 12. Employee Documents (KTP, SIM, SIMPER, MCU, Kontrak Kerja, Sertifikat Training with Sensitive Access Control)
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_code', 60)->unique();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('document_type', 40)->index(); // ktp, sim, simper, mcu, employment_contract, training_certificate, npwp_bpjs, supporting_document
            $table->string('document_title', 180);
            $table->string('document_number', 100)->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable()->index();
            $table->string('access_level', 40)->default('restricted_hr')->index(); // public_operational, restricted_hr, confidential_personal
            $table->boolean('is_sensitive')->default(true)->index();
            $table->string('file_path')->nullable();
            $table->string('verification_status', 30)->default('verified'); // verified, pending_verification, expired, rejected
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('shift_assignments');
        Schema::dropIfExists('driver_trainings');
        Schema::dropIfExists('employee_status_histories');
        Schema::dropIfExists('employee_transfers');
        Schema::dropIfExists('employment_contracts');
        Schema::dropIfExists('hr_site_settings');

        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'assigned_unit_id')) {
                $table->dropForeign(['assigned_unit_id']);
            }
            $cols = array_filter(
                ['administrative_eligibility_status', 'assigned_unit_id', 'training_status', 'last_training_date'],
                fn ($c) => Schema::hasColumn('drivers', $c)
            );
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });

        Schema::table('employees', function (Blueprint $table) {
            $cols = array_filter([
                'birth_place',
                'birth_date',
                'gender',
                'marital_status',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
                'npwp_number',
                'bpjs_kesehatan_number',
                'bpjs_ketenagakerjaan_number',
                'resignation_date',
                'termination_date',
                'separation_reason',
            ], fn ($c) => Schema::hasColumn('employees', $c));
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
