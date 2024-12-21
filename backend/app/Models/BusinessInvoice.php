<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessInvoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'customer_id',
        'invoice_number',
        'amount',
        'paid_amount',
        'due_date',
        'status',
        'payment_reminder_sent',
        'theme_color',
        'notes'
    ];

    // Add status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_PARTIALLY_PAID = 'partially_paid';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';

    // Define the allowed statuses
    public static $statuses = [
        self::STATUS_DRAFT,
        self::STATUS_PENDING,
        self::STATUS_SENT,
        self::STATUS_PARTIALLY_PAID,
        self::STATUS_PAID,
        self::STATUS_OVERDUE,
        self::STATUS_CANCELLED
    ];

    protected $casts = [
        'due_date' => 'date',
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'payment_reminder_sent' => 'boolean'
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    public function customer()
    {
        return $this->belongsTo(BusinessCustomer::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(BusinessInvoiceItem::class, 'invoice_id');
    }

    public function getRemainingAmount()
    {
        return $this->amount - $this->paid_amount;
    }

    // Add helper methods
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isPartiallyPaid(): bool
    {
        return $this->status === self::STATUS_PARTIALLY_PAID;
    }

    public function isSent(): bool
    {
        return $this->status === self::STATUS_SENT;
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_OVERDUE || 
            ($this->status !== self::STATUS_PAID && now()->greaterThan($this->due_date));
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }
} 