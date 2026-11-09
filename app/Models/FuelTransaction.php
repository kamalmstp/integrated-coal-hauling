<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_number',
        'digital_ticket_code',
        'transaction_type',
        'transaction_date',
        'transaction_time',
        'site_id',
        'shift_id',
        'source_tank_id',
        'destination_tank_id',
        'unit_id',
        'driver_id',
        'fuelman_id',
        'dumping_ticket_id',
        'dispatch_assignment_id',
        'reference_ticket_number',
        'fuel_source_type',
        'current_hm',
        'previous_hm',
        'hm_delta',
        'current_km',
        'previous_km',
        'km_delta',
        'liters',
        'unit_cost',
        'total_cost',
        'flowmeter_start',
        'flowmeter_end',
        'stock_before_liters',
        'stock_after_liters',
        'status',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'current_hm' => 'decimal:2',
        'previous_hm' => 'decimal:2',
        'hm_delta' => 'decimal:2',
        'current_km' => 'decimal:2',
        'previous_km' => 'decimal:2',
        'km_delta' => 'decimal:2',
        'liters' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'flowmeter_start' => 'decimal:2',
        'flowmeter_end' => 'decimal:2',
        'stock_before_liters' => 'decimal:2',
        'stock_after_liters' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function sourceTank()
    {
        return $this->belongsTo(FuelTank::class, 'source_tank_id');
    }

    public function tank()
    {
        return $this->belongsTo(FuelTank::class, 'source_tank_id');
    }

    public function destinationTank()
    {
        return $this->belongsTo(FuelTank::class, 'destination_tank_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function fuelman()
    {
        return $this->belongsTo(Employee::class, 'fuelman_id');
    }

    public function dumpingTicket()
    {
        return $this->belongsTo(DumpingTicket::class, 'dumping_ticket_id');
    }

    public function dispatchAssignment()
    {
        return $this->belongsTo(DispatchAssignment::class, 'dispatch_assignment_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(FuelTransactionItem::class);
    }
}
