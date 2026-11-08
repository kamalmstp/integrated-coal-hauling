<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rfq extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rfq_number',
        'purchase_request_id',
        'site_id',
        'issue_date',
        'closing_date',
        'title',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'closing_date' => 'date',
    ];

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invitedVendors()
    {
        return $this->hasMany(RfqVendor::class);
    }

    public function quotations()
    {
        return $this->hasMany(VendorQuotation::class);
    }

    public function comparisons()
    {
        return $this->hasMany(QuotationComparison::class);
    }
}
