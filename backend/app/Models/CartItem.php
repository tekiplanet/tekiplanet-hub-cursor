<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'original_price',
        'current_price',
        'price_changed'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'original_price' => 'decimal:2',
        'current_price' => 'decimal:2',
        'price_changed' => 'boolean'
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(ShoppingCart::class, 'cart_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function boot()
    {
        parent::boot();

        // Update cart totals after cart item changes
        static::saved(function ($cartItem) {
            $cartItem->cart->updateTotals();
        });

        static::deleted(function ($cartItem) {
            $cartItem->cart->updateTotals();
        });
    }
} 