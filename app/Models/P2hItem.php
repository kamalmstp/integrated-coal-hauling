<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class P2hItem extends Model
{
    use HasFactory;

    protected $table = 'p2h_items';

    protected $fillable = [
        'p2h_inspection_id',
        'category',
        'item_name',
        'is_critical',
        'status',
        'defect_description',
        'photo_path',
    ];

    protected $casts = [
        'is_critical' => 'boolean',
    ];

    public function inspection()
    {
        return $this->belongsTo(P2hInspection::class, 'p2h_inspection_id');
    }
}
