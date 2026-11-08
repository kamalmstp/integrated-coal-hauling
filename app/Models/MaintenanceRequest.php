<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'maintenance_requests';

    protected $fillable = [
        'request_number',
        'site_id',
        'unit_id',
        'breakdown_report_id',
        'p2h_inspection_id',
        'requested_by',
        'requester_name',
        'damage_category',
        'work_description',
        'priority',
        'request_date',
        'attachment_path',
        'status',
        'approval_status',
        'approver_id',
        'approval_notes',
        'approved_at',
        'work_order_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'request_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function breakdownReport(): BelongsTo
    {
        return $this->belongsTo(BreakdownReport::class, 'breakdown_report_id');
    }

    public function p2hInspection(): BelongsTo
    {
        return $this->belongsTo(P2hInspection::class, 'p2h_inspection_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'work_order_id');
    }
}
