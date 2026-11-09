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
        // 1. Add username to users table if not exists
        if (!Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('username', 50)->nullable()->unique()->after('name');
            });
        }

        // 2. User multi-site assignment pivot table
        if (!Schema::hasTable('user_has_sites')) {
            Schema::create('user_has_sites', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('site_id')->constrained('sites')->cascadeOnDelete();
                $table->boolean('is_default')->default(false);
                $table->timestamps();

                $table->unique(['user_id', 'site_id']);
            });
        }

        // 3. Login activity audit log table
        if (!Schema::hasTable('login_logs')) {
            Schema::create('login_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('login_input', 100)->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('status', 30)->default('success')->index(); // success, failed, locked, inactive_blocked
                $table->string('failure_reason')->nullable();
                $table->foreignId('active_site_id')->nullable()->constrained('sites')->nullOnDelete();
                $table->timestamp('login_at')->nullable()->index();
                $table->timestamp('logout_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_logs');
        Schema::dropIfExists('user_has_sites');

        if (Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('username');
            });
        }
    }
};
