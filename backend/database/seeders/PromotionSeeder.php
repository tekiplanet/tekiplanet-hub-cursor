<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        $promotions = [
            [
                'title' => 'Gaming Setup',
                'description' => 'Up to 30% off on gaming accessories',
                'image_url' => 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2',
                'background_color' => 'from-primary/80 to-primary/40',
                'text_color' => 'white',
                'button_text' => 'Learn More',
                'link' => '/dashboard/products?category=gaming',
                'is_active' => true,
                'order' => 1
            ],
            [
                'title' => 'Unique Powerstation',
                'description' => 'Complete setup starting from $999',
                'image_url' => 'https://images.unsplash.com/photo-1592833159155-c62df1b65634',
                'background_color' => 'from-secondary/80 to-secondary/40',
                'text_color' => 'white',
                'button_text' => 'Learn More',
                'link' => '/dashboard/products?category=powerstation',
                'is_active' => true,
                'order' => 2
            ]
        ];

        foreach ($promotions as $promotion) {
            Promotion::create($promotion);
        }
    }
} 