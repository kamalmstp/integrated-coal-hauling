<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorQuotationItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_quotation_id',
        'purchase_request_item_id',
        'inventory_item_id',
        'item_name',
        'specification',
        'quantity',
        'unit',
        'unit_price',
        'discount_amount',
        'tax_rate',
        'total_price',
        'delivery_days',
        'brand_offered',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'total_price' => 'decimal:2',
        'delivery_days' => 'integer',
    ];

    public function quotation()
    {
        return $this->belongsTo(VendorQuotation::class, 'vendor_quotation_id');
    }

    public function prItem()
    {
        return $this->belongsTo(PurchaseRequestItem::class, 'purchase_request_item_id');
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
