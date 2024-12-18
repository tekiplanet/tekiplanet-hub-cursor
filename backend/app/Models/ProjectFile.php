<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProjectFile extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id',
        'name',
        'file_path',
        'file_size',
        'file_type',
        'uploaded_by'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
} 