<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelTank extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tank_number',
        'tank_name',
        'site_id',
        'location_id',
        'unit_id',
        'tank_type',
        'shape_type',
        'capacity_liters',
        'dead_stock_liters',
        'minimum_alert_liters',
        'max_height_cm',
        'length_cm',
        'diameter_cm',
        'opening_stock_liters',
        'current_stock_liters',
        'average_cost_per_liter',
        'last_sounding_at',
        'last_sounding_cm',
        'last_sounding_liters',
        'is_active',
    ];

    protected $casts = [
        'capacity_liters' => 'decimal:2',
        'dead_stock_liters' => 'decimal:2',
        'minimum_alert_liters' => 'decimal:2',
        'max_height_cm' => 'decimal:2',
        'length_cm' => 'decimal:2',
        'diameter_cm' => 'decimal:2',
        'opening_stock_liters' => 'decimal:2',
        'current_stock_liters' => 'decimal:2',
        'average_cost_per_liter' => 'decimal:2',
        'last_sounding_at' => 'datetime',
        'last_sounding_cm' => 'decimal:2',
        'last_sounding_liters' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['tank_code'];

    public function getTankCodeAttribute(): ?string
    {
        return $this->tank_number;
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function calibrations()
    {
        return $this->hasMany(FuelCalibration::class)->orderBy('height_cm');
    }

    public function soundings()
    {
        return $this->hasMany(FuelSounding::class)->orderByDesc('sounding_date')->orderByDesc('sounding_time');
    }

    public function receiptItems()
    {
        return $this->hasMany(FuelReceiptItem::class);
    }

    public function outgoingTransactions()
    {
        return $this->hasMany(FuelTransaction::class, 'source_tank_id');
    }

    public function incomingTransactions()
    {
        return $this->hasMany(FuelTransaction::class, 'destination_tank_id');
    }

    public function reconciliations()
    {
        return $this->hasMany(FuelReconciliation::class);
    }
}
