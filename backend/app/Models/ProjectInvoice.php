<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProjectInvoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id',
        'invoice_number',
        'amount',
        'status',
        'due_date',
        'paid_at',
        'description',
        'payment_method',
        'transaction_reference',
        'file_path'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'datetime',
        'paid_at' => 'datetime'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
} 