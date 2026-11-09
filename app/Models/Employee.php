<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_code',
        'nik',
        'name',
        'birth_place',
        'birth_date',
        'gender',
        'marital_status',
        'company_id',
        'site_id',
        'department_id',
        'position_id',
        'join_date',
        'employment_status',
        'phone',
        'email',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'document_notes',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'npwp_number',
        'bpjs_kesehatan_number',
        'bpjs_ketenagakerjaan_number',
        'is_active',
        'resignation_date',
        'termination_date',
        'separation_reason',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'resignation_date' => 'date',
        'termination_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function driver(): HasOne
    {
        return $this->hasOne(Driver::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(EmploymentContract::class)->orderByDesc('start_date');
    }

    public function activeContract(): HasOne
    {
        return $this->hasOne(EmploymentContract::class)->where('status', 'active')->latestOfMany('start_date');
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(EmployeeTransfer::class)->orderByDesc('effective_date');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(EmployeeStatusHistory::class)->orderByDesc('effective_date')->orderByDesc('id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class)->orderByDesc('id');
    }

    public function shiftAssignments(): HasMany
    {
        return $this->hasMany(ShiftAssignment::class)->orderByDesc('roster_date');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class)->orderByDesc('attendance_date');
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class)->orderByDesc('start_date');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
