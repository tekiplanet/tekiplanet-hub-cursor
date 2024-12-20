<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HustlePayment extends Model
{
    use HasUuids;

    protected $fillable = [
        'hustle_id',
        'professional_id',
        'amount',
        'payment_type',
        'status',
        'paid_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime'
    ];

    public function hustle()
    {
        return $this->belongsTo(Hustle::class);
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }
} 