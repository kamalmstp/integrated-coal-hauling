<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationComparison extends Model
{
    use HasFactory;

    protected $fillable = [
        'comparison_number',
        'rfq_id',
        'purchase_request_id',
        'site_id',
        'comparison_date',
        'selected_quotation_id',
        'selected_vendor_id',
        'lowest_price_quotation_id',
        'fastest_delivery_quotation_id',
        'best_payment_terms_quotation_id',
        'comparison_matrix',
        'selection_remarks',
        'evaluated_by',
        'approved_by',
        'approved_at',
        'status',
    ];

    protected $casts = [
        'comparison_date' => 'date',
        'approved_at' => 'datetime',
        'comparison_matrix' => 'array',
    ];

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function selectedQuotation()
    {
        return $this->belongsTo(VendorQuotation::class, 'selected_quotation_id');
    }

    public function selectedVendor()
    {
        return $this->belongsTo(Vendor::class, 'selected_vendor_id');
    }

    public function lowestPriceQuotation()
    {
        return $this->belongsTo(VendorQuotation::class, 'lowest_price_quotation_id');
    }

    public function fastestDeliveryQuotation()
    {
        return $this->belongsTo(VendorQuotation::class, 'fastest_delivery_quotation_id');
    }

    public function bestPaymentTermsQuotation()
    {
        return $this->belongsTo(VendorQuotation::class, 'best_payment_terms_quotation_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
