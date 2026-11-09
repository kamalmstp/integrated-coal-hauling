<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('report_export_jobs')) {
            Schema::create('report_export_jobs', function (Blueprint $table) {
                $table->id();
                $table->string('export_code', 50)->unique();
                $table->string('report_type', 50); // executive, production, fleet, maintenance, warehouse_procurement, fuel
                $table->string('export_format', 24); // excel, pdf, printable
                $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
                $table->json('filters')->nullable();
                $table->unsignedInteger('row_count')->default(0);
                $table->string('status', 24)->default('queued'); // queued, processing, completed, failed
                $table->boolean('is_background_job')->default(true);
                $table->string('file_path')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('report_export_jobs');
    }
};
