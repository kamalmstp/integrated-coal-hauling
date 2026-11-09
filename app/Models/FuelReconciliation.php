<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelReconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reconciliation_number',
        'site_id',
        'fuel_tank_id',
        'reconciliation_date',
        'opening_stock_liters',
        'fuel_received_liters',
        'fuel_issued_liters',
        'transfer_in_liters',
        'transfer_out_liters',
        'adjustment_liters',
        'system_closing_stock_liters',
        'physical_sounding_cm',
        'physical_sounding_liters',
        'variance_liters',
        'variance_percent',
        'status',
        'investigation_findings',
        'corrective_action',
        'fuel_sounding_id',
        'reconciled_by',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'reconciliation_date' => 'date',
        'opening_stock_liters' => 'decimal:2',
        'fuel_received_liters' => 'decimal:2',
        'fuel_issued_liters' => 'decimal:2',
        'transfer_in_liters' => 'decimal:2',
        'transfer_out_liters' => 'decimal:2',
        'adjustment_liters' => 'decimal:2',
        'system_closing_stock_liters' => 'decimal:2',
        'physical_sounding_cm' => 'decimal:2',
        'physical_sounding_liters' => 'decimal:2',
        'variance_liters' => 'decimal:2',
        'variance_percent' => 'decimal:4',
        'verified_at' => 'datetime',
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

    public function reconciler()
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
