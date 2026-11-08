<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MechanicWorkLog extends Model
{
    use HasFactory;

    protected $table = 'mechanic_work_logs';

    protected $fillable = [
        'work_order_id',
        'mechanic_id',
        'log_date',
        'start_time',
        'end_time',
        'duration_hours',
        'diagnosis',
        'action_taken',
        'work_notes',
        'photo_before',
        'photo_after',
        'status_update',
    ];

    protected $casts = [
        'log_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'duration_hours' => 'decimal:2',
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
