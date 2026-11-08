<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementApprovalRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'rule_code',
        'rule_name',
        'document_type',
        'site_id',
        'department_id',
        'purchase_category',
        'min_amount',
        'max_amount',
        'step_order',
        'approver_position_id',
        'approver_role_label',
        'is_active',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'step_order' => 'integer',
        'is_active' => 'boolean',
    ];

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
}
