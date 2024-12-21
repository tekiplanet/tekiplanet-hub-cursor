<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessInvoiceItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'amount'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2'
    ];

    public function invoice()
    {
        return $this->belongsTo(BusinessInvoice::class, 'invoice_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            $item->amount = $item->quantity * $item->unit_price;
        });
    }
} 