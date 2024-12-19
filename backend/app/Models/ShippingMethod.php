<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'base_cost',
        'estimated_days_min',
        'estimated_days_max',
        'is_active'
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'is_active' => 'boolean'
    ];
} 