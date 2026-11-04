<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketReconciliation extends Model
{
    use HasFactory;

    protected $table = 'ticket_reconciliations';

    protected $fillable = [
        'reconciliation_code',
        'site_id',
        'start_date',
        'end_date',
        'source_file_name',
        'total_tap_tickets',
        'total_tap_tonnage',
        'total_jsi_tickets',
        'total_jsi_tonnage',
        'matched_tickets_count',
        'matched_tonnage',
        'discrepancy_tickets_count',
        'discrepancy_tonnage',
        'missing_in_tap_count',
        'missing_in_jsi_count',
        'status',
        'settlement_notes',
        'reconciled_by',
        'reconciled_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reconciled_at' => 'datetime',
        'total_tap_tonnage' => 'decimal:2',
        'total_jsi_tonnage' => 'decimal:2',
        'matched_tonnage' => 'decimal:2',
        'discrepancy_tonnage' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function items()
    {
        return $this->hasMany(ReconciliationItem::class, 'reconciliation_id');
    }

    public function reconciler()
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
