<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceServiceInterval extends Model
{
    use HasFactory;

    protected $table = 'maintenance_service_intervals';

    protected $fillable = [
        'unit_id',
        'service_type',
        'interval_hm',
        'last_service_hm',
        'last_service_date',
        'next_service_hm',
        'remaining_hm',
        'status',
        'notes',
    ];

    protected $casts = [
        'last_service_date' => 'date',
        'last_service_hm' => 'decimal:2',
        'next_service_hm' => 'decimal:2',
        'remaining_hm' => 'decimal:2',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
