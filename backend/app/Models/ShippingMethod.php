<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingMethod extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'base_cost',
        'estimated_days_min',
        'estimated_days_max',
        'priority',
        'is_active'
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'estimated_days_min' => 'integer',
        'estimated_days_max' => 'integer',
        'priority' => 'integer',
        'is_active' => 'boolean'
    ];

    public function zoneRates(): HasMany
    {
        return $this->hasMany(ZoneShippingRate::class);
    }

    public function getRateForZone(string $zoneId): ?float
    {
        return $this->zoneRates()
            ->where('zone_id', $zoneId)
            ->value('rate');
    }
} 