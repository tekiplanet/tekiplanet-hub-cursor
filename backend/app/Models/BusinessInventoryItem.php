<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessInventoryItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'category_id',
        'name',
        'description',
        'sku',
        'quantity',
        'low_stock_threshold',
        'cost_price',
        'selling_price',
        'status'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2'
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    public function category()
    {
        return $this->belongsTo(BusinessInventoryCategory::class, 'category_id');
    }

    public function isLowStock()
    {
        return $this->quantity <= $this->low_stock_threshold;
    }

    public function getProfitMargin()
    {
        return ($this->selling_price - $this->cost_price) / $this->selling_price * 100;
    }
} 