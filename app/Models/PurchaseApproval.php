<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'purchase_request_id',
        'purchase_order_id',
        'approval_rule_id',
        'site_id',
        'department_id',
        'approver_position_id',
        'step_order',
        'step_name',
        'transaction_amount',
        'purchase_category',
        'status',
        'acted_by',
        'acted_by_employee_id',
        'acted_at',
        'notes',
    ];

    protected $casts = [
        'step_order' => 'integer',
        'transaction_amount' => 'decimal:2',
        'acted_at' => 'datetime',
    ];

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function rule()
    {
        return $this->belongsTo(ProcurementApprovalRule::class, 'approval_rule_id');
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function approverPosition()
    {
        return $this->belongsTo(Position::class, 'approver_position_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'acted_by');
    }

    public function actorEmployee()
    {
        return $this->belongsTo(Employee::class, 'acted_by_employee_id');
    }
}
