<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class BreakdownReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'breakdown_reports';

    protected $fillable = [
        'report_number',
        'site_id',
        'unit_id',
        'reporter_type',
        'reporter_id',
        'reporter_name',
        'breakdown_date',
        'breakdown_time',
        'current_hm',
        'current_km',
        'location_name',
        'location_id',
        'damage_category',
        'damage_description',
        'priority',
        'photo_path',
        'video_path',
        'status',
        'is_critical',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'breakdown_date' => 'date',
        'current_hm' => 'decimal:2',
        'current_km' => 'decimal:2',
        'is_critical' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reporter_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function maintenanceRequest(): HasOne
    {
        return $this->hasOne(MaintenanceRequest::class, 'breakdown_report_id');
    }

    public function workOrder(): HasOne
    {
        return $this->hasOne(WorkOrder::class, 'breakdown_report_id');
    }
}
