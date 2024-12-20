<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultingTimeSlot extends Model
{
    use HasUuids;

    protected $fillable = [
        'date',
        'time',
        'is_available',
        'capacity',
        'booked_slots'
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime',
        'is_available' => 'boolean',
        'is_booked' => 'boolean'
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(ConsultingBooking::class, 'booking_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
            ->where('is_booked', false);
    }

    public function scopeFutureSlots($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    public function getIsFullAttribute()
    {
        return $this->booked_slots >= $this->capacity;
    }
} 