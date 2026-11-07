<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class P2hInspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'p2h_inspections';

    protected $fillable = [
        'inspection_number',
        'unit_id',
        'driver_id',
        'shift_id',
        'inspection_date',
        'inspection_time',
        'current_hm',
        'current_km',
        'overall_condition',
        'has_critical_defect',
        'driver_notes',
        'driver_signature_hash',
        'is_acknowledged',
        'supervisor_id',
        'supervisor_notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'current_hm' => 'decimal:2',
        'current_km' => 'decimal:2',
        'has_critical_defect' => 'boolean',
        'is_acknowledged' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function items()
    {
        return $this->hasMany(P2hItem::class, 'p2h_inspection_id');
    }

    public function workOrder()
    {
        return $this->hasOne(WorkOrder::class, 'p2h_inspection_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
