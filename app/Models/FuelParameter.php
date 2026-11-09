<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelParameter extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'estimation_factor',
        'default_haul_distance_km',
        'standard_fuel_price_per_liter',
        'low_stock_threshold_percent',
        'variance_tolerance_percent',
        'max_dispense_per_tx_liter',
        'authorization_notes',
        'updated_by',
    ];

    protected $casts = [
        'estimation_factor' => 'decimal:6',
        'default_haul_distance_km' => 'decimal:2',
        'standard_fuel_price_per_liter' => 'decimal:2',
        'low_stock_threshold_percent' => 'decimal:2',
        'variance_tolerance_percent' => 'decimal:2',
        'max_dispense_per_tx_liter' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
