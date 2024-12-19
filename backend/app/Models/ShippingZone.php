<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingZone extends Model
{
    use HasUuids;

    protected $fillable = ['name'];

    public function rates(): HasMany
    {
        return $this->hasMany(ZoneShippingRate::class, 'zone_id');
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(ShippingAddress::class, 'state_id');
    }
} 