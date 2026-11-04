<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionTarget extends Model
{
    use HasFactory;

    protected $table = 'production_targets';

    protected $fillable = [
        'site_id',
        'period_type',
        'target_date',
        'month',
        'year',
        'target_tonnage',
        'target_ritase',
        'working_days',
        'remarks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'target_date' => 'date',
        'target_tonnage' => 'decimal:2',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
