<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispatchAssignmentLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'dispatch_assignment_logs';

    protected $fillable = [
        'dispatch_assignment_id',
        'changed_by',
        'change_type',
        'old_values',
        'new_values',
        'reason',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    public function assignment()
    {
        return $this->belongsTo(DispatchAssignment::class, 'dispatch_assignment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
