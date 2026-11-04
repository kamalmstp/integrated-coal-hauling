<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispatchAssignment extends Model
{
    use HasFactory;

    protected $table = 'dispatch_assignments';

    protected $fillable = [
        'daily_dispatch_id',
        'unit_id',
        'driver_id',
        'loading_point_id',
        'dumping_point_id',
        'material_id',
        'target_ritase',
        'actual_ritase',
        'status',
        'start_time',
        'end_time',
        'remarks',
        'created_by',
        'updated_by',
    ];

    public function dailyDispatch()
    {
        return $this->belongsTo(DailyDispatch::class);
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

    public function logs()
    {
        return $this->hasMany(DispatchAssignmentLog::class)->orderBy('created_at', 'desc');
    }

    public function haulingActivities()
    {
        return $this->hasMany(HaulingActivity::class);
    }
}
