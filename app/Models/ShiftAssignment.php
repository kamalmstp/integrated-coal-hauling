<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_code',
        'site_id',
        'employee_id',
        'shift_id',
        'roster_date',
        'work_status',
        'assigned_unit_id',
        'notes',
        'assigned_by',
    ];

    protected $casts = [
        'roster_date' => 'date',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function assignedUnit()
    {
        return $this->belongsTo(Unit::class, 'assigned_unit_id');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
