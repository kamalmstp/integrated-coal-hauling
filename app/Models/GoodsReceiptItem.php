<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoodsReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'goods_receipt_id',
        'purchase_order_item_id',
        'inventory_item_id',
        'warehouse_location_id',
        'qty_ordered',
        'qty_previously_received',
        'qty_delivered',
        'qty_accepted',
        'qty_damaged',
        'qty_rejected',
        'qty_over_delivery',
        'qty_under_delivery',
        'unit',
        'unit_price',
        'total_accepted_value',
        'delivery_status',
        'condition_notes',
    ];

    protected $casts = [
        'qty_ordered' => 'decimal:2',
        'qty_previously_received' => 'decimal:2',
        'qty_delivered' => 'decimal:2',
        'qty_accepted' => 'decimal:2',
        'qty_damaged' => 'decimal:2',
        'qty_rejected' => 'decimal:2',
        'qty_over_delivery' => 'decimal:2',
        'qty_under_delivery' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_accepted_value' => 'decimal:2',
    ];

    public function goodsReceipt()
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function poItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class, 'purchase_order_item_id');
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function location()
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_id');
    }
}
