<?php

namespace Database\Seeders;

use App\Models\ConsultingSetting;
use Illuminate\Database\Seeder;

class ConsultingSettingsSeeder extends Seeder
{
    public function run(): void
    {
        ConsultingSetting::create([
            'hourly_rate' => 10000.00, // ₦10,000 per hour
            'overtime_rate' => 15000.00, // ₦15,000 per hour for overtime
            'cancellation_hours' => 24 // 24 hours cancellation policy
        ]);
    }
} 