<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'site_id',
        'department_id',
        'position_id',
        'event_type',
        'old_employment_status',
        'new_employment_status',
        'old_site_id',
        'new_site_id',
        'effective_date',
        'reference_number',
        'remarks',
        'recorded_by',
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function oldSite()
    {
        return $this->belongsTo(Site::class, 'old_site_id');
    }

    public function newSite()
    {
        return $this->belongsTo(Site::class, 'new_site_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
