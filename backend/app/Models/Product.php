<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'short_description',
        'price',
        'category_id',
        'brand_id',
        'stock',
        'rating',
        'reviews_count',
        'is_featured'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function features(): HasMany
    {
        return $this->hasMany(ProductFeature::class);
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(ProductSpecification::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }
} 