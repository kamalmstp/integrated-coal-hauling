<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfer_number',
        'employee_id',
        'transfer_type',
        'effective_date',
        'from_site_id',
        'to_site_id',
        'from_department_id',
        'to_department_id',
        'from_position_id',
        'to_position_id',
        'status',
        'reason',
        'requested_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function fromSite()
    {
        return $this->belongsTo(Site::class, 'from_site_id');
    }

    public function toSite()
    {
        return $this->belongsTo(Site::class, 'to_site_id');
    }

    public function fromDepartment()
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment()
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function fromPosition()
    {
        return $this->belongsTo(Position::class, 'from_position_id');
    }

    public function toPosition()
    {
        return $this->belongsTo(Position::class, 'to_position_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
