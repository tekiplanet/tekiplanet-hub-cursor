<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ConsultingSetting extends Model
{
    use HasUuids;

    protected $fillable = [
        'hourly_rate',
        'overtime_rate',
        'cancellation_hours'
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'cancellation_hours' => 'integer'
    ];
} 