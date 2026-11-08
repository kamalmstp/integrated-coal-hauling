<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'site_id',
        'code',
        'name',
        'warehouse_type',
        'location_address',
        'storeman_id',
        'capacity',
        'status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function storeman()
    {
        return $this->belongsTo(Employee::class, 'storeman_id');
    }

    public function locations()
    {
        return $this->hasMany(WarehouseLocation::class);
    }

    public function balances()
    {
        return $this->hasMany(InventoryBalance::class);
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}
