<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'site_id',
        'item_code',
        'part_number',
        'barcode',
        'item_name',
        'category_id',
        'category_code',
        'brand',
        'specification',
        'unit_of_measurement',
        'minimum_stock',
        'maximum_stock',
        'reorder_point',
        'default_warehouse_id',
        'default_location_id',
        'standard_cost',
        'is_active',
    ];

    protected $casts = [
        'minimum_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'standard_cost' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['name', 'uom', 'category'];

    public function getNameAttribute(): ?string
    {
        return $this->item_name;
    }

    public function getUomAttribute(): ?string
    {
        return $this->unit_of_measurement;
    }

    public function getCategoryAttribute(): ?string
    {
        return $this->category_code;
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function category()
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    public function defaultWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'default_warehouse_id');
    }

    public function defaultLocation()
    {
        return $this->belongsTo(WarehouseLocation::class, 'default_location_id');
    }

    public function balances()
    {
        return $this->hasMany(InventoryBalance::class);
    }

    public function transactionItems()
    {
        return $this->hasMany(InventoryTransactionItem::class);
    }
}
