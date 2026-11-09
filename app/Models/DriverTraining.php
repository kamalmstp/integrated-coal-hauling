<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverTraining extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_code',
        'driver_id',
        'employee_id',
        'site_id',
        'training_name',
        'training_category',
        'provider',
        'training_date',
        'expiry_date',
        'score',
        'certificate_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'training_date' => 'date',
        'expiry_date' => 'date',
        'score' => 'decimal:2',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }
}
