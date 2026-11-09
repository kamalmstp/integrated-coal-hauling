<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'adjustment_number',
        'site_id',
        'fuel_tank_id',
        'fuel_sounding_id',
        'adjustment_date',
        'adjustment_type',
        'system_stock_before_liters',
        'adjustment_liters',
        'physical_stock_after_liters',
        'unit_cost',
        'total_adjustment_value',
        'status',
        'reason',
        'investigation_notes',
        'requested_by',
        'approved_by',
        'approved_at',
        'fuel_transaction_id',
    ];

    protected $casts = [
        'adjustment_date' => 'date',
        'system_stock_before_liters' => 'decimal:2',
        'adjustment_liters' => 'decimal:2',
        'physical_stock_after_liters' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_adjustment_value' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function tank()
    {
        return $this->belongsTo(FuelTank::class, 'fuel_tank_id');
    }

    public function sounding()
    {
        return $this->belongsTo(FuelSounding::class, 'fuel_sounding_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transaction()
    {
        return $this->belongsTo(FuelTransaction::class, 'fuel_transaction_id');
    }
}
