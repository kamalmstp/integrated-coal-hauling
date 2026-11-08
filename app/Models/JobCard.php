<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobCard extends Model
{
    use HasFactory;

    protected $table = 'job_cards';

    protected $fillable = [
        'job_card_number',
        'work_order_id',
        'site_id',
        'unit_id',
        'issue_date',
        'initial_complaint',
        'mechanic_diagnosis',
        'work_performed',
        'photo_before',
        'photo_after',
        'work_result',
        'lead_mechanic_id',
        'supervisor_id',
        'supervisor_inspected_at',
        'supervisor_notes',
        'status',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'supervisor_inspected_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function leadMechanic(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'lead_mechanic_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(JobCardChecklist::class);
    }
}
