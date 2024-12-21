<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HustlePayment;

class HustlePaymentSeeder extends Seeder
{
    public function run()
    {
        // Initial Payment (40% of 324068.00 = 129627.20)
        HustlePayment::create([
            'hustle_id' => '9dc5ebeb-1a2f-4b71-a823-2a45dae6071f',
            'professional_id' => '9dc5fe82-c87d-44dc-8912-fe130ae11331',
            'amount' => 129627.20,
            'payment_type' => 'initial',
            'status' => 'pending',
            'paid_at' => null
        ]);

        // Final Payment (60% of 324068.00 = 194440.80)
        HustlePayment::create([
            'hustle_id' => '9dc5ebeb-1a2f-4b71-a823-2a45dae6071f',
            'professional_id' => '9dc5fe82-c87d-44dc-8912-fe130ae11331',
            'amount' => 194440.80,
            'payment_type' => 'final',
            'status' => 'pending',
            'paid_at' => null
        ]);
    }
} 