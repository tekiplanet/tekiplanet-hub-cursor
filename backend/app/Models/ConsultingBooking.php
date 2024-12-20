<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ConsultingBooking extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'hours',
        'total_cost',
        'overtime_cost',
        'selected_date',
        'selected_time',
        'actual_start_time',
        'actual_end_time',
        'actual_duration',
        'requirements',
        'status',
        'payment_status',
        'payment_method',
        'cancellation_reason',
        'cancelled_at'
    ];

    protected $casts = [
        'selected_date' => 'date',
        'selected_time' => 'datetime',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_cost' => 'decimal:2',
        'overtime_cost' => 'decimal:2',
        'hours' => 'integer',
        'actual_duration' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function timeSlot(): HasOne
    {
        return $this->hasOne(ConsultingTimeSlot::class, 'booking_id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(ConsultingReview::class, 'booking_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(ConsultingNotification::class, 'booking_id');
    }

    public function canBeCancelled(): bool
    {
        if ($this->status !== 'pending' && $this->status !== 'confirmed') {
            return false;
        }

        $settings = ConsultingSetting::first();
        $cancellationHours = $settings ? $settings->cancellation_hours : 24;

        return now()->diffInHours($this->selected_date) >= $cancellationHours;
    }

    public function expert()
    {
        return $this->belongsTo(Professional::class, 'assigned_expert_id')
            ->with('user');
    }
} 