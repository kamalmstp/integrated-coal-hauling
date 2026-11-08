<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_number',
        'site_id',
        'warehouse_id',
        'inventory_item_id',
        'sparepart_request_id',
        'sparepart_request_item_id',
        'work_order_id',
        'reserved_qty',
        'fulfilled_qty',
        'status',
        'reserved_by',
        'reserved_at',
    ];

    protected $casts = [
        'reserved_qty' => 'decimal:2',
        'fulfilled_qty' => 'decimal:2',
        'reserved_at' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function sparepartRequest()
    {
        return $this->belongsTo(SparepartRequest::class);
    }

    public function sparepartRequestItem()
    {
        return $this->belongsTo(SparepartRequestItem::class);
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function reserver()
    {
        return $this->belongsTo(User::class, 'reserved_by');
    }
}
