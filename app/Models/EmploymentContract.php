<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmploymentContract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contract_number',
        'employee_id',
        'site_id',
        'department_id',
        'position_id',
        'contract_type',
        'sequence_number',
        'parent_contract_id',
        'start_date',
        'end_date',
        'basic_salary',
        'status',
        'separation_type',
        'separation_date',
        'separation_reason',
        'document_path',
        'notes',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'separation_date' => 'date',
        'basic_salary' => 'decimal:2',
        'sequence_number' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function parentContract()
    {
        return $this->belongsTo(EmploymentContract::class, 'parent_contract_id');
    }

    public function extensions()
    {
        return $this->hasMany(EmploymentContract::class, 'parent_contract_id');
    }
}
