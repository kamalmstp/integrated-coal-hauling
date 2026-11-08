<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SparepartRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sparepart_requests';

    protected $fillable = [
        'request_number',
        'work_order_id',
        'site_id',
        'warehouse_id',
        'requested_by',
        'request_date',
        'status',
        'approved_by',
        'approved_at',
        'picked_at',
        'issued_by',
        'storeman_id',
        'issued_at',
        'received_by',
        'received_at',
        'total_cost',
        'notes',
        'rejection_reason',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'request_date' => 'date',
        'approved_at' => 'datetime',
        'picked_at' => 'datetime',
        'issued_at' => 'datetime',
        'received_at' => 'datetime',
        'total_cost' => 'decimal:2',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function storeman(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'storeman_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'received_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SparepartRequestItem::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(InventoryReservation::class);
    }

    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}
