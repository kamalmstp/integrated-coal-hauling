<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'work_orders';

    protected $fillable = [
        'wo_number',
        'site_id',
        'unit_id',
        'p2h_inspection_id',
        'maintenance_request_id',
        'breakdown_report_id',
        'source',
        'job_type',
        'priority',
        'breakdown_time',
        'start_repair_time',
        'completion_time',
        'target_completion_date',
        'actual_completion_date',
        'downtime_minutes',
        'hm_at_service',
        'km_at_service',
        'initial_complaint',
        'defect_summary',
        'diagnosis',
        'action_taken',
        'root_cause',
        'assigned_mechanic_id',
        'supervisor_id',
        'estimated_cost',
        'actual_cost',
        'status',
        'rfu_status',
        'approval_status',
        'approver_id',
        'approved_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'breakdown_time' => 'datetime',
        'start_repair_time' => 'datetime',
        'completion_time' => 'datetime',
        'target_completion_date' => 'datetime',
        'actual_completion_date' => 'datetime',
        'approved_at' => 'datetime',
        'hm_at_service' => 'decimal:2',
        'km_at_service' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function p2hInspection(): BelongsTo
    {
        return $this->belongsTo(P2hInspection::class, 'p2h_inspection_id');
    }

    public function maintenanceRequest(): BelongsTo
    {
        return $this->belongsTo(MaintenanceRequest::class, 'maintenance_request_id');
    }

    public function breakdownReport(): BelongsTo
    {
        return $this->belongsTo(BreakdownReport::class, 'breakdown_report_id');
    }

    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_mechanic_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(WorkOrderAssignment::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(WorkOrderTask::class);
    }

    public function mechanicLogs(): HasMany
    {
        return $this->hasMany(MechanicWorkLog::class);
    }

    public function jobCard(): HasOne
    {
        return $this->hasOne(JobCard::class);
    }

    public function sparepartRequests(): HasMany
    {
        return $this->hasMany(SparepartRequest::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(MaintenanceInspection::class);
    }

    public function latestInspection(): HasOne
    {
        return $this->hasOne(MaintenanceInspection::class)->latestOfMany();
    }

    public function rfuApproval(): HasOne
    {
        return $this->hasOne(RfuApproval::class);
    }

    public function costs(): HasMany
    {
        return $this->hasMany(MaintenanceCost::class);
    }
}
