<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        ShippingMethod::create([
            'name' => 'Standard Shipping',
            'description' => '5-7 business days',
            'base_cost' => 1000.00,
            'estimated_days_min' => 5,
            'estimated_days_max' => 7,
            'priority' => 1
        ]);

        ShippingMethod::create([
            'name' => 'Express Shipping',
            'description' => '2-3 business days',
            'base_cost' => 2500.00,
            'estimated_days_min' => 2,
            'estimated_days_max' => 3,
            'priority' => 2
        ]);
    }
} 