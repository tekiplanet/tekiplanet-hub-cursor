<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Standard Shipping',
                'description' => 'Standard delivery within 3-5 business days',
                'base_cost' => 2000.00,
                'estimated_days_min' => 3,
                'estimated_days_max' => 5,
                'priority' => 1,
                'is_active' => true
            ],
            [
                'name' => 'Express Shipping',
                'description' => 'Express delivery within 1-2 business days',
                'base_cost' => 5000.00,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
                'priority' => 2,
                'is_active' => true
            ],
            [
                'name' => 'Same Day Delivery',
                'description' => 'Same day delivery for orders before 2PM',
                'base_cost' => 8000.00,
                'estimated_days_min' => 0,
                'estimated_days_max' => 1,
                'priority' => 3,
                'is_active' => true
            ]
        ];

        foreach ($methods as $method) {
            ShippingMethod::create($method);
        }
    }
} 