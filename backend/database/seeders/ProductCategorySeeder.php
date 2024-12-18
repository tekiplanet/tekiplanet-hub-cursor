<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Laptops',
                'description' => 'High-performance laptops for professionals and students',
                'icon_name' => 'laptop',
                'count' => 0
            ],
            [
                'name' => 'Desktop PCs',
                'description' => 'Custom built desktop computers for gaming and work',
                'icon_name' => 'monitor',
                'count' => 0
            ],
            [
                'name' => 'Powerstation',
                'description' => 'Portable power solutions for all your needs',
                'icon_name' => 'battery-charging',
                'count' => 0
            ],
            [
                'name' => 'Gaming',
                'description' => 'Gaming peripherals and accessories',
                'icon_name' => 'gamepad-2',
                'count' => 0
            ],
            [
                'name' => 'Accessories',
                'description' => 'Computer accessories and peripherals',
                'icon_name' => 'mouse',
                'count' => 0
            ],
        ];

        foreach ($categories as $category) {
            ProductCategory::create($category);
        }
    }
} 