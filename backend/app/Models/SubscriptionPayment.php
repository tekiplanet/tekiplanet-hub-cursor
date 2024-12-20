<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPayment extends Model
{
    use HasUuids;

    protected $fillable = [
        'subscription_id',
        'amount',
        'type',
        'installment_number',
        'due_date',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'datetime'
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(WorkstationSubscription::class, 'subscription_id');
    }
} 