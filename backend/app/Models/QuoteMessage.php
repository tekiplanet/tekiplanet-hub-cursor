<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QuoteMessage extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'quote_id',
        'user_id',
        'message',
        'sender_type',
        'is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 