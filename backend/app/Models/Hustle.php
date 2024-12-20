<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Hustle extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'budget',
        'deadline',
        'requirements',
        'status',
        'assigned_professional_id',
        'initial_payment_released',
        'final_payment_released'
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'deadline' => 'date',
        'initial_payment_released' => 'boolean',
        'final_payment_released' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(ProfessionalCategory::class);
    }

    public function assignedProfessional()
    {
        return $this->belongsTo(Professional::class, 'assigned_professional_id');
    }

    public function applications()
    {
        return $this->hasMany(HustleApplication::class);
    }

    public function messages()
    {
        return $this->hasMany(HustleMessage::class);
    }

    public function payments()
    {
        return $this->hasMany(HustlePayment::class);
    }
} 