<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketCorrection extends Model
{
    use HasFactory;

    protected $table = 'ticket_corrections';

    protected $fillable = [
        'dumping_ticket_id',
        'requested_by',
        'approved_by',
        'old_data',
        'new_data',
        'reason',
        'status',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    public function ticket()
    {
        return $this->belongsTo(DumpingTicket::class, 'dumping_ticket_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
