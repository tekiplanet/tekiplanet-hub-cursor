<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessFinancialCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'name',
        'type',
        'is_default',
        'description'
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    public function transactions()
    {
        return $this->hasMany(BusinessFinancialTransaction::class, 'category_id');
    }
} 