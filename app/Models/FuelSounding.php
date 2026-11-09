<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelSounding extends Model
{
    use HasFactory;

    protected $fillable = [
        'sounding_number',
        'site_id',
        'fuel_tank_id',
        'sounding_date',
        'sounding_time',
        'measurement_cm',
        'water_level_cm',
        'temperature_celsius',
        'calibration_method',
        'conversion_snapshot',
        'estimated_volume_liters',
        'system_stock_liters',
        'variance_liters',
        'variance_percent',
        'reconciliation_status',
        'recorded_by',
        'attachment_path',
        'remarks',
    ];

    protected $casts = [
        'sounding_date' => 'date',
        'measurement_cm' => 'decimal:2',
        'water_level_cm' => 'decimal:2',
        'temperature_celsius' => 'decimal:2',
        'conversion_snapshot' => 'array',
        'estimated_volume_liters' => 'decimal:2',
        'system_stock_liters' => 'decimal:2',
        'variance_liters' => 'decimal:2',
        'variance_percent' => 'decimal:4',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function tank()
    {
        return $this->belongsTo(FuelTank::class, 'fuel_tank_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
