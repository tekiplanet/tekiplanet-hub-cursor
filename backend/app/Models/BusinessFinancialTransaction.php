<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessFinancialTransaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'category_id',
        'amount',
        'type',
        'description',
        'date',
        'reference_number'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    public function category()
    {
        return $this->belongsTo(BusinessFinancialCategory::class, 'category_id');
    }
} 