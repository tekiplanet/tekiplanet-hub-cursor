<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultingNotification extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id',
        'user_id',
        'type',
        'sent_at'
    ];

    protected $casts = [
        'sent_at' => 'datetime'
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(ConsultingBooking::class, 'booking_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
} 