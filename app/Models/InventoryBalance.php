<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'warehouse_id',
        'warehouse_location_id',
        'inventory_item_id',
        'on_hand_qty',
        'reserved_qty',
        'available_qty',
        'average_unit_cost',
        'total_value',
        'last_in_date',
        'last_out_date',
        'last_movement_date',
    ];

    protected $casts = [
        'on_hand_qty' => 'decimal:2',
        'reserved_qty' => 'decimal:2',
        'available_qty' => 'decimal:2',
        'average_unit_cost' => 'decimal:2',
        'total_value' => 'decimal:2',
        'last_in_date' => 'datetime',
        'last_out_date' => 'datetime',
        'last_movement_date' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function location()
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_id');
    }

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
