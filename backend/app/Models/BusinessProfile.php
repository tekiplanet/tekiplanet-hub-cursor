<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'business_name',
        'business_email',
        'phone_number',
        'address',
        'city',
        'state',
        'country',
        'business_type',
        'registration_number',
        'tax_number',
        'logo',
        'website',
        'description',
        'status',
        'is_verified',
        'verified_at'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'business_id');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }
} 