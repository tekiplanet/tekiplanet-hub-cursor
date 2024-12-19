<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Cart;


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
        'original_price' => 'decimal:2',
        'current_price' => 'decimal:2',
        'price_changed' => 'boolean'
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
} 