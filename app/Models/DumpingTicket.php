<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DumpingTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'dumping_tickets';

    protected $fillable = [
        'ticket_number',
        'ticket_date',
        'dumping_time',
        'site_id',
        'unit_id',
        'driver_id',
        'loading_point_id',
        'dumping_point_id',
        'material_id',
        'shift_id',
        'tonnage',
        'gross_weight',
        'tare_weight',
        'checker_name',
        'source',
        'status',
        'remarks',
        'attachment_path',
        'batch_import_id',
        'verified_by',
        'verified_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'is_production',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'ticket_date' => 'date',
        'dumping_time' => 'datetime',
        'verified_at' => 'datetime',
        'rejected_at' => 'datetime',
        'tonnage' => 'decimal:2',
        'gross_weight' => 'decimal:2',
        'tare_weight' => 'decimal:2',
        'is_production' => 'boolean',
    ];

    // Scopes
    public function scopeVerifiedProduction($query)
    {
        return $query->where('dumping_tickets.status', 'verified')->where('dumping_tickets.is_production', true);
    }

    public function scopePendingVerification($query)
    {
        return $query->whereIn('dumping_tickets.status', ['submitted', 'pending_verification']);
    }

    public function scopeRejected($query)
    {
        return $query->where('dumping_tickets.status', 'rejected');
    }

    // Relationships
    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function loadingPoint()
    {
        return $this->belongsTo(Location::class, 'loading_point_id');
    }

    public function dumpingPoint()
    {
        return $this->belongsTo(Location::class, 'dumping_point_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function rejecter()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function corrections()
    {
        return $this->hasMany(TicketCorrection::class)->orderBy('created_at', 'desc');
    }

    public function importBatch()
    {
        return $this->belongsTo(TicketImportBatch::class, 'batch_import_id');
    }
}
