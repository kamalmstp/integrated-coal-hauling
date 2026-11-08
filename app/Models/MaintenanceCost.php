<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceCost extends Model
{
    use HasFactory;

    protected $table = 'maintenance_costs';

    protected $fillable = [
        'work_order_id',
        'site_id',
        'unit_id',
        'cost_date',
        'cost_type',
        'description',
        'reference_number',
        'estimated_amount',
        'actual_amount',
        'created_by',
    ];

    protected $casts = [
        'cost_date' => 'date',
        'estimated_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
