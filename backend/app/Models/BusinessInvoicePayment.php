<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessInvoicePayment extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_id',
        'amount',
        'currency',
        'payment_date',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime'
    ];

    public function invoice()
    {
        return $this->belongsTo(BusinessInvoice::class, 'invoice_id');
    }
} 