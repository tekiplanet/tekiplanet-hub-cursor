<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'background_color',
        'text_color',
        'button_text',
        'link',
        'is_active',
        'order'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];
}