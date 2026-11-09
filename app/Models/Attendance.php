<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_number',
        'site_id',
        'employee_id',
        'shift_id',
        'shift_assignment_id',
        'attendance_date',
        'status',
        'check_in_at',
        'check_out_at',
        'scheduled_start_time',
        'scheduled_end_time',
        'late_minutes',
        'work_duration_hours',
        'overtime_hours',
        'overtime_reason',
        'overtime_status',
        'input_source',
        'device_info',
        'gps_latitude',
        'gps_longitude',
        'approval_status',
        'approved_by',
        'approved_at',
        'remarks',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
        'approved_at' => 'datetime',
        'late_minutes' => 'integer',
        'work_duration_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'gps_latitude' => 'decimal:8',
        'gps_longitude' => 'decimal:8',
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

    public function shiftAssignment()
    {
        return $this->belongsTo(ShiftAssignment::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function corrections()
    {
        return $this->hasMany(AttendanceCorrection::class);
    }
}
