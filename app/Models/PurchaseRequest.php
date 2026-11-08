<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pr_number',
        'site_id',
        'warehouse_id',
        'department_id',
        'work_order_id',
        'request_date',
        'required_date',
        'source',
        'purchase_category',
        'priority',
        'status',
        'current_approval_step',
        'estimated_total',
        'purpose',
        'requested_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'notes',
        'attachment_path',
        'created_by',
    ];

    protected $casts = [
        'request_date' => 'date',
        'required_date' => 'date',
        'approved_at' => 'datetime',
        'estimated_total' => 'decimal:2',
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

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function requester()
    {
        return $this->belongsTo(Employee::class, 'requested_by');
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
        return $this->hasMany(PurchaseRequestItem::class);
    }

    public function approvals()
    {
        return $this->hasMany(PurchaseApproval::class, 'purchase_request_id')->orderBy('step_order');
    }

    public function rfqs()
    {
        return $this->hasMany(Rfq::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
