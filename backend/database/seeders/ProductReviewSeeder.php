<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $users = User::all();

        foreach ($products as $product) {
            // Create 5-15 reviews per product
            $reviewCount = fake()->numberBetween(5, 15);
            
            for ($i = 0; $i < $reviewCount; $i++) {
                ProductReview::create([
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id,
                    'rating' => fake()->randomFloat(1, 3.0, 5.0),
                    'comment' => fake()->paragraph(),
                    'is_verified_purchase' => fake()->boolean(80) // 80% chance of being verified
                ]);
            }

            // Update product rating and review count
            $product->update([
                'rating' => $product->reviews()->avg('rating'),
                'reviews_count' => $product->reviews()->count()
            ]);
        }
    }
} 