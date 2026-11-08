<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockOpname extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'opname_number',
        'site_id',
        'warehouse_id',
        'scheduled_date',
        'conducted_date',
        'status',
        'storeman_id',
        'auditor_id',
        'approved_by',
        'approved_at',
        'investigation_notes',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'conducted_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function storeman()
    {
        return $this->belongsTo(Employee::class, 'storeman_id');
    }

    public function auditor()
    {
        return $this->belongsTo(Employee::class, 'auditor_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(StockOpnameItem::class);
    }

    public function adjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }
}
