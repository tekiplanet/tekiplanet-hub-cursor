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
        return $this->invoices()->where('status', 'paid')->sum('amount');
    }
} 