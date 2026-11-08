<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SparepartRequestItem extends Model
{
    use HasFactory;

    protected $table = 'sparepart_request_items';

    protected $fillable = [
        'sparepart_request_id',
        'inventory_item_id',
        'warehouse_id',
        'warehouse_location_id',
        'part_number',
        'part_name',
        'category',
        'quantity_requested',
        'quantity_approved',
        'quantity_picked',
        'quantity_issued',
        'quantity_backorder',
        'quantity_returned',
        'unit',
        'unit_price',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity_requested' => 'decimal:2',
        'quantity_approved' => 'decimal:2',
        'quantity_picked' => 'decimal:2',
        'quantity_issued' => 'decimal:2',
        'quantity_backorder' => 'decimal:2',
        'quantity_returned' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(SparepartRequest::class, 'sparepart_request_id');
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_id');
    }
}
