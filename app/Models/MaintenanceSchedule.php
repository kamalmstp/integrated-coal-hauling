<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceSchedule extends Model
{
    use HasFactory;

    protected $table = 'maintenance_schedules';

    protected $fillable = [
        'site_id',
        'unit_id',
        'service_type',
        'schedule_basis',
        'interval_value',
        'last_service_date',
        'last_service_hm',
        'last_service_km',
        'next_due_date',
        'next_due_hm',
        'next_due_km',
        'status',
        'notes',
    ];

    protected $casts = [
        'last_service_date' => 'date',
        'last_service_hm' => 'decimal:2',
        'last_service_km' => 'decimal:2',
        'next_due_date' => 'date',
        'next_due_hm' => 'decimal:2',
        'next_due_km' => 'decimal:2',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
