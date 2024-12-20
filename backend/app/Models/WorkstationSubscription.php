<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkstationSubscription extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'plan_id',
        'tracking_code',
        'start_date',
        'end_date',
        'total_amount',
        'payment_type',
        'status',
        'auto_renew',
        'last_check_in',
        'last_check_out',
        'cancelled_at',
        'cancellation_reason',
        'refund_amount'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'last_check_in' => 'datetime',
        'last_check_out' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'auto_renew' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WorkstationPlan::class, 'plan_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SubscriptionPayment::class, 'subscription_id');
    }

    public function accessCards(): HasMany
    {
        return $this->hasMany(AccessCard::class, 'subscription_id');
    }
} 