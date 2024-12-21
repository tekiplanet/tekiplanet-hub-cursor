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

    public function payments()
    {
        return $this->hasMany(BusinessInvoicePayment::class, 'invoice_id');
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

    public function getEffectiveStatus(): string
    {
        // If invoice is cancelled, return cancelled status
        if ($this->status === self::STATUS_CANCELLED) {
            return self::STATUS_CANCELLED;
        }

        // If invoice is fully paid, return paid status regardless of due date
        if ($this->paid_amount >= $this->amount) {
            return self::STATUS_PAID;
        }

        // If invoice is partially paid
        if ($this->paid_amount > 0) {
            // Check if it's overdue
            if (now()->greaterThan($this->due_date)) {
                return self::STATUS_OVERDUE;
            }
            return self::STATUS_PARTIALLY_PAID;
        }

        // If no payment has been made
        if (now()->greaterThan($this->due_date)) {
            return self::STATUS_OVERDUE;
        }

        // Return current status for other cases
        return $this->status;
    }

    public function getStatusDetails()
    {
        $now = now();
        $dueDate = $this->due_date;
        $effectiveStatus = $this->getEffectiveStatus();
        $isOverdue = $effectiveStatus === self::STATUS_OVERDUE;
        $daysOverdue = $isOverdue ? $dueDate->diffInDays($now) : 0;
        $remainingAmount = $this->amount - $this->paid_amount;

        $details = [
            'status' => $effectiveStatus,
            'paid_amount' => $this->paid_amount,
            'remaining_amount' => $remainingAmount,
            'is_overdue' => $isOverdue,
            'days_overdue' => $daysOverdue,
        ];

        // Set label, color, and description based on effective status
        switch ($effectiveStatus) {
            case self::STATUS_PAID:
                $details['label'] = 'Paid';
                $details['color'] = 'success';
                $details['description'] = 'Payment completed';
                break;

            case self::STATUS_PARTIALLY_PAID:
                $details['label'] = 'Partially Paid';
                $details['color'] = 'warning';
                $details['description'] = "Partial payment received";
                break;

            case self::STATUS_OVERDUE:
                $details['label'] = 'Overdue';
                $details['color'] = 'destructive';
                $details['description'] = "Payment overdue by {$daysOverdue} days";
                break;

            case self::STATUS_SENT:
                $details['label'] = 'Sent';
                $details['color'] = 'info';
                $details['description'] = 'Invoice sent to customer';
                break;

            case self::STATUS_PENDING:
                $details['label'] = 'Pending';
                $details['color'] = 'muted';
                $details['description'] = 'Invoice not sent yet';
                break;

            case self::STATUS_CANCELLED:
                $details['label'] = 'Cancelled';
                $details['color'] = 'destructive';
                $details['description'] = 'Invoice cancelled';
                break;

            default:
                $details['label'] = ucfirst($effectiveStatus);
                $details['color'] = 'muted';
                $details['description'] = '';
        }

        return $details;
    }
} 