<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'work_orders';

    protected $fillable = [
        'wo_number',
        'unit_id',
        'p2h_inspection_id',
        'source',
        'priority',
        'breakdown_time',
        'start_repair_time',
        'completion_time',
        'downtime_minutes',
        'defect_summary',
        'action_taken',
        'assigned_mechanic_id',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'breakdown_time' => 'datetime',
        'start_repair_time' => 'datetime',
        'completion_time' => 'datetime',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function p2hInspection()
    {
        return $this->belongsTo(P2hInspection::class, 'p2h_inspection_id');
    }

    public function mechanic()
    {
        return $this->belongsTo(Employee::class, 'assigned_mechanic_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
