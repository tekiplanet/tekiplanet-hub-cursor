<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessInventoryCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'name',
        'description'
    ];

    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    public function items()
    {
        return $this->hasMany(BusinessInventoryItem::class, 'category_id');
    }
} 