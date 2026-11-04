<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyDispatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'daily_dispatches';

    protected $fillable = [
        'dispatch_number',
        'date',
        'site_id',
        'shift_id',
        'supervisor_id',
        'status',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function assignments()
    {
        return $this->hasMany(DispatchAssignment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
