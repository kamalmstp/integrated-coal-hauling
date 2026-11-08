<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'document_number',
        'transaction_date',
        'transaction_datetime',
        'direction',
        'transaction_type',
        'site_id',
        'warehouse_id',
        'reference_type',
        'reference_id',
        'reference_document',
        'unit_id',
        'work_order_id',
        'sparepart_request_id',
        'vendor_id',
        'requester_id',
        'approver_id',
        'storeman_id',
        'status',
        'total_amount',
        'remarks',
        'attachment_path',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'transaction_datetime' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function sparepartRequest()
    {
        return $this->belongsTo(SparepartRequest::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function requester()
    {
        return $this->belongsTo(Employee::class, 'requester_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function storeman()
    {
        return $this->belongsTo(Employee::class, 'storeman_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(InventoryTransactionItem::class);
    }
}
