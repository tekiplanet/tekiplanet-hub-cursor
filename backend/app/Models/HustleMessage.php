<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HustleMessage extends Model
{
    use HasUuids;

    protected $fillable = [
        'hustle_id',
        'user_id',
        'message',
        'sender_type',
        'is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean'
    ];

    public function hustle()
    {
        return $this->belongsTo(Hustle::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 