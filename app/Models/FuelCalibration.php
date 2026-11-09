<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelCalibration extends Model
{
    use HasFactory;

    protected $fillable = [
        'fuel_tank_id',
        'height_cm',
        'volume_liters',
        'mm_increment_factor',
        'calibration_certificate_no',
        'calibrated_date',
    ];

    protected $casts = [
        'height_cm' => 'decimal:2',
        'volume_liters' => 'decimal:2',
        'mm_increment_factor' => 'decimal:4',
        'calibrated_date' => 'date',
    ];

    public function tank()
    {
        return $this->belongsTo(FuelTank::class, 'fuel_tank_id');
    }
}
