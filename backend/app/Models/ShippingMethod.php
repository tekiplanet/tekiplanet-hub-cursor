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
        'is_active',
        'priority'
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'is_active' => 'boolean',
        'priority' => 'integer'
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