<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WorkstationSubscription extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'auto_renew' => 'boolean',
        'last_check_in' => 'datetime',
        'last_check_out' => 'datetime',
        'total_amount' => 'decimal:2'
    ];

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
        'cancelled_at',
        'cancellation_reason',
        'cancellation_feedback'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(WorkstationPlan::class);
    }

    public function payments()
    {
        return $this->hasMany(WorkstationPayment::class);
    }
} 