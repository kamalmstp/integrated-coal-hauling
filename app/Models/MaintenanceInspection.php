<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MaintenanceInspection extends Model
{
    use HasFactory;

    protected $table = 'maintenance_inspections';

    protected $fillable = [
        'inspection_number',
        'work_order_id',
        'site_id',
        'unit_id',
        'inspector_id',
        'inspection_date',
        'inspection_time',
        'inspection_type',
        'checklist_result',
        'test_run_hm',
        'test_run_km',
        'test_run_result',
        'result',
        'defects_found',
        'inspector_notes',
        'inspector_signature_hash',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'checklist_result' => 'array',
        'test_run_hm' => 'decimal:2',
        'test_run_km' => 'decimal:2',
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

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'inspector_id');
    }

    public function rfuApproval(): HasOne
    {
        return $this->hasOne(RfuApproval::class);
    }
}
