<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'driver_code',
        'employee_id',
        'sim_number',
        'sim_type',
        'sim_expiry',
        'simper_number',
        'simper_expiry',
        'mcu_status',
        'mcu_date',
        'mcu_expiry',
        'administrative_eligibility_status',
        'assigned_unit_id',
        'training_status',
        'last_training_date',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'sim_expiry' => 'date',
        'simper_expiry' => 'date',
        'mcu_date' => 'date',
        'mcu_expiry' => 'date',
        'last_training_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function assignedUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'assigned_unit_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(DriverTraining::class)->orderByDesc('training_date');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
