<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Order extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'shipping_address_id',
        'shipping_method_id',
        'subtotal',
        'shipping_cost',
        'discount',
        'total',
        'status',
        'payment_status',
        'refund_status',
        'coupon_id',
        'delivery_attempts',
        'max_delivery_attempts',
        'delivered_at'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'delivery_attempts' => 'integer',
        'max_delivery_attempts' => 'integer',
        'delivered_at' => 'datetime'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(ShippingAddress::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function refundRequest(): HasMany
    {
        return $this->hasMany(RefundRequest::class);
    }

    // Helper Methods
    public function canRequestRefund(): bool
    {
        if ($this->status !== 'delivered' || $this->refund_status !== 'none') {
            return false;
        }

        $deliveredDate = Carbon::parse($this->delivered_at);
        $refundWindow = Carbon::now()->subDays(3);

        return $deliveredDate->isAfter($refundWindow);
    }

    public function updateStatus(string $status, ?string $notes = null): void
    {
        $this->status = $status;
        $this->save();

        // Record in history
        $this->statusHistory()->create([
            'status' => $status,
            'notes' => $notes
        ]);
    }

    public function incrementDeliveryAttempts(): bool
    {
        $this->delivery_attempts++;
        
        if ($this->delivery_attempts >= $this->max_delivery_attempts) {
            $this->updateStatus('cancelled', 'Maximum delivery attempts reached');
            return false;
        }

        $this->save();
        return true;
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeInProgress($query)
    {
        return $query->whereIn('status', ['confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery']);
    }
} 