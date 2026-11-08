<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderAssignment extends Model
{
    use HasFactory;

    protected $table = 'work_order_assignments';

    protected $fillable = [
        'work_order_id',
        'mechanic_id',
        'role',
        'assigned_date',
        'working_hours',
        'notes',
        'status',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'working_hours' => 'decimal:2',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'mechanic_id');
    }
}
