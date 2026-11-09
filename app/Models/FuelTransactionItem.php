<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelTransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'fuel_transaction_id',
        'fuel_tank_id',
        'unit_id',
        'movement_direction',
        'fuel_grade',
        'quantity_liters',
        'unit_cost',
        'subtotal_cost',
        'balance_before_liters',
        'balance_after_liters',
        'notes',
    ];

    protected $casts = [
        'quantity_liters' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'subtotal_cost' => 'decimal:2',
        'balance_before_liters' => 'decimal:2',
        'balance_after_liters' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(FuelTransaction::class, 'fuel_transaction_id');
    }

    public function tank()
    {
        return $this->belongsTo(FuelTank::class, 'fuel_tank_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
