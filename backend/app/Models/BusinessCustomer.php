<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessCustomer extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'currency',
        'tags',
        'notes',
        'status'
    ];

    protected $casts = [
        'tags' => 'array',
        'status' => 'string'
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    public function invoices()
    {
        return $this->hasMany(BusinessInvoice::class, 'customer_id');
    }

    public function getTotalSpent()
    {
        $total = 0;
        $invoices = $this->invoices()->where('status', 'paid')->get();

        foreach ($invoices as $invoice) {
            // If the invoice currency matches the customer's currency, add directly
            if ($invoice->currency === $this->currency) {
                $total += $invoice->amount;
            }
            // For other currencies, we'll need to implement conversion
            // For now, we'll just add them as is, but this should be updated
            // when we implement currency conversion
            else {
                $total += $invoice->amount;
            }
        }

        return $total;
    }
} 