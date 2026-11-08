<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodsReceipt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'grn_number',
        'purchase_order_id',
        'vendor_id',
        'site_id',
        'warehouse_id',
        'receipt_date',
        'delivery_note_number',
        'received_by',
        'inspected_by',
        'receipt_type',
        'status',
        'inventory_transaction_id',
        'total_received_value',
        'remarks',
        'attachment_path',
        'created_by',
    ];

    protected $casts = [
        'receipt_date' => 'date',
        'total_received_value' => 'decimal:2',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function receiver()
    {
        return $this->belongsTo(Employee::class, 'received_by');
    }

    public function inspector()
    {
        return $this->belongsTo(Employee::class, 'inspected_by');
    }

    public function inventoryTransaction()
    {
        return $this->belongsTo(InventoryTransaction::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }
}
