<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProjectStage extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'status',
        'order',
        'start_date',
        'end_date'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'order' => 'integer'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
} 