<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessGoal extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'type',
        'target_amount',
        'current_amount',
        'start_date',
        'end_date',
        'status',
        'notification_enabled'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'notification_enabled' => 'boolean',
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }
} 