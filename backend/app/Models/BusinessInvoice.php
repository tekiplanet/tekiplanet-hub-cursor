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

    public function isOverdue()
    {
        return $this->status !== 'paid' && now()->greaterThan($this->due_date);
    }
} 