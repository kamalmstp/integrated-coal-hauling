<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'po_number',
        'site_id',
        'warehouse_id',
        'department_id',
        'purchase_request_id',
        'rfq_id',
        'quotation_comparison_id',
        'vendor_quotation_id',
        'vendor_id',
        'po_date',
        'expected_delivery_date',
        'delivery_location',
        'payment_terms',
        'purchase_category',
        'subtotal_amount',
        'discount_amount',
        'tax_percent',
        'tax_amount',
        'grand_total',
        'terms_and_conditions',
        'approval_status',
        'status',
        'current_approval_step',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery_date' => 'date',
        'approved_at' => 'datetime',
        'subtotal_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_percent' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'current_approval_step' => 'integer',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    public function comparison()
    {
        return $this->belongsTo(QuotationComparison::class, 'quotation_comparison_id');
    }

    public function vendorQuotation()
    {
        return $this->belongsTo(VendorQuotation::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function approvals()
    {
        return $this->hasMany(PurchaseApproval::class, 'purchase_order_id')->orderBy('step_order');
    }

    public function goodsReceipts()
    {
        return $this->hasMany(GoodsReceipt::class);
    }

    public function invoices()
    {
        return $this->hasMany(VendorInvoice::class);
    }
}
