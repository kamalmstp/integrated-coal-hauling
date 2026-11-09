<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrSiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'check_in_grace_minutes',
        'earliest_check_in_minutes_before',
        'max_overtime_hours_per_day',
        'contract_reminder_days',
        'document_reminder_days',
        'require_gps_on_mobile',
        'timezone',
    ];

    protected $casts = [
        'check_in_grace_minutes' => 'integer',
        'earliest_check_in_minutes_before' => 'integer',
        'max_overtime_hours_per_day' => 'decimal:2',
        'contract_reminder_days' => 'integer',
        'document_reminder_days' => 'integer',
        'require_gps_on_mobile' => 'boolean',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }
}
