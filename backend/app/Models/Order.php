<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class Order extends Model
{

    use HasUuids;

    protected $fillable = [
        'user_id',
        'shipping_address_id',
        'shipping_method_id',
        'subtotal',
        'shipping_cost',
        'total',
        'status',
        'payment_method',
        'payment_status'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(ShippingAddress::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function tracking()
    {
        return $this->hasOne(OrderTracking::class);
    }
} 