<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobCardChecklist extends Model
{
    use HasFactory;

    protected $table = 'job_card_checklists';

    protected $fillable = [
        'job_card_id',
        'item_name',
        'category',
        'is_checked',
        'checked_by',
        'notes',
    ];

    protected $casts = [
        'is_checked' => 'boolean',
    ];

    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'checked_by');
    }
}
