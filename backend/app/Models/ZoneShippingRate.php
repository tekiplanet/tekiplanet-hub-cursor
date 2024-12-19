<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZoneShippingRate extends Model
{
    use HasUuids;

    protected $fillable = [
        'zone_id',
        'shipping_method_id',
        'rate',
        'estimated_days'
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'estimated_days' => 'integer'
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }
} 