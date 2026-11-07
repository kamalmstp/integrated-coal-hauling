<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FleetDailyKpi extends Model
{
    use HasFactory;

    protected $table = 'fleet_daily_kpis';

    protected $fillable = [
        'site_id',
        'unit_id',
        'date',
        'calendar_hours',
        'operating_hours',
        'standby_hours',
        'downtime_hours',
        'breakdown_count',
        'physical_availability_pa',
        'mechanical_availability_ma',
        'utilization_ua',
        'mttr_hours',
        'mtbf_hours',
    ];

    protected $casts = [
        'date' => 'date',
        'calendar_hours' => 'decimal:2',
        'operating_hours' => 'decimal:2',
        'standby_hours' => 'decimal:2',
        'downtime_hours' => 'decimal:2',
        'physical_availability_pa' => 'decimal:2',
        'mechanical_availability_ma' => 'decimal:2',
        'utilization_ua' => 'decimal:2',
        'mttr_hours' => 'decimal:2',
        'mtbf_hours' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
