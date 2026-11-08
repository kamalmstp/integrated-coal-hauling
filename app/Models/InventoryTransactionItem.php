<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_transaction_id',
        'site_id',
        'warehouse_id',
        'warehouse_location_id',
        'inventory_item_id',
        'direction',
        'transaction_type',
        'transaction_datetime',
        'opening_balance_qty',
        'qty_in',
        'qty_out',
        'running_balance_qty',
        'unit',
        'unit_cost',
        'moving_average_cost',
        'total_cost',
        'running_valuation',
        'reference_document',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'transaction_datetime' => 'datetime',
        'opening_balance_qty' => 'decimal:2',
        'qty_in' => 'decimal:2',
        'qty_out' => 'decimal:2',
        'running_balance_qty' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'moving_average_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'running_valuation' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(InventoryTransaction::class, 'inventory_transaction_id');
    }

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

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
