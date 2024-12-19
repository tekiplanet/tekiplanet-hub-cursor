<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasUuids;

    protected $table = 'shopping_carts';

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

    public function refreshTotals(): void
    {
        $this->update([
            'original_total' => $this->items->sum(function ($item) {
                return $item->original_price * $item->quantity;
            }),
            'current_total' => $this->items->sum(function ($item) {
                return $item->current_price * $item->quantity;
            })
        ]);
    }
} 