<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ShoppingCart extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'original_total',
        'current_total'
    ];

    protected $casts = [
        'original_total' => 'decimal:2',
        'current_total' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'cart_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'cart_items')
            ->withPivot(['quantity', 'original_price', 'current_price', 'price_changed'])
            ->withTimestamps();
    }

    public function updateTotals(): void
    {
        $this->original_total = $this->items->sum(function ($item) {
            return $item->original_price * $item->quantity;
        });

        $this->current_total = $this->items->sum(function ($item) {
            return $item->current_price * $item->quantity;
        });

        $this->save();
    }
} 