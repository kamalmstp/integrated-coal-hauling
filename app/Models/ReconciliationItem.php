<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationItem extends Model
{
    use HasFactory;

    protected $table = 'reconciliation_items';

    protected $fillable = [
        'reconciliation_id',
        'dumping_ticket_id',
        'jsi_ticket_number',
        'tap_ticket_number',
        'ticket_date',
        'jsi_tonnage',
        'tap_tonnage',
        'tonnage_diff',
        'jsi_unit_code',
        'tap_unit_code',
        'match_status',
        'resolution_status',
        'resolution_notes',
    ];

    protected $casts = [
        'ticket_date' => 'date',
        'jsi_tonnage' => 'decimal:2',
        'tap_tonnage' => 'decimal:2',
        'tonnage_diff' => 'decimal:2',
    ];

    public function reconciliation()
    {
        return $this->belongsTo(TicketReconciliation::class, 'reconciliation_id');
    }

    public function dumpingTicket()
    {
        return $this->belongsTo(DumpingTicket::class, 'dumping_ticket_id');
    }
}
