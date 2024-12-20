<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkstationPlan extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'duration_days',
        'print_pages_limit',
        'meeting_room_hours',
        'has_locker',
        'has_dedicated_support',
        'allows_installments',
        'installment_months',
        'installment_amount',
        'features',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'features' => 'array',
        'has_locker' => 'boolean',
        'has_dedicated_support' => 'boolean',
        'allows_installments' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(WorkstationSubscription::class, 'plan_id');
    }
} 