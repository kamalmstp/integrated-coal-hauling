<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfuApproval extends Model
{
    use HasFactory;

    protected $table = 'rfu_approvals';

    protected $fillable = [
        'work_order_id',
        'unit_id',
        'maintenance_inspection_id',
        'approver_id',
        'approval_date',
        'decision',
        'approval_notes',
        'signature_hash',
    ];

    protected $casts = [
        'approval_date' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(MaintenanceInspection::class, 'maintenance_inspection_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'approver_id');
    }
}
