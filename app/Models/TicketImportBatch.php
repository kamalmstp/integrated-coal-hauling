<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketImportBatch extends Model
{
    use HasFactory;

    protected $table = 'ticket_import_batches';

    protected $fillable = [
        'batch_code',
        'file_name',
        'total_rows',
        'successful_rows',
        'failed_rows',
        'duplicate_rows',
        'error_summary',
        'imported_by',
    ];

    protected $casts = [
        'error_summary' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function dumpingTickets()
    {
        return $this->hasMany(DumpingTicket::class, 'batch_import_id');
    }
}
