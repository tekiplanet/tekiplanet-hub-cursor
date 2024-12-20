<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProjectTeamMember extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        'status',
        'joined_at',
        'left_at'
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeConsultingExperts($query)
    {
        return $query->where('role', 'consulting_expert')
                     ->where('status', 'active');
    }

    public function consultingBookings()
    {
        return $this->hasMany(ConsultingBooking::class, 'assigned_expert_id');
    }

    public function isAvailableForBooking($date, $time)
    {
        return !$this->consultingBookings()
            ->where('selected_date', $date)
            ->where('selected_time', $time)
            ->exists();
    }
} 