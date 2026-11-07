<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'unit_code',
        'registration_number',
        'unit_type',
        'brand',
        'model',
        'year',
        'capacity_ton',
        'capacity_m3',
        'chassis_number',
        'engine_number',
        'last_hm',
        'last_km',
        'status',
        'operation_start_date',
        'site_id',
        'vendor_id',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'year' => 'integer',
        'capacity_ton' => 'decimal:2',
        'capacity_m3' => 'decimal:2',
        'last_hm' => 'decimal:2',
        'last_km' => 'decimal:2',
        'operation_start_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function p2hInspections()
    {
        return $this->hasMany(P2hInspection::class)->orderBy('inspection_date', 'desc')->orderBy('inspection_time', 'desc');
    }

    public function latestP2h()
    {
        return $this->hasOne(P2hInspection::class)->latestOfMany();
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class)->orderBy('breakdown_time', 'desc');
    }

    public function activeWorkOrder()
    {
        return $this->hasOne(WorkOrder::class)->whereIn('status', ['open', 'in_progress', 'waiting_parts'])->latestOfMany();
    }

    public function hmKmLogs()
    {
        return $this->hasMany(UnitHmKmLog::class)->orderBy('log_date', 'desc');
    }

    public function serviceIntervals()
    {
        return $this->hasMany(MaintenanceServiceInterval::class);
    }

    public function dailyKpis()
    {
        return $this->hasMany(FleetDailyKpi::class)->orderBy('date', 'desc');
    }

    public function isRfu(): bool
    {
        if (in_array($this->status, ['breakdown', 'maintenance'])) {
            return false;
        }

        if ($this->activeWorkOrder()->exists()) {
            return false;
        }

        $latestP2h = $this->latestP2h;
        if ($latestP2h && $latestP2h->overall_condition === 'not_rfu') {
            return false;
        }

        return true;
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
