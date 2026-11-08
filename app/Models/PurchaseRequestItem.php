<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_request_id',
        'inventory_item_id',
        'current_stock',
        'minimum_stock',
        'reorder_point',
        'maximum_stock',
        'recommended_qty',
        'requested_qty',
        'unit',
        'estimated_unit_price',
        'estimated_subtotal',
        'notes',
    ];

    protected $casts = [
        'current_stock' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'recommended_qty' => 'decimal:2',
        'requested_qty' => 'decimal:2',
        'estimated_unit_price' => 'decimal:2',
        'estimated_subtotal' => 'decimal:2',
    ];

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
