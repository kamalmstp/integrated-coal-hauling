<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HaulingActivity extends Model
{
    use HasFactory;

    protected $table = 'hauling_activities';

    protected $fillable = [
        'dispatch_assignment_id',
        'unit_id',
        'driver_id',
        'loading_point_id',
        'dumping_point_id',
        'material_id',
        'shift_id',
        'activity_date',
        'loading_start_time',
        'loading_end_time',
        'hauling_start_time',
        'dumping_time',
        'journey_status',
        'delay_type',
        'delay_duration_minutes',
        'delay_notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'loading_start_time' => 'datetime',
        'loading_end_time' => 'datetime',
        'hauling_start_time' => 'datetime',
        'dumping_time' => 'datetime',
    ];

    public function assignment()
    {
        return $this->belongsTo(DispatchAssignment::class, 'dispatch_assignment_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function loadingPoint()
    {
        return $this->belongsTo(Location::class, 'loading_point_id');
    }

    public function dumpingPoint()
    {
        return $this->belongsTo(Location::class, 'dumping_point_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
