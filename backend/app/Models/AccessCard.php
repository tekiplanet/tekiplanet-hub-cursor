<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessCard extends Model
{
    use HasUuids;

    protected $fillable = [
        'subscription_id',
        'card_number',
        'valid_date',
        'qr_code',
        'is_active'
    ];

    protected $casts = [
        'valid_date' => 'date',
        'is_active' => 'boolean'
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(WorkstationSubscription::class, 'subscription_id');
    }
} 