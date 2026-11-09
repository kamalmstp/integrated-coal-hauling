<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportExportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'export_code',
        'report_type',
        'export_format',
        'site_id',
        'filters',
        'row_count',
        'status',
        'is_background_job',
        'file_path',
        'notes',
        'requested_by',
        'completed_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'row_count' => 'integer',
        'is_background_job' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
