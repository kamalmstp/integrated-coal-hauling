<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelReceipt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_number',
        'receipt_type',
        'receipt_date',
        'site_id',
        'fuel_supplier_id',
        'purchase_order_id',
        'po_number',
        'do_number',
        'invoice_number',
        'invoice_date',
        'invoice_status',
        'transport_vehicle_no',
        'driver_name',
        'total_do_liters',
        'total_received_liters',
        'total_amount',
        'status',
        'received_by',
        'created_by',
        'remarks',
        'attachment_path',
    ];

    protected $casts = [
        'receipt_date' => 'date',
        'invoice_date' => 'date',
        'total_do_liters' => 'decimal:2',
        'total_received_liters' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function supplier()
    {
        return $this->belongsTo(FuelSupplier::class, 'fuel_supplier_id');
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function receiver()
    {
        return $this->belongsTo(Employee::class, 'received_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(FuelReceiptItem::class);
    }
}
