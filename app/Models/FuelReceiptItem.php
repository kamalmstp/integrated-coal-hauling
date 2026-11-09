<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'fuel_receipt_id',
        'fuel_tank_id',
        'do_volume_liters',
        'received_volume_liters',
        'temperature_celsius',
        'density_kg_m3',
        'flowmeter_start',
        'flowmeter_end',
        'sounding_before_cm',
        'sounding_after_cm',
        'unit_price',
        'subtotal_amount',
        'stock_before_liters',
        'stock_after_liters',
        'remarks',
    ];

    protected $casts = [
        'do_volume_liters' => 'decimal:2',
        'received_volume_liters' => 'decimal:2',
        'temperature_celsius' => 'decimal:2',
        'density_kg_m3' => 'decimal:4',
        'flowmeter_start' => 'decimal:2',
        'flowmeter_end' => 'decimal:2',
        'sounding_before_cm' => 'decimal:2',
        'sounding_after_cm' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal_amount' => 'decimal:2',
        'stock_before_liters' => 'decimal:2',
        'stock_after_liters' => 'decimal:2',
    ];

    public function receipt()
    {
        return $this->belongsTo(FuelReceipt::class, 'fuel_receipt_id');
    }

    public function tank()
    {
        return $this->belongsTo(FuelTank::class, 'fuel_tank_id');
    }
}
