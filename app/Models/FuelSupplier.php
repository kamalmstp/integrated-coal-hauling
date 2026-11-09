<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelSupplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_code',
        'name',
        'vendor_id',
        'contact_person',
        'phone',
        'email',
        'address',
        'fuel_type',
        'contract_number',
        'contract_price_per_liter',
        'payment_terms',
        'is_active',
    ];

    protected $casts = [
        'contract_price_per_liter' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function receipts()
    {
        return $this->hasMany(FuelReceipt::class);
    }
}
