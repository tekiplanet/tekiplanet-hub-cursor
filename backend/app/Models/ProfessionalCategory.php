<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProfessionalCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'is_active',
        'order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer'
    ];

    public function professionals()
    {
        return $this->hasMany(Professional::class, 'category_id');
    }

    public function hustles()
    {
        return $this->hasMany(Hustle::class, 'category_id');
    }
} 