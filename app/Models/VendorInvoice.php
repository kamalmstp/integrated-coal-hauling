<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorInvoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'vendor_invoice_number',
        'invoice_date',
        'payment_due_date',
        'site_id',
        'vendor_id',
        'purchase_order_id',
        'goods_receipt_id',
        'po_reference',
        'grn_reference',
        'subtotal_amount',
        'tax_amount',
        'total_invoice_amount',
        'matched_po_amount',
        'matched_grn_amount',
        'variance_amount',
        'is_three_way_matched',
        'verification_status',
        'attachment_path',
        'verified_by',
        'verified_at',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'payment_due_date' => 'date',
        'subtotal_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_invoice_amount' => 'decimal:2',
        'matched_po_amount' => 'decimal:2',
        'matched_grn_amount' => 'decimal:2',
        'variance_amount' => 'decimal:2',
        'is_three_way_matched' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function goodsReceipt()
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
