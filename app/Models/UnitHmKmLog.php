<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitHmKmLog extends Model
{
    use HasFactory;

    protected $table = 'unit_hm_km_logs';

    protected $fillable = [
        'unit_id',
        'driver_id',
        'shift_id',
        'log_date',
        'start_hm',
        'end_hm',
        'diff_hm',
        'start_km',
        'end_km',
        'diff_km',
        'is_anomaly',
        'anomaly_reason',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'log_date' => 'date',
        'start_hm' => 'decimal:2',
        'end_hm' => 'decimal:2',
        'diff_hm' => 'decimal:2',
        'start_km' => 'decimal:2',
        'end_km' => 'decimal:2',
        'diff_km' => 'decimal:2',
        'is_anomaly' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
